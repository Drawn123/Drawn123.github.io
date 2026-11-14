---
knowledge_id: "notes-linux-02"
url: "/notes/linux/02-文件与目录管理/"
series_id: "linux"
series_order: 2
title: "【Linux】文件与目录管理常用命令"
date: 2026-10-16
lastmod: 2026-11-14
tags:
  - "notes: Linux"
weight: 20
pinned: false
draft: false
---

## 查看和创建目录

~~~bash
ls -lah
ls -lt logs/
ls -ld data/
mkdir -p logs outputs/run-01
touch logs/app.log
~~~

`ls -lah` 列出当前目录的详细信息，`-a` 包含隐藏项，`-h` 用易读的单位显示大小。`-lt` 按修改时间由新到旧排列，加 `-r` 可反转。`-d` 显示目录本身的权限和归属。要统计目录里的文件总占用，见[磁盘空间与挂载](knowledge:notes-linux-04)。

`mkdir -p` 一并创建缺失的父目录，也允许目录已存在。`touch` 创建空文件，如果文件已存在则更新访问和修改时间，保留原有内容。

## 复制、移动与删除

### 复制与备份

~~~bash
cp -i config.yaml config.yaml.bak
mkdir -p backup
cp -a project/. backup/
~~~

`cp -i` 在覆盖已有文件前询问。`cp -a` 递归复制，并尽可能保留权限、时间和符号链接等属性。`project/.` 把目录内容直接复制进 `backup/`，包括隐藏文件。`project/*` 默认会漏掉以点开头的名称。

只需递归复制时可以用 `cp -r src src-copy`。目标不存在时会新建 `src-copy`。目标已经是目录时，`src` 会复制到它下面，得到 `src-copy/src`。

### 移动与重命名

~~~bash
mv -i old.conf new.conf
mv -i app.log logs/
~~~

目标不存在时，`mv` 可以重命名。目标是已有目录时，源会被移入该目录。`-i` 会在覆盖前询问，移动目录沿用同样的命令形式。

### 删除

~~~bash
rm -i config.yaml.bak
pwd
ls -la build/
rm -rI -- build/
~~~

`rm` 直接删除文件。`-i` 对每个对象逐次询问。GNU `rm` 的 `-I` 在递归删除或一次删除超过三个文件时统一询问一次。`-r` 递归处理目录，执行前先核对当前路径和目录内容。`--` 结束选项解析，也可用于 `rm -- -notes.txt` 这类文件名。

## 查看日志和筛选文本

~~~bash
cat config.yaml
less -N logs/app.log
head -n 20 config.yaml
tail -n 100 logs/app.log
tail -n 100 -F logs/app.log
~~~

`cat` 直接输出文本。`less -N` 分页显示并标注行号，按 `G` 跳到末尾，输入 `/关键词` 搜索，用 `n` 查看下一处，按 `q` 退出。`head` 和 `tail` 分别读取开头和结尾的指定行数。

`tail -F` 按文件名跟踪日志。旧日志被改名、程序重新创建同名文件后，它会重试并跟踪新文件。`tail -f` 默认继续跟踪先前打开的文件。按 `Ctrl+C` 停止跟踪。

~~~bash
grep -ni 'error' logs/app.log
grep -nF -C 3 'Connection refused' logs/app.log
grep -rlF 'timeout_seconds' src/
tail -n 500 logs/app.log | grep -i 'error'
~~~

`-n` 显示行号，`-i` 忽略大小写，`-F` 按普通字符串匹配，`-C 3` 附带前后各三行。递归搜索用 `-r`，只想列出匹配文件时加 `-l`，所以第三条只输出文件名。筛掉匹配行可加 `-v`。

## 按文件名、大小或时间查找

~~~bash
find . -type f -name '*.log'
find . -maxdepth 2 -type f -iname '*config*'
find logs/ -type f -size +100M
find outputs/ -type f -mmin -60
~~~

`-type f` 限定普通文件，目录用 `-type d`。`-name` 区分大小写，`-iname` 忽略大小写。`-maxdepth 2` 将深度限制在两层，起点算第零层。`-size +100M` 匹配大于 100 MiB 的文件，`-mmin -60` 筛选最近 60 分钟内修改的文件。多个条件默认同时满足。名称模式加引号，让 `find` 去匹配每层目录中的名称。

## 打包、查看归档与解包

~~~bash
tar -czf project.tar.gz project/
tar -tzf project.tar.gz
mkdir -p restore
tar -xzf project.tar.gz -C restore/
~~~

`-c` 创建归档，`-t` 列出归档内容，`-x` 解包，三者每次选一个。`-z` 表示用 gzip，`-f` 后紧跟归档文件名。归档文件放在源目录外，避免把它本身打包进去。

`-C` 切换后续操作的目录，目标目录要事先存在。上例解包得到 `restore/project`。如果希望归档内直接是 `project` 的内容，执行 `tar -czf project.tar.gz -C project .`，隐藏文件也会一并写入归档。

## 在两台机器之间传文件

~~~bash
scp config.yaml user@server.example.com:~/project/
scp user@server.example.com:~/project/logs/app.log ./
rsync -av --partial data/ user@server.example.com:~/project/data/
~~~

前两条分别上传配置和下载日志。`scp` 指定 SSH 端口时用大写 `-P`。`rsync` 要求两端都安装了它，`-a` 递归同步并保留常用属性，`-v` 显示传输详情，`--partial` 保留传输中断时留下的部分文件。源路径带结尾的 `/` 时同步目录里的内容，省去这个 `/` 则会将目录本身作为一层复制过去。拿不准目录层级时，先加 `-n` 预览。

## 用符号链接引用文件

~~~bash
ln -s /data/datasets/v1 ./dataset
ls -l ./dataset
readlink -f ./dataset
~~~

假设当前目录下还没有 `dataset`，创建后可通过它访问 `/data/datasets/v1`。`ls -l` 显示链接里记录的目标，`readlink -f` 解析出绝对路径。相对目标以链接所在的目录为起点。目标移动或删除后，链接会留在原处，访问时会报找不到文件。
