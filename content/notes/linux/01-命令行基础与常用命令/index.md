---
knowledge_id: "notes-linux-01"
url: "/notes/linux/01-命令行基础与常用命令/"
series_id: "linux"
series_order: 1
title: "【Linux】命令行基础与常用命令"
date: 2026-10-11
lastmod: 2026-10-23
tags:
  - "notes: Linux"
weight: 10
pinned: false
draft: false
---

## 命令与 Shell

在终端输入命令后，Shell 会解析命令、展开变量和文件名，再执行对应的程序。Linux 上常见的 Shell 有 Bash、Zsh，下面的例子使用 Bash。

命令通常写成：

~~~text
命令名 [选项] [参数]
~~~

例如：

~~~bash
ls -lh /var/log
head -n 20 app.log
~~~

`ls` 列出目录内容，`-l` 显示详细信息，`-h` 使用易读的大小单位，`/var/log` 是目标目录。`head` 查看文件开头，`-n 20` 指定行数，`app.log` 是目标文件。

| 写法 | 含义 |
| --- | --- |
| `-l` | 短选项 |
| `--all` | 长选项 |
| `-n 20` | 选项后带一个值 |
| `ls -lh` | 将允许合并的短选项写在一起 |

帮助文档中的 `[ ]` 表示可选，`...` 表示可以重复，不需要原样输入。同一个字母在不同命令中可能有不同含义，例如 `ls -r` 反转排序，`cp -r` 递归复制目录。

## 路径、引号与通配符

### 当前目录和路径

命令使用相对路径时，以当前工作目录为起点。

~~~bash
pwd                    # 查看当前目录
cd ~/projects          # 进入主目录下的 projects
cd ..                  # 返回上一级目录
cd -                   # 返回上一次所在目录
cd                     # 回到主目录
~~~

| 写法 | 含义 |
| --- | --- |
| `/etc/hosts` | 绝对路径，从根目录 `/` 开始 |
| `src/main.cpp` | 相对路径，从当前目录开始 |
| `.` | 当前目录 |
| `..` | 上一级目录 |
| `~` | 当前用户的主目录 |

Linux 路径区分大小写。`cd src` 和 `cd Src` 可能进入不同目录。

### 引号

路径包含空格时，用引号把它作为一个参数传给命令：

~~~bash
cd "project files"
~~~

单引号和双引号对变量的处理不同：

~~~bash
echo '$HOME'            # 原样输出 $HOME
echo "$HOME"            # 输出 HOME 变量的值
~~~

变量用作路径时，通常加双引号：

~~~bash
project_dir="$HOME/projects/demo"
cd "$project_dir"
~~~

赋值时 `=` 两边不能加空格。`"$project_dir"` 展开后仍是一个参数，路径中的空格不会把它拆开。

### 通配符

~~~bash
ls *.log               # 当前目录中以 .log 结尾的名称
ls report?.txt         # ? 匹配一个字符
~~~

`*` 匹配任意多个字符，`?` 匹配一个字符。它们通常由 Shell 先展开为文件名，再传给命令；默认不匹配以 `.` 开头的隐藏名称。

如果要让命令自己处理匹配模式，就需要加引号：

~~~bash
find . -name '*.log'
~~~

这里将 `*.log` 原样交给 `find`，由它在目录树中查找。

## 管道与重定向

### 标准输入、标准输出和标准错误

| 编号 | 名称 | 用途 |
| --- | --- | --- |
| `0` | 标准输入 stdin | 程序读取输入 |
| `1` | 标准输出 stdout | 程序输出正常结果 |
| `2` | 标准错误 stderr | 程序输出错误或诊断信息 |

默认情况下，输出通常显示在终端中。管道和重定向可以改变这些数据的去向。

### 用管道连接命令

`|` 将前一条命令的标准输出交给后一条命令的标准输入：

~~~bash
grep -i 'error' app.log | wc -l
~~~

`grep -i` 忽略大小写，筛选包含 `error` 的行；`wc -l` 统计这些行的数量。这里统计的是匹配行数，一行中出现多次 `error` 仍只算一行。

再例如统计重复项：

~~~bash
sort names.txt | uniq -c | sort -nr
~~~

先排序，让相同内容相邻；`uniq -c` 合并相邻重复行并计数；最后按数量从大到小排序。`sort -n` 按数值比较，`-r` 反转顺序。

### 将输出保存到文件

~~~bash
python main.py > run.log              # 标准输出覆盖写入
python main.py >> run.log             # 标准输出追加写入
python main.py 2> error.log           # 标准错误写入单独文件
python main.py > run.log 2>&1         # 标准输出和错误写入同一文件
~~~

`>` 会在程序启动前创建或截断目标文件，`>>` 保留已有内容并追加。两者都不会自动创建缺失的父目录。

`2>&1` 表示让标准错误指向标准输出当时的位置。重定向按从左到右的顺序处理：

~~~bash
python main.py > run.log 2>&1
python main.py 2>&1 > run.log
~~~

第一条将两种输出都写入文件。第二条先让标准错误指向原来的标准输出，随后只把标准输出改到文件；在普通终端中，错误仍会显示在终端。

### 显示输出的同时保存

~~~bash
make 2>&1 | tee build.log
~~~

`tee` 将收到的内容同时写到终端和文件。默认覆盖目标文件，追加时使用 `tee -a build.log`。

Bash 默认使用管道最后一条命令的退出状态。这里 `tee` 成功不代表 `make` 成功，不能仅根据整条管道返回 `0` 判断构建通过。

## 根据执行结果组合命令

### 退出状态

命令结束后会返回退出状态，通常 `0` 表示成功，非 `0` 表示失败或其他情况。用 `$?` 查看上一条命令的退出状态：

~~~bash
ls /etc
echo "$?"
~~~

`$?` 要紧接着目标命令查看，中间执行其他命令会改变它。

### && 和 ||

| 写法 | 执行条件 |
| --- | --- |
| `A && B` | A 成功后执行 B |
| `A || B` | A 失败后执行 B |
| `A ; B` | A 结束后执行 B，不检查 A 是否成功 |

~~~bash
mkdir -p build && cd build
~~~

创建目录成功后才切换目录。如果目录创建失败，`cd build` 不会执行。

脚本中需要先进入指定目录再处理文件时，可以写成：

~~~bash
cd "$project_dir" || exit 1
~~~

切换目录失败就退出脚本，后面的操作不会在错误的目录中继续执行。

条件执行判断的是退出状态，不是命令有没有输出。例如 `grep` 找到匹配时返回 `0`，没有匹配时返回 `1`，发生错误时通常返回 `2`。

## 环境变量与命令查找

### 查看和设置变量

~~~bash
echo "$HOME"
echo "$PATH"
export APP_ENV=development
~~~

`export` 使变量进入随后启动的子进程环境。也可以只为一条命令设置：

~~~bash
APP_ENV=development python main.py
~~~

这种写法不会修改当前 Shell 后续命令使用的 `APP_ENV`。

### 命令找不到或调用了错误版本

~~~bash
command -v python
type python
~~~

`command -v` 查看命令会解析到哪里，`type` 可以进一步确认它是外部程序、别名、函数还是 Shell 内建命令。Python 版本不对时，先检查实际调用的路径。

查找普通外部命令时，Shell 会按 `PATH` 中的目录顺序搜索。将用户自己的程序目录放在前面：

~~~bash
export PATH="$HOME/.local/bin:$PATH"
~~~

这次修改作用于当前 Shell 及其随后启动的子进程。需要在以后的交互式 Bash 中使用时，可以将配置写入 `~/.bashrc`；修改后用 `source ~/.bashrc` 在当前 Shell 重新读取。

## 登录服务器和查看运行状态

### SSH 登录

~~~bash
ssh deploy@server.example.com
~~~

`deploy` 是远程用户名，主机名替换成实际服务器地址。登录后可以先确认当前环境：

~~~bash
hostname
whoami
pwd
cat /etc/os-release
~~~

它们分别查看主机名、当前有效用户、工作目录和发行版信息。退出远程 Shell 使用 `exit`。

### 进程和内存

~~~bash
ps aux
top
free -h
~~~

`ps aux` 查看进程快照，`top` 持续显示进程和资源占用，在 `top` 中按 `q` 退出。

`free -h` 以易读单位显示内存。判断内存是否紧张时关注 `available`，它估算了不使用交换空间时可供新应用使用的内存；不能只看 `free` 一列。

需要结束进程时，先确认进程号和命令，再发送终止信号：

~~~text
kill -TERM 进程号
~~~

`TERM` 允许程序处理信号并清理资源。只有程序确实无法正常结束时，再考虑 `KILL`，也就是 `kill -9`。

## 快捷键和帮助

| 操作 | 作用 |
| --- | --- |
| `Tab` | 补全命令或路径 |
| `↑`、`↓` | 查找最近执行的命令 |
| `Ctrl+R` | 按关键词搜索命令历史 |
| `Ctrl+C` | 中断前台任务 |
| `Ctrl+L` | 清理终端显示 |
| `Ctrl+D` | 空命令行时通常退出当前 Shell |

~~~bash
ls --help
man ls
help cd
~~~

`--help` 查看命令选项摘要，`man` 查看手册，`help` 查看 Bash 内建命令的帮助。`man` 中输入 `/关键词` 搜索，按 `n` 查看下一个匹配，按 `q` 退出。
