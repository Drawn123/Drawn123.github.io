---
knowledge_id: "notes-linux-01"
url: "/notes/linux/01-命令行基础与常用命令/"
series_id: "linux"
series_order: 1
title: "【Linux】命令行基础与常用命令"
date: 2026-10-11
lastmod: 2026-11-14
tags:
  - "notes: Linux"
weight: 10
pinned: false
draft: false
---

## 路径、引号与通配符

以下示例使用 Bash。每条命令由命令名、选项和参数组成。例如 `ls -lh /var/log` 中，`-l` 显示详细信息，`-h` 用易读的单位显示大小，`/var/log` 是要查看的目录。帮助中的 `[ ]` 表示可选，`...` 表示可重复。

~~~bash
pwd
cd ~/projects/demo
cd ..
cd -
~~~

`pwd` 显示当前工作目录。`cd ..` 进入上一级目录，`cd -` 返回切换前的目录，单独运行 `cd` 回主目录。从 `/` 开始的是绝对路径，相对路径从当前工作目录开始。`./run.sh` 就是当前目录中的 `run.sh`。Bash 会把未加引号、位于开头的 `~` 展开成主目录。

~~~bash
project_dir="$HOME/projects/demo files"
cd "$project_dir"
printf '%s\n' '$HOME' "$HOME"
~~~

赋值时 `=` 两侧紧贴变量名和值。单引号保留字符原样，双引号允许展开变量，并让带空格的路径仍作为一个参数传给命令。

~~~bash
ls ./*.log
find . -type f -name '*.log'
~~~

`*` 匹配任意长度的字符串，`?` 匹配一个字符。第一条中的模式由 Bash 展开，默认跳过以点开头的文件名。第二条加了引号，模式原样传给 `find`，由它在目录树里匹配。

## 管道与重定向

标准输入、标准输出和标准错误的编号分别是 `0`、`1`、`2`。管道把左侧命令的标准输出送到右侧的标准输入。

~~~bash
sort names.txt | uniq -c | sort -nr
~~~

`sort` 先让重复行相邻，`uniq -c` 合并相邻的相同行并计数，最后用 `sort -nr` 按次数从大到小排。

| 写法 | 作用 |
| --- | --- |
| `command < input.txt` | 从文件读标准输入 |
| `command > run.log` | 将标准输出覆盖写入文件 |
| `command >> run.log` | 将标准输出追加到文件 |
| `command 2> error.log` | 将标准错误覆盖写入文件 |
| `command > run.log 2>&1` | 将标准输出和标准错误写入同一个文件 |

Shell 会在启动程序前打开重定向的文件。`>` 会截断已有内容，父目录要事先建好。同一个输入文件和输出文件需要分别指定，否则文件可能在读之前就被清空。

`2>&1` 将标准错误接到标准输出**当时**的位置，所以 `python main.py 2>&1 > run.log` 先把错误留在原来的输出位置，再把标准输出改到日志文件。在交互终端执行时，错误仍显示在屏幕上。

~~~bash
set -o pipefail
make 2>&1 | tee build.log
~~~

`tee` 一边显示输入，一边写入文件。要追加则加 `-a`。Bash 默认取管道最后一条命令的退出状态，`tee` 成功时可能掩盖 `make` 的失败。启用 `pipefail` 后，管道取最右侧返回非零的命令状态。需要恢复默认行为时用 `set +o pipefail`。

## 根据上一条命令的结果执行

~~~bash
mkdir -p build && cd build
~~~

`&&` 左侧返回 `0` 后才执行右侧。`||` 的右侧则在左侧返回非零时执行。脚本开头可以写 `cd "$project_dir" || exit 1`，切换目录失败就退出。用 `$?` 查看刚执行完的命令的退出状态，中间执行其他命令会覆盖它。

`grep` 返回 `0` 表示有匹配，`1` 表示没有匹配，GNU `grep` 返回 `2` 表示出错。脚本需要区分这几种结果时，可保存 `$?` 再判断。

## 环境变量与命令查找

~~~bash
export APP_ENV=development
APP_ENV=production python main.py
~~~

`export` 将变量传给之后启动的子进程。第二行只在这次程序运行时覆盖 `APP_ENV`。程序结束后，当前 Shell 中的值仍是 `development`。

~~~bash
command -v python
type python
printf '%s\n' "$PATH"
~~~

`command -v` 显示 Shell 将如何找到命令，`type` 可进一步区分外部程序、内建命令、别名和函数。查找普通外部程序时，Shell 按 `PATH` 中目录的顺序搜索。把 `~/.local/bin` 加到前面后，可以再查一次命令位置。

~~~bash
export PATH="$HOME/.local/bin:$PATH"
command -v mytool
~~~

这次修改在当前 Shell 生效。后续交互式 Bash 也需要此配置时，可以将 `export` 写入 `~/.bashrc`，再运行 `source ~/.bashrc` 让当前终端重新读取。

## SSH 登录与查看进程

~~~bash
ssh user@server.example.com
hostname
whoami
pwd
~~~

登录后确认主机名、当前用户和工作目录。服务端使用其他端口时，可用 `ssh -p 2222 user@server.example.com`。退出远程 Shell 用 `exit`。

~~~bash
pgrep -af 'python.*main.py'
ps -p 12345 -o pid,user,etime,pcpu,pmem,args
top
free -h
~~~

`pgrep -af` 匹配完整命令行并列出进程号和参数。把 `12345` 换成查到的进程号，`ps` 可查看运行用户、已运行时间和资源占用。`top` 实时刷新，按 `q` 退出。`free -h` 中的 `available` 估算无需使用交换空间就能分配给新程序的内存。

结束自己启动的任务时，先确认进程号和命令，再用 `kill -TERM 12345` 发出终止信号，让程序有机会清理资源。若进程确实无法正常结束，可以用 `kill -KILL 12345`，进程没有清理文件或保存状态的机会。

## 查帮助

~~~bash
ls --help
man ls
help cd
~~~

`--help` 查看选项摘要，`man` 查看手册，`help` 用来查 Bash 内建命令。使用默认分页器阅读手册时，输入 `/关键词` 搜索，按 `n` 跳到下一处，按 `q` 退出。命令行中用 `Tab` 补全，`Ctrl+R` 搜索历史，`Ctrl+C` 中断前台任务。
