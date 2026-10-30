---
knowledge_id: "notes-linux-04"
url: "/p/notes-linux-04/"
series_id: "linux"
series_order: 4
title: "【Linux】磁盘空间、分区与挂载管理"
description: "查看磁盘与文件系统、定位空间占用，以及数据盘的分区、挂载和开机配置。"
date: 2026-10-30
tags:
  - "notes: Linux"
weight: 40
draft: false
---

## 磁盘、分区、文件系统和挂载点

程序把文件保存到 `/data`，并不代表它一定写入了数据盘。`/data` 可以只是根文件系统中的一个普通目录，也可以是另一块盘的访问入口。要确定文件实际存放在哪里，需要看这个路径对应的挂载关系。

| 概念 | 含义 | 示例 |
| --- | --- | --- |
| 磁盘 | 提供块存储的设备 | `/dev/sdb` |
| 分区 | 在磁盘上划出的一段空间 | `/dev/sdb1` |
| 文件系统 | 在存储空间中组织文件、目录和元数据的方式 | ext4、XFS |
| 挂载点 | 文件系统接入目录树的位置 | `/data` |

例如，磁盘 `/dev/sdb` 上有一个分区 `/dev/sdb1`，分区中创建了 ext4 文件系统，再挂载到 `/data`。此后访问 `/data/datasets`，就是访问这个文件系统中的 `datasets` 目录。

分区、创建文件系统和挂载是不同的操作：分区划分空间，`mkfs` 创建文件系统，`mount` 把已有文件系统接入目录树。已有数据盘通常只需要确认文件系统并挂载，不能重新格式化。

下面的命令以 Ubuntu/Debian、Bash 和 GNU 工具为例。设备名、文件系统类型和 UUID 都要以实际查询结果为准。

## 查看设备和路径的对应关系

### lsblk 查看磁盘与分区

~~~bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
lsblk -f
~~~

第一条显式选择要显示的列；第二条侧重文件系统类型、卷标、UUID 和挂载点等信息。

示意输出：

~~~text
NAME     SIZE TYPE FSTYPE MOUNTPOINTS
sda      100G disk
├─sda1     1G part vfat   /boot/efi
└─sda2    99G part ext4   /
sdb      500G disk
└─sdb1   500G part ext4   /data
~~~

`disk` 表示整块磁盘，`part` 表示分区。这里 `/dev/sda2` 承载根文件系统，`/dev/sdb1` 挂载在 `/data`，两者的剩余空间分别计算。

常见设备名：

| 磁盘 | 对应分区示例 |
| --- | --- |
| `/dev/sda` | `/dev/sda1`、`/dev/sda2` |
| `/dev/vda` | `/dev/vda1`、`/dev/vda2` |
| `/dev/nvme0n1` | `/dev/nvme0n1p1`、`/dev/nvme0n1p2` |

`/dev/sdb` 这样的名称可能随设备检测顺序变化。写持久挂载配置时通常使用文件系统的 UUID。[mount(8)](https://man7.org/linux/man-pages/man8/mount.8.html)

### findmnt 确认某个路径位于哪里

~~~bash
findmnt -T /data
findmnt -T /srv/myapp/logs
findmnt -M /data
~~~

`-T` 查询一个路径所在的文件系统，路径可以是普通目录或文件；`-M` 则精确查询指定目录本身是否为挂载点。[findmnt(8)](https://man7.org/linux/man-pages/man8/findmnt.8.html)

例如，`findmnt -T /data` 显示来源是 `/dev/sda2`、挂载点是 `/`，说明 `/data` 仍在根文件系统中。如果 `/data` 应当挂载数据盘，就要先排查挂载状态，再启动向该目录写文件的程序。

没有挂载数据盘时，程序仍可能成功写入 `/data`，结果却占满了系统盘。仅检查目录是否存在，无法判断数据盘是否挂载。

## 查看容量与定位空间占用

### df 查看文件系统剩余空间

~~~bash
df -hT
df -hT /data
df -hT /srv/myapp/logs
~~~

| 选项 | 作用 |
| --- | --- |
| `-h` | 使用易读的容量单位 |
| `-T` | 显示文件系统类型 |
| `-i` | 查看 inode 的使用情况 |

`df` 后面指定路径时，显示该路径所在文件系统的容量。`df -hT /srv/myapp/logs` 统计的是整个文件系统，不是日志目录自身的大小。

示意输出：

~~~text
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/sdb1      ext4  492G  410G   57G  88% /data
~~~

`Size` 是文件系统总容量，`Used` 是已用空间，`Avail` 是可用空间，`Use%` 是使用比例。文件系统元数据、保留空间和显示时的取整会影响这些数值，不能要求三列直接相加完全对应。

### du 查看目录占用

确认哪个文件系统空间不足后，再用 `du` 找目录：

~~~bash
du -sh /data/datasets
du -xh --max-depth=1 /data | sort -hr
~~~

| 选项 | 作用 |
| --- | --- |
| `-s` | 只显示指定路径的汇总值 |
| `-h` | 使用易读的大小单位 |
| `-x` | 不进入其他文件系统 |
| `--max-depth=1` | 显示汇总及下一层目录的占用 |

`sort -hr` 按带单位的大小从大到小排序。发现 `/data/outputs` 占用较大后，再向下一层查看：

~~~bash
du -xh --max-depth=1 /data/outputs | sort -hr
~~~

直接把 `/data` 作为参数，会统计其中能够访问的隐藏项；写成 `/data/*` 时，普通 Bash 通配符默认不会展开隐藏项。遇到权限不足时，统计结果可能不完整，必要时用 `sudo du ...` 查看。

`du` 默认统计文件实际占用的存储空间，与 `ls -lh` 显示的文件逻辑长度不一定相同。例如稀疏文件中没有实际分配存储块的空洞，仍计入逻辑长度。

### 容量没满，也可能无法创建文件

~~~bash
df -h /data
df -i /data
~~~

inode 保存文件类型、权限、数据位置等元数据。对于 ext4，大量小文件可能先耗尽 inode，即使仍有可用的数据空间，也无法继续创建文件。

遇到 `No space left on device`，要同时看容量和 inode。如果 inode 使用率接近 `100%`，应检查缓存、临时目录或拆分后的小文件，而不只是寻找几个大文件。

### df 和 du 差很多时

`df` 查询文件系统的空间统计，`du` 遍历路径并累加能够访问的文件占用，两者的统计对象不同。

| 原因 | 排查方向 |
| --- | --- |
| 文件已删除，但进程仍打开它 | 查看已删除文件的打开记录 |
| `du` 无权访问部分目录 | 检查报错，使用具备权限的身份重新统计 |
| 挂载点遮住了原目录中的文件 | 检查挂载前是否已经向该目录写入数据 |
| 两次统计范围不同 | 确认路径对应的文件系统，并用 `du -x` 限制跨盘遍历 |

已安装 `lsof` 时，可以查看链接数已经变为零、仍被进程打开的文件：

~~~bash
sudo lsof +L1
~~~

日志文件被删除后，进程仍可能持有打开的文件描述符，继续向其中写入。普通情况下，要等最后一个引用关闭，文件占用的空间才会释放。处理时让对应服务按它支持的方式重新打开日志，或在允许中断服务时重启；随后再用 `df` 确认。

## 挂载与卸载已有数据盘

### 挂载到指定目录

先查看文件系统类型和 UUID：

~~~bash
lsblk -f
sudo blkid /dev/sdb1
~~~

假设已经确认 `/dev/sdb1` 是需要使用的数据分区，且 `/data` 是准备好的空目录：

~~~bash
sudo mkdir -p /data
sudo mount /dev/sdb1 /data
findmnt -M /data
df -hT /data
~~~

`mount` 通常可以识别文件系统类型；需要明确指定时，可写成 `sudo mount -t ext4 /dev/sdb1 /data`。

挂载会遮住挂载点原有的目录内容，原文件没有被删除，也没有被搬进数据盘。卸载后，这些原文件会重新可见，原先占用的系统盘空间也始终存在。因此，挂载前要查看目标目录，确认里面是否已有数据。

### 挂载后的读写权限

ext4 等文件系统挂载后，路径显示的是被挂载文件系统根目录的所有者和权限。挂载前对空目录设置的权限，不会自动变成数据盘里的权限。

~~~bash
ls -ld /data
sudo mkdir -p /data/myapp
sudo chown deploy:myapp /data/myapp
sudo chmod 2750 /data/myapp
~~~

这里沿用前一篇的 `deploy` 用户和 `myapp` 组，并假设它们已经存在。`deploy` 可管理该目录，`myapp` 组可读取和进入；setgid 使新建内容继承目录所属组。需要写日志时，应为服务另设可写目录，具体权限见[用户、用户组与权限管理](knowledge:notes-linux-03)。

### 卸载与 target is busy

~~~bash
cd /
sudo umount /data
~~~

命令名是 `umount`。卸载按挂载点执行，便于确认操作对象。

出现 `target is busy` 时，常见原因是终端的当前目录位于 `/data` 内，或者进程仍在使用其中的文件。先退出相关目录，再检查占用：

~~~bash
sudo fuser -vm /data
~~~

确认进程用途后，正常结束任务、关闭文件或停止对应服务，再重新卸载。卸载成功只解除目录与文件系统的连接，不会删除盘上的文件。

## 配置开机挂载

### 使用 UUID 写入 fstab

手动执行 `mount` 不会自动生成开机挂载配置。需要持久挂载时，先查询 UUID：

~~~bash
sudo blkid /dev/sdb1
~~~

示意输出：

~~~text
/dev/sdb1: UUID="a3c7201d-9e65-4ab1-b51e-6c8a15d4f202" TYPE="ext4"
~~~

备份并编辑 `/etc/fstab`：

~~~bash
sudo cp -a /etc/fstab /etc/fstab.bak
sudoedit /etc/fstab
~~~

加入一行，UUID 替换成实际值：

~~~fstab
UUID=a3c7201d-9e65-4ab1-b51e-6c8a15d4f202 /data ext4 defaults 0 2
~~~

六个字段以空格或制表符分隔：

| 字段 | 示例 | 含义 |
| --- | --- | --- |
| 挂载来源 | `UUID=...` | 定位文件系统 |
| 挂载点 | `/data` | 接入目录树的位置 |
| 文件系统类型 | `ext4` | 与实际文件系统一致 |
| 挂载选项 | `defaults` | 使用默认挂载选项 |
| dump 标记 | `0` | 不由 dump 按此字段安排备份 |
| 检查顺序 | `2` | 对该非根 ext4 文件系统安排启动检查 |

最后一列中，根文件系统通常使用 `1`，其他需要检查的文件系统使用 `2`，`0` 表示不按此字段安排检查。不同文件系统的检查机制有差异，不能把 ext4 的配置直接套给所有类型。[fstab(5)](https://man7.org/linux/man-pages/man5/fstab.5.html)

### 验证配置后再重启

~~~bash
sudo findmnt --verify --verbose
sudo systemctl daemon-reload
~~~

第一条检查挂载表配置；第二条用于 systemd 系统，让它重新读取相关配置。

然后在可以暂停访问数据盘时，卸载并仅按挂载点重新挂载：

~~~bash
sudo umount /data
sudo mount /data
findmnt -M /data
df -hT /data
~~~

只写 `mount /data` 时，命令从 `/etc/fstab` 查找来源、类型和选项。这样可以检查新记录是否可用；已经挂载成功的状态，本身不能证明新写入的配置正确。

`mount -a` 会尝试挂载 `/etc/fstab` 中符合条件的条目，范围不限于刚添加的数据盘，也不是单纯的语法检查。修改单个挂载点时，先做配置检查，再单独验证该挂载点更容易定位问题。

可拔插、缺失时允许继续启动的数据盘，可以按需使用 `nofail`。但系统能够继续启动，不代表依赖 `/data` 的程序能够直接运行；启动程序前仍应确认挂载成功，避免把文件写回系统盘的普通目录。

## 初始化一块新数据盘

### 确认设备后创建分区

以下只适用于确认不需要保留数据的新磁盘 `/dev/sdb`。建立新分区表和格式化都会改变盘上结构，操作前要结合容量、型号和挂载信息确认设备。

~~~bash
lsblk -o NAME,SIZE,MODEL,SERIAL,TYPE,FSTYPE,MOUNTPOINTS
sudo fdisk -l /dev/sdb
~~~

`fdisk -l` 列出分区信息，不会创建分区。文件系统类型为空、没有挂载点，也不能单独证明磁盘没有数据。

分区表常见 MBR 和 GPT。新数据盘一般使用 GPT，无需像 MBR 那样划分扩展分区和逻辑分区。

确认是目标新盘后，进入交互界面：

~~~bash
sudo fdisk /dev/sdb
~~~

创建一个使用整盘可用空间的 GPT 分区，可以按下面的顺序操作：

1. 输入 `g`，新建 GPT 分区表。
2. 输入 `n`，创建分区；分区号、起始扇区和结束扇区按提示采用默认值。
3. 输入 `p`，核对设备、分区范围和容量。
4. 确认无误后输入 `w`，写入分区表并退出；未写入前可用 `q` 放弃本轮修改。

保存后重新查看：

~~~bash
lsblk /dev/sdb
~~~

应能看到新分区 `/dev/sdb1`。若没有出现，先处理分区表重新读取的问题，不要继续格式化其他设备。对于 NVMe 磁盘，对应分区名可能是 `/dev/nvme1n1p1`。

### 创建 ext4 文件系统

确认新分区未挂载、没有需要保留的数据后：

~~~bash
sudo mkfs.ext4 /dev/sdb1
sudo blkid /dev/sdb1
~~~

`mkfs.ext4` 在目标分区中创建 ext4 文件系统。这里的对象是 `/dev/sdb1`，需要与前面的分区结果对应。不要为了跳过设备占用或已有文件系统的提示而加上强制参数。

随后按前面的步骤挂载、设置目录权限并配置 `/etc/fstab`。格式化通常会生成新的文件系统 UUID；重新格式化后，旧配置中的 UUID 也要重新核对。

### 扩容后检查文件系统容量

磁盘变大后，`lsblk` 显示的设备容量与 `df` 显示的文件系统容量可能不同。扩容通常涉及设备、分区或逻辑卷、文件系统等多个层次，底层容量增加不会自动保证上层已经扩展。

先用 `lsblk -f` 和 `df -hT` 确认当前布局和类型，再按对应文件系统的方式扩展；不要用重新执行 `mkfs` 的方式给已有数据盘扩容。

## 文件系统异常时的检查

文件写入失败时，先分清空间不足、权限不足和文件系统异常。前两种情况分别查看 `df`、目录权限；如果出现 `Read-only file system` 或 I/O 错误，再查看挂载选项和内核日志：

~~~bash
findmnt -T /data -o SOURCE,TARGET,FSTYPE,OPTIONS
sudo journalctl -k -n 100
~~~

`ro` 表示只读挂载，`rw` 表示读写挂载。如果内核报告设备或文件系统错误，需要先查明原因，不能只把挂载方式改回可写。

`fsck` 是调用相应文件系统检查工具的入口。对于 ext4，可在停止访问、成功卸载目标文件系统后检查：

~~~bash
sudo umount /data
sudo e2fsck -f /dev/sdb1
~~~

`-f` 表示即使文件系统标记为干净，也执行检查；它不表示强制卸载，也不等于自动同意所有修复。检查过程可能询问是否修改文件系统，应结合诊断信息处理。[e2fsck(8)](https://man7.org/linux/man-pages/man8/e2fsck.8.html)

检查修复针对未挂载的目标文件系统。根文件系统通常需要进入恢复环境处理；XFS 等其他文件系统也应使用各自的工具。

## 常用操作速查

| 目的 | 命令 |
| --- | --- |
| 查看磁盘、分区和文件系统 | `lsblk -f` |
| 查询路径所在的文件系统 | `findmnt -T /data` |
| 确认目录本身是否已挂载 | `findmnt -M /data` |
| 查看容量、类型和剩余空间 | `df -hT /data` |
| 查看 inode 使用情况 | `df -i /data` |
| 按大小查看下一层目录占用 | `du -xh --max-depth=1 /data` 配合 `sort -hr` |
| 查询分区 UUID | `sudo blkid /dev/sdb1` |
| 挂载已有文件系统 | `sudo mount /dev/sdb1 /data` |
| 按 fstab 配置挂载 | `sudo mount /data` |
| 检查 fstab 配置 | `sudo findmnt --verify --verbose` |
| 查看卸载占用 | `sudo fuser -vm /data` |
| 卸载文件系统 | `sudo umount /data` |
