---
knowledge_id: "notes-linux-01"
url: "/notes/linux/01-命令行基础与常用命令/"
series_id: "linux"
series_order: 1
title: "【Linux】命令行基础与常用命令"
date: 2026-10-11
lastmod:
tags:
  - "notes: Linux"
weight: 10
pinned: false
draft: false
---

## Linux 命令行基础

Linux 命令行的核心是 Shell。它接收用户输入，解析命令，再调用相应程序完成文件管理、文本处理、进程控制和系统配置。

这篇笔记以 Bash 为例，重点说明：

- 命令名、选项和参数分别是什么；
- 常见命令的英文来源、含义和基本用法；
- 如何用管道、重定向和条件执行组合命令。

## 终端、Shell 与路径

### 三个概念

| 名称 | 作用 |
| --- | --- |
| 终端 Terminal | 提供输入和输出界面，也就是命令行窗口。 |
| Shell | 命令解释器，负责解析命令、展开变量和通配符，并启动程序。 |
| Linux 内核 | 管理进程、内存、文件、设备和网络等系统资源。 |

终端不是 Shell，Shell 也不是 Linux 内核。同一个终端可以运行 Bash、Zsh 等不同 Shell。

~~~bash
echo "$SHELL"        # 查看登录 Shell
ps -p $$ -o comm=     # 查看当前 Shell 进程名
cat /etc/shells       # 查看系统登记的 Shell
~~~

常见提示符：

~~~text
user@host:~/project$
│    │       │       └─ $ 通常表示普通用户，# 通常表示 root
│    │       └──────── 当前目录，~ 表示主目录
│    └──────────────── 主机名
└───────────────────── 用户名
~~~

提示符可以自定义，不能只根据 $ 或 # 判断权限。使用 whoami、pwd 和 hostname 确认当前环境。

### 路径

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| / 开头 | 绝对路径，从根目录开始 | /etc/hosts |
| 不以 / 开头 | 相对路径，相对于当前目录 | notes/todo.md |
| . | 当前目录 | ls . |
| .. | 上一级目录 | cd .. |
| ~ | 当前用户的主目录 | cd ~ |
| - | cd 中表示上一次目录 | cd - |

文件名区分大小写。路径中有空格时使用引号：

~~~bash
cd "project files"
~~~

## 命令的组成

### 基本格式

~~~text
命令名 [选项] [参数]
~~~

方括号表示可选内容，不是要原样输入的字符。

| 部分 | 含义 | 示例 |
| --- | --- | --- |
| 命令名 | 指定要执行的程序或 Shell 内建命令 | ls |
| 选项 option | 改变命令的行为 | -l、--all |
| 参数 argument | 指定处理对象，或给选项提供值 | /etc、file.txt |

例如 ls -l /etc 中，ls 是命令名，-l 是选项，/etc 是参数。选项和参数能否省略、顺序如何安排，由具体命令决定。

### 选项的形式

~~~bash
ls -l                 # 短选项
ls -a -l              # 分开写多个短选项
ls -al                # 部分命令允许合并短选项
ls --all              # 长选项
head -n 10 file.txt   # 选项后带一个值
head --lines=10 file.txt
~~~

常见类型：

- 开关型选项：出现即启用某种行为，例如 ls -a。
- 带值选项：选项后还要提供一个值，例如 head -n 10。
- 长选项：使用完整名称，例如 --human-readable。
- 可重复选项：部分命令允许重复使用，具体要看手册。

同一个字母在不同命令中含义可能不同。例如 -r 在 cp 中表示递归复制，在 sort 中表示逆序排序。

### 如何阅读手册格式

~~~text
grep [OPTION]... PATTERNS [FILE]...
cp [OPTION]... SOURCE... DIRECTORY
~~~

| 写法 | 含义 |
| --- | --- |
| [内容] | 可选内容 |
| ... | 前面的内容可以重复 |
| 大写单词 | 需要替换成实际值的占位符 |
| A \| B | 在 A 和 B 中选择一个 |
| -- | 后面的内容不再解析为选项，而作为参数 |

例如处理名称以 - 开头的文件：

~~~bash
rm -- -notes.txt
~~~

### 引号、通配符和命令查找

~~~bash
echo '$HOME'        # 单引号：不展开变量
echo "$HOME"        # 双引号：展开变量，但整体作为一个参数
ls *.txt            # * 匹配任意多个字符
ls report?.txt      # ? 匹配一个字符
type cd             # 查看命令类型
command -v python   # 查看命令实际位置
~~~

Shell 会先展开通配符，再把结果传给命令。

## 文件和目录

### 命令速查

| 命令 | 全称或来源 | 作用 |
| --- | --- | --- |
| pwd | print working directory | 显示当前工作目录 |
| ls | list | 列出目录内容 |
| cd | change directory | 切换目录，Shell 内建命令 |
| mkdir | make directory | 创建目录 |
| touch | 更新文件时间；不存在时创建空文件 | 创建空文件或更新时间 |
| cp | copy | 复制文件或目录 |
| mv | move | 移动文件或重命名 |
| rm | remove | 删除文件或目录 |
| cat | concatenate | 输出或连接文件内容 |
| less | 分页查看器 | 分页查看长文本 |
| head / tail | 文件头 / 文件尾 | 查看开头或结尾内容 |
| find | find | 按条件查找文件 |
| file | file type | 判断文件类型 |
| wc | word count | 统计行数、单词数和字节数 |

### 常见选项速查

| 命令 | 选项 | 含义 |
| --- | --- | --- |
| `ls` | `-l` | long，显示详细信息 |
| `ls` | `-a` | all，包含隐藏文件 |
| `ls` | `-h` | human-readable，以易读单位显示大小，通常和 `-l` 一起使用 |
| `ls` | `-t` | 按修改时间排序 |
| `cp` | `-r` / `-R` | recursive，递归复制目录 |
| `cp` | `-i` | interactive，覆盖前询问 |
| `rm` | `-r` / `-R` | 递归删除目录及其内容 |
| `rm` | `-i` | 删除前逐项询问 |
| `rm` | `-f` | force，忽略不存在的文件并减少询问，使用前确认目标 |
| `mkdir` | `-p` | parents，自动创建不存在的父目录 |
| `grep` | `-i` | ignore case，忽略大小写 |
| `grep` | `-n` | 显示匹配行的行号 |
| `grep` | `-r` / `-R` | 递归搜索目录 |
| `grep` | `-v` | 输出不匹配的行 |
| `head` / `tail` | `-n` | 指定显示的行数 |
| `tail` | `-f` | follow，持续显示文件新增内容 |
| `sort` | `-r` | reverse，逆序排列 |
| `sort` | `-n` | 按数值排序 |
| `wc` | `-l` | 统计行数 |
| `chmod` | `u`、`g`、`o` | 分别表示所有者、所属组、其他人 |

这些选项只表示常见用法，不代表命令支持的全部选项。需要完整列表时，应查看 `命令 --help` 或 `man 命令`。

### 基本用法

~~~bash
pwd
ls
ls -l                 # long listing，详细信息
ls -a                 # all，包含隐藏文件
ls -lh                # human-readable，易读单位
ls -lt                # 按修改时间排序
ls -la /var/log       # 查看指定目录

cd /etc
cd ..
cd -                  # 返回上一次目录
cd                    # 回到主目录

mkdir -p project/src  # parents，连同父目录创建
touch notes.txt
cp notes.txt notes.bak
cp -r project project.bak  # recursive，递归复制目录
mv notes.bak backup.txt
rm backup.txt
rm -r project.bak
~~~

rm 删除后通常不能直接恢复。使用 rm -rf 前先用 pwd 和 ls -la 确认目标路径。

### 查看和查找文件

~~~bash
cat config.ini
less /var/log/syslog
head -n 20 access.log
tail -n 50 access.log
tail -f app.log              # follow，持续追踪新增内容
file archive.tar
wc -l notes.txt

find . -name '*.md'
find /var/log -type f -name '*.log'
find . -type f -size +10M
find . -type f -mtime -1
~~~

在 less 中，空格翻页，/关键词搜索，n 查看下一个匹配，q 退出。

find 的基本结构：

~~~text
find 搜索路径 [条件] [动作]
~~~

## 文本处理

| 命令 | 全称或来源 | 作用 |
| --- | --- | --- |
| grep | global regular expression print | 按模式筛选文本行 |
| sort | sort | 排序 |
| uniq | unique | 合并相邻重复行 |
| cut | cut | 按列或字符截取 |
| tr | translate | 替换或删除字符 |
| sed | stream editor | 流式查找、替换和编辑 |
| awk | awk 文本处理语言 | 按列处理结构化文本 |

~~~bash
grep 'error' app.log
grep -n -i 'warning' app.log    # 行号；忽略大小写
grep -r 'TODO' src/              # 递归搜索目录
grep -v '^#' config.ini          # 排除注释行

sort names.txt
sort names.txt | uniq
sort names.txt | uniq -c         # 统计每项出现次数
cut -d: -f1 /etc/passwd          # 以 : 分隔，取第 1 列
~~~

uniq 只处理相邻重复行，需要时先 sort。

## 管道、重定向与命令组合

### 三种标准流

| 编号 | 名称 | 默认位置 |
| ---: | --- | --- |
| 0 | 标准输入 stdin | 键盘或上一个命令 |
| 1 | 标准输出 stdout | 终端 |
| 2 | 标准错误 stderr | 终端 |

### 管道和重定向

~~~text
命令1 | 命令2                  # stdout → stdin
命令 > file                    # 覆盖写入
命令 >> file                   # 追加写入
命令 < file                    # 从文件读取
命令 2> error.log              # 重定向错误
命令 > result.log 2>&1         # 输出与错误写入同一文件
~~~

~~~bash
grep -i 'error' app.log | wc -l
ls /etc /not-exist > output.txt 2> error.txt
make 2>&1 | tee build.log
~~~

重定向从左到右处理：

~~~bash
command > result.txt 2>&1      # 输出和错误都进入文件
command 2>&1 > result.txt      # 错误可能仍显示在终端
~~~

tee 可以在保存输出的同时继续显示。

### 条件执行和退出状态

| 写法 | 含义 |
| --- | --- |
| A ; B | A 结束后执行 B，不论 A 是否成功 |
| A && B | A 成功时才执行 B |
| A || B | A 失败时才执行 B |

~~~bash
mkdir -p build && cd build
test -f config.ini && echo '配置文件存在'
cd /not-exist || echo '目录切换失败'

ls /etc
echo "$?"                    # 查看上一条命令的退出状态
~~~

0 通常表示成功，非 0 表示失败或其他状态。

### Here Document 和命令替换

~~~bash
cat > note.txt <<'EOF'
Linux
Shell
Command line
EOF

today=$(date +%F)
echo "今天是 $today"
echo "当前目录：$(pwd)"
~~~

写成 <<'EOF' 时，正文中的变量和命令替换不会展开；写成 <<EOF 时则会展开。

## 权限、用户和进程

### 权限和所有者

~~~bash
ls -l script.sh
chmod u+x script.sh       # user，所有者增加执行权限
chmod 644 notes.txt       # 所有者读写，其他人只读
chown user:group file     # change owner，修改所有者和所属组
~~~

权限中的 r、w、x 分别表示读、写、执行，按“所有者、所属组、其他人”排列。数字权限中 r=4、w=2、x=1，所以 755 表示所有者 rwx，其他人 r-x。

### sudo

sudo 通常解释为 superuser do，用于按授权规则以其他用户身份执行命令，默认目标用户是 root。

~~~bash
sudo command
sudo -l                 # 查看当前用户可使用的 sudo 权限
~~~

sudo 不会自动让外层 Shell 的重定向获得权限。例如 sudo echo text > /protected/file 中，> 仍由当前用户的 Shell 处理。

### 进程

| 命令 | 全称或来源 | 作用 |
| --- | --- | --- |
| ps | process status | 查看进程快照 |
| top | top processes | 动态查看进程和资源占用 |
| free | free memory | 查看内存使用情况 |
| kill | 向进程发送信号 | 请求进程结束或执行其他信号操作 |

~~~bash
ps aux
ps -ef
top
free -h
kill PID
kill -TERM PID
~~~

kill 发送的是信号。TERM 通常给程序正常退出的机会；只有在确实无法结束时，才考虑 kill -9 PID。

## 系统信息、磁盘和网络

| 命令 | 全称或来源 | 作用 |
| --- | --- | --- |
| uname | Unix name | 查看内核和系统信息 |
| hostname | host name | 查看主机名 |
| date | date | 显示日期和时间 |
| df | disk free | 查看文件系统剩余空间 |
| du | disk usage | 查看文件或目录占用空间 |
| ip | Internet Protocol | 查看和配置网络信息 |
| ssh | Secure Shell | 远程登录 |
| echo | echo | 输出文本或变量值 |
| sudo | superuser do | 按授权规则执行命令 |
| man | manual | 查看命令手册页 |
| history | history | 查看命令历史 |

~~~bash
uname -a
date
df -h
du -sh .
du -h --max-depth=1 .
ip addr
cat /etc/os-release
ssh user@host
~~~

uname -r 显示的是内核版本，不等于 Ubuntu、Debian 等发行版版本。发行版信息通常查看 /etc/os-release。

## Shell 使用技巧与帮助

### 补全、历史和中断

| 操作 | 作用 |
| --- | --- |
| Tab | 补全命令名、路径或选项 |
| ↑ / ↓ | 浏览历史命令 |
| Ctrl+R | 搜索历史命令 |
| Ctrl+C | 向前台进程发送中断信号 |
| Ctrl+D | 输入 EOF，空命令行中通常表示退出 Shell |
| Ctrl+L | 清理终端显示 |

~~~bash
history
history 20
!!      # 上一条命令
!$      # 上一条命令的最后一个参数
~~~

执行删除、覆盖或提权命令前，应先检查历史展开后的实际内容。

### 别名和环境变量

~~~bash
alias ll='ls -alF'
alias ll
unalias ll

echo "$PATH"
export EDITOR=vim
source ~/.bashrc
~~~

交互式定义的别名通常只在当前 Shell 中有效。需要长期生效时，可以将配置写入 ~/.bashrc。

### 查询帮助

~~~bash
命令 --help       # 快速查看选项
man 命令          # 查看手册页
info 命令         # 查看结构化文档
help cd           # 查看 Bash 内建命令
~~~

man 中重点关注 NAME、SYNOPSIS、DESCRIPTION、OPTIONS 和 EXAMPLES。

命令和文件格式可能同名，可以用章节号区分：

~~~bash
man 1 passwd       # passwd 命令
man 5 passwd       # /etc/passwd 文件格式
~~~

## 一组完整的操作

~~~bash
mkdir -p ~/linux-notes/demo
cd ~/linux-notes/demo || exit 1

cat > topics.txt <<'EOF'
Shell
File system
Shell
Pipeline
Permissions
EOF

echo '包含 Shell 的行数：'
grep -c 'Shell' topics.txt

sort topics.txt | uniq > topics-unique.txt
wc -l topics.txt topics-unique.txt
~~~

这组命令体现了创建目录、确认目录切换、写入多行文本、筛选、排序去重、保存输出和统计结果。

## 容易混淆的地方

1. 命令 [选项] [参数] 中的方括号表示可选，不要原样输入。
2. 选项的含义由具体命令决定，不能认为所有命令的 -a、-r 都一样。
3. > 会覆盖文件，>> 才是追加。
4. | 是管道，|| 是“前一条失败时执行后面的命令”。
5. && 和 || 判断的是退出状态，不是命令有没有输出文字。
6. Ctrl+C 通常是中断前台任务，不是复制。
7. sudo 不会自动提升外层 Shell 的重定向权限。
8. uniq 只合并相邻重复行，需要时先 sort。
9. rm -rf、kill -9 使用前先确认目标。
10. uname -r 是内核版本，发行版版本应查看 /etc/os-release。

## 复习清单

- [ ] 能解释终端、Shell 和 Linux 内核的区别。
- [ ] 能拆分命令名、选项和参数，读懂 man 中的格式说明。
- [ ] 会使用绝对路径、相对路径、.、.. 和 ~。
- [ ] 会使用 pwd、ls、cd、mkdir、cp、mv、rm。
- [ ] 会用 cat、less、head、tail、find 查看和查找文件。
- [ ] 会用 grep、sort、uniq、wc 处理文本。
- [ ] 能区分标准输入、标准输出和标准错误。
- [ ] 会使用 |、>、>>、<、2> 和 2>&1。
- [ ] 能根据退出状态选择 ;、&& 或 ||。
- [ ] 会用 chmod、sudo、ps 和 kill 处理权限与进程。
- [ ] 会通过 --help、man 和 help 查询命令。

