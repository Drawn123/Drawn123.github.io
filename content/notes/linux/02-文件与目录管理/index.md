---
knowledge_id: "notes-linux-02"
url: "/notes/linux/02-文件与目录管理/"
series_id: "linux"
series_order: 2
title: "【Linux】文件与目录管理常用命令"
date: 2026-10-16
lastmod: 2026-10-23T12:54:58+08:00
tags:
  - "notes: Linux"
weight: 20
pinned: false
draft: false
---

## 查看目录

### pwd 和 cd

~~~bash
pwd
cd ~/projects/demo
cd ..
cd -
~~~

`pwd` 显示当前工作目录，`cd` 切换目录。`..` 是上一级目录，`cd -` 返回上一次所在的目录，单独执行 `cd` 回到主目录。

相对路径以当前目录为起点。复制、移动或删除文件前，可以先用 `pwd` 确认位置。

### ls 查看目录内容

~~~text
ls [选项] [路径...]
~~~

不指定路径时，查看当前目录。

| 选项 | 作用 |
| --- | --- |
| `-l` | 显示权限、所有者、大小、修改时间等信息 |
| `-a` | 包含隐藏项 |
| `-h` | 使用易读的大小单位，常与 `-l` 一起使用 |
| `-t` | 按修改时间从新到旧排序 |
| `-r` | 反转排序顺序 |
| `-d` | 显示目录本身的信息，而不是列出其内容 |

~~~bash
ls -lah
ls -lt logs/
ls -ld /srv/myapp
~~~

`ls -l` 默认显示修改时间，不是创建时间。目录那一行的大小也不是目录下所有文件的总大小；查看目录占用使用 `du`。

## 创建目录和文件

### mkdir 创建目录

~~~bash
mkdir build
mkdir -p project/src project/logs
~~~

`-p` 创建缺失的父目录，目录已经存在时不报错。项目初始化或脚本中通常使用 `mkdir -p`。

### touch 创建空文件

~~~bash
touch README.md
touch logs/app.log
~~~

文件不存在时，`touch` 创建空文件；文件已经存在时，只更新时间，不清空内容。它不会创建父目录，所以上例中的 `logs` 需要先存在。

## 复制、移动与删除

### cp 复制文件和目录

~~~text
cp [选项] 源路径 目标路径
cp [选项] 源路径... 目标目录
~~~

| 选项 | 作用 |
| --- | --- |
| `-r` | 递归复制目录 |
| `-a` | 递归复制，并尽可能保留权限、时间和符号链接等属性 |
| `-i` | 覆盖已有文件前询问 |

修改配置前先留一份备份：

~~~bash
cp -i config.yaml config.yaml.bak
~~~

复制整个目录：

~~~bash
cp -r src src-copy
~~~

如果 `src-copy` 不存在，会创建它并复制 `src` 的内容；如果它已经是目录，通常会得到 `src-copy/src`。

想把项目目录中的内容复制到一个备份目录，可以写成：

~~~bash
mkdir -p backup
cp -a project/. backup/
~~~

`project/.` 表示复制 `project` 内的内容，包含隐藏文件，最终不会再套一层 `project`。如果只写 `project/*`，默认会漏掉 `.env`、`.gitignore` 等隐藏项。

`-a` 适合保留原属性的备份；部署到不同用户管理的目录时，还要检查复制后的归属和权限。

### mv 移动和重命名

~~~bash
mv old.conf new.conf
mv -i app.log logs/
mv src source
~~~

目标不存在时，通常相当于重命名；目标是已有目录时，源文件或源目录会移入其中。上例中，只有 `source` 不存在时，第三条才会将 `src` 重命名为 `source`。

移动目录不需要加 `-r`。可能覆盖已有目标时，可以加 `-i`。

### rm 删除文件和目录

~~~bash
rm old.log
rm -i config.yaml.bak
rm -rI build/
~~~

| 选项 | 作用 |
| --- | --- |
| `-r` | 递归删除目录及其内容 |
| `-i` | 每次删除前询问 |
| `-I` | 删除超过三个文件或递归删除时，先统一询问一次 |
| `-f` | 不询问，忽略目标不存在的情况 |

`rm` 删除的文件不进入桌面回收站。`-f` 不会绕过权限检查，`rm -rf` 则会递归删除且不询问。

清理构建目录前，先确认它的位置和内容：

~~~bash
pwd
ls -ld build
ls -la build
~~~

对于名称以 `-` 开头的文件，用 `--` 结束选项解析，例如 `rm -- -notes.txt`。

## 查看文件与日志

### cat 查看短文本，less 查看长文本

~~~bash
cat config.yaml
cat -n start.sh
less -N logs/app.log
~~~

`cat` 直接输出文件内容，`-n` 显示行号。长日志使用 `less` 分页查看，避免一次输出大量内容。

| less 中的按键 | 作用 |
| --- | --- |
| 空格、`b` | 向下、向上翻页 |
| `g`、`G` | 跳到文件开头、末尾 |
| `/关键词` | 搜索，输入后按回车 |
| `n`、`N` | 下一个、上一个匹配 |
| `q` | 退出 |

`less -N` 的 `N` 是大写，表示显示行号。

### head 和 tail 查看头尾

~~~bash
head -n 20 config.yaml
tail -n 100 logs/app.log
~~~

`head` 查看文件开头，`tail` 查看结尾，`-n` 指定行数；不指定时默认显示 10 行。

跟踪正在写入的日志：

~~~bash
tail -n 100 -F logs/app.log
~~~

先显示最后 100 行，再持续输出新增内容，按 `Ctrl+C` 结束。

`tail -f` 默认跟踪已经打开的文件；日志轮转时，旧文件可能被改名并生成新的同名文件。`-F` 按文件名跟踪并重试，更适合这种情况。

### grep 搜索内容

~~~text
grep [选项] 模式 [文件...]
~~~

| 选项 | 作用 |
| --- | --- |
| `-n` | 显示行号 |
| `-i` | 忽略大小写 |
| `-r` | 递归搜索目录 |
| `-F` | 将模式按普通字符串处理 |
| `-C N` | 同时显示匹配行前后各 N 行 |
| `-v` | 输出不匹配的行 |

~~~bash
grep -ni 'error' logs/app.log
grep -nF -C 3 'Connection refused' logs/app.log
grep -rnF 'TODO' src/
~~~

第二条连同前后各 3 行一起显示，便于查看报错前后的操作。查找具体报错、配置值或代码片段时，`-F` 可以避免 `.`、`[` 等字符被当作正则表达式。

只查看最近 500 行中的错误：

~~~bash
tail -n 500 logs/app.log | grep -i 'error'
~~~

`grep` 返回 `0` 表示找到匹配，`1` 表示没有匹配，发生错误时通常返回 `2`。没有输出不一定是命令执行失败。

## 查找文件

`find` 按文件名和属性遍历目录，`grep` 检索文件中的文本。

~~~text
find 搜索路径 [条件]
~~~

~~~bash
find . -type f -name '*.log'
find . -type f -iname '*config*'
find . -maxdepth 2 -type d -name build
find logs/ -type f -size +100M
~~~

| 条件 | 含义 |
| --- | --- |
| `-type f` | 普通文件 |
| `-type d` | 目录 |
| `-name '模式'` | 按名称匹配，区分大小写 |
| `-iname '模式'` | 按名称匹配，忽略大小写 |
| `-maxdepth 2` | 最多查到两层，起点深度为 0 |
| `-size +100M` | 文件大小大于 100 MiB |

模式要加引号，将 `*.log` 原样交给 `find`。多个条件默认按“且”组合。

搜索时尽量指定项目目录或日志目录，避免每次都从 `/` 开始遍历。

## 查看磁盘和目录占用

~~~bash
df -h .
du -sh .
du -h --max-depth=1 .
~~~

`df -h .` 查看当前路径所在文件系统的容量和剩余空间；`du -sh .` 汇总当前目录占用；`du -h --max-depth=1 .` 分别查看当前目录及下一层子目录的占用。

想按大小查找占空间的子目录，可以排序：

~~~bash
du -h --max-depth=1 . | sort -hr
~~~

`sort -h` 识别 `K`、`M`、`G` 等大小单位，`-r` 从大到小排列。`du` 通常统计文件实际占用的空间，与 `ls -l` 显示的文件长度可能不同。

## 打包与解包

### tar 处理项目归档

~~~bash
tar -czf project.tar.gz project/
tar -tzf project.tar.gz
mkdir -p restore
tar -xzf project.tar.gz -C restore/
~~~

| 选项 | 作用 |
| --- | --- |
| `-c` | 创建归档 |
| `-x` | 解包 |
| `-t` | 列出归档内容 |
| `-z` | 使用 gzip 压缩或解压 |
| `-f 文件` | 指定归档文件 |
| `-C 目录` | 在指定目录中执行后续操作 |

`-c`、`-x`、`-t` 每次选择一种。`-f` 后紧跟归档文件名，`-C` 后的目录需要已经存在。

上例归档包含顶层 `project`，解包后得到 `restore/project`。解包前先用 `tar -tzf` 查看内容，可以确认内部目录层级。归档文件放在源目录之外，避免把它自身打包进去。

如果希望归档内直接是项目内容，不带顶层 `project` 目录：

~~~bash
tar -czf project.tar.gz -C project .
~~~

这里先进入 `project`，再归档其中的 `.`，隐藏文件也会包含在内。

## 创建符号链接

符号链接保存另一个路径，常用于配置文件引用和部署目录组织。

~~~text
ln -s 目标路径 链接路径
~~~

~~~bash
ln -s /srv/myapp/releases/v1 /srv/myapp/current
ls -l /srv/myapp/current
~~~

这里假定 `current` 尚不存在。创建后，通过 `/srv/myapp/current` 可以访问 `/srv/myapp/releases/v1`。

目标写成相对路径时，以链接所在目录为基准解析。例如链接位于 `/srv/myapp/current`，目标写成 `releases/v1`，指向的仍是 `/srv/myapp/releases/v1`。目标路径不存在时，链接仍可创建，但无法通过它访问目标。
