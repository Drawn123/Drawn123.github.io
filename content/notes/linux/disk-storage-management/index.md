---
knowledge_id: "notes-linux-04"
url: "/p/notes-linux-04/"
series_id: "linux"
series_order: 4
title: "【Linux】磁盘空间、分区与挂载管理"
description: "用 df 和 du 定位空间占用，检查磁盘、挂载点与开机挂载配置。"
date: 2026-10-30
lastmod: 2026-11-14
tags:
  - "notes: Linux"
weight: 40
draft: false
---

## 查看剩余空间

~~~bash
df -hT /data
df -i /data
~~~

`df` 显示指定路径所在的文件系统。`-h` 使用易读的容量单位，`-T` 显示类型，`-i` 显示 inode 用量。路径对应哪个文件系统，可以看输出中的 `Mounted on` 列。判断还能写入多少数据，主要看 `Avail`。

遇到 `No space left on device` 时，容量和 inode 都要查。ext4 上大量小文件可能先耗尽 inode，这时即使还有容量，也无法继续创建文件。

## 找出占用空间的目录

~~~bash
du -sh /data/datasets
du -xh --max-depth=1 /data | sort -hr
~~~

`du -sh` 汇总指定目录的占用。`--max-depth=1` 显示起点及下一层目录的占用，`-x` 限制在同一文件系统，`sort -hr` 按带单位的大小从大到小排序。看到 `/data/outputs` 占用较大后，把路径换成它再查一层。

`du /data` 会遍历可访问的隐藏项。命令如果写成 `du /data/*`，Bash 默认跳过以点开头的名称。`du` 默认统计实际分配的空间，稀疏文件的这个数值可能小于 `ls -lh` 显示的文件长度。

### df 和 du 差得多

先确认 `du` 的起点覆盖了要比较的文件系统，并留意权限错误。还有一种情况是日志删了，写入它的进程仍打开着原来的文件。装有 `lsof` 时，可用以下命令找出链接数为零、仍被打开的文件。

~~~bash
sudo lsof +L1
~~~

最后一个文件引用关闭后，空间才会释放。找到对应进程后，可以让它按支持的方式重新打开日志，或在允许中断时重启服务，再用 `df` 检查。有数据盘覆盖的目录时，还要考虑挂载前写在原目录里的文件，它们仍占原文件系统的空间。

## 确认磁盘和挂载位置

~~~bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,UUID,MOUNTPOINTS
findmnt -T /data
findmnt -M /data
~~~

`lsblk` 列出磁盘、分区及文件系统。整块盘可能叫 `/dev/sdb`，其分区是 `/dev/sdb1`。NVMe 设备的对应写法例如 `/dev/nvme1n1` 和 `/dev/nvme1n1p1`。`findmnt -T` 查询路径所在的文件系统，`findmnt -M` 查询这个目录本身是否为挂载点。[findmnt 手册](https://man7.org/linux/man-pages/man8/findmnt.8.html)

例如 `findmnt -T /data` 显示的挂载点是 `/`，说明写入 `/data` 的文件会占用根文件系统。启动写数据的程序前，可以用 `findmnt -M /data` 确认数据盘已经挂在这里。

## 挂载与卸载已有数据盘

假设已通过 `lsblk -f` 确认 `/dev/sdb1` 是要使用的分区。先建好 `/data`，确认其中没有需要访问的原有文件，再挂载。

~~~bash
sudo mkdir -p /data
sudo mount /dev/sdb1 /data
findmnt -M /data
df -hT /data
~~~

`mount` 把分区中的文件系统接入目录树。需要显式指定类型时，例如 `sudo mount -t ext4 /dev/sdb1 /data`。挂载后原目录的内容会被临时遮住，卸载后重新可见。挂载后修改权限时，用 `ls -ld /data` 查看当前文件系统根目录的归属，再按需创建数据子目录并设置权限。具体命令见[用户、用户组与文件权限](knowledge:notes-linux-03)。

~~~bash
cd /
sudo umount /data
~~~

出现 `target is busy` 时，用 `sudo fuser -vm /data` 查看哪些进程在使用这个文件系统。检查终端是否还停在 `/data` 或其子目录，也可以先关掉正在读写文件的程序，再重试卸载。

## 按 UUID 配置开机挂载

设备名可能随识别顺序变动。用 `lsblk -f` 或 `sudo blkid /dev/sdb1` 查文件系统的 UUID。备份配置后再编辑。

~~~bash
sudo cp -ai /etc/fstab /etc/fstab.bak
sudoedit /etc/fstab
~~~

以 ext4 数据分区为例，把例子中的 UUID 换成实际值，挂载点应事先建好。

~~~fstab
UUID=a3c7201d-9e65-4ab1-b51e-6c8a15d4f202 /data ext4 defaults 0 2
~~~

前四列是来源、挂载点、文件系统类型和挂载选项。第五列填 `0` 时跳过 dump 备份。第六列用于开机检查，ext4 根文件系统通常填 `1`，其余要检查的 ext4 文件系统填 `2`，填 `0` 跳过。可缺席的数据盘可用 `defaults,nofail`，依赖该数据盘的程序在启动前仍需确认挂载状态。[fstab 手册](https://man7.org/linux/man-pages/man5/fstab.5.html)

~~~bash
sudo findmnt --verify --verbose
sudo systemctl daemon-reload
~~~

第一条检查挂载表。使用 systemd 时执行第二条来重载配置。确认可以暂时停止访问后，先用 `sudo umount /data` 卸载，再用 `sudo mount /data` 测试刚写入的条目。只传挂载点时，`mount` 从 `/etc/fstab` 读取来源和选项。最后用 `findmnt -M /data` 检查实际挂载位置。

## 初始化空数据盘

以下示例中的 `/dev/sdb` 是已经确认可以清空的新数据盘。用型号、序列号、容量和当前分区信息核对设备。写入新的分区表或格式化会破坏原有数据。

~~~bash
lsblk -o NAME,SIZE,MODEL,SERIAL,FSTYPE,MOUNTPOINTS
sudo fdisk -l /dev/sdb
sudo fdisk /dev/sdb
~~~

在 `fdisk` 中，`g` 新建 GPT 分区表，`n` 新建分区。让一个分区使用可用空间时，可采用默认的起止扇区。用 `p` 核对分区，确认后用 `w` 写入，写入前可用 `q` 退出。

~~~bash
lsblk /dev/sdb
sudo mkfs.ext4 /dev/sdb1
sudo blkid /dev/sdb1
~~~

确认 `/dev/sdb1` 是刚创建且未挂载的分区，再执行 `mkfs.ext4`。文件系统创建后即可挂载。已有数据盘扩容时，先用 `lsblk` 和 `df -hT` 分别确认哪个层次的容量需要调整。

## 处理只读挂载和 I/O 错误

~~~bash
findmnt -T /data -o SOURCE,FSTYPE,OPTIONS
sudo journalctl -k -n 100
~~~

`OPTIONS` 中的 `ro` 表示只读，`rw` 表示读写。`journalctl -k -n 100` 在使用 systemd 的系统上显示最近 100 条内核日志。看到设备 I/O 错误时，应先确认设备状态。确认需要检查 ext4 文件系统后，停止读写，卸载成功，再执行检查。

~~~bash
sudo umount /data
sudo e2fsck -f /dev/sdb1
~~~

`-f` 即使文件系统已标记为干净也会检查。工具可能询问是否修复，按实际诊断信息处理。根文件系统通常要在恢复环境中检查，XFS 等文件系统使用各自的检查工具。[e2fsck 手册](https://man7.org/linux/man-pages/man8/e2fsck.8.html)
