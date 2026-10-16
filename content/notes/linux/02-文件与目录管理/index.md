---
title: "【Linux】文件与目录管理常用命令"
date: 2026-10-16
lastmod:
categories:
  - "学习笔记 | Learning Notes"
tags:
  - "notes: Linux"
weight: 30
pinned: false
draft: false
---

## 文件与目录管理

## 命令格式与路径

~~~text
命令名 [选项] [参数]
~~~

| 部分 | 含义 | 示例 |
| --- | --- | --- |
| 命令名 | 执行的程序或 Shell 内建命令 | `cp` |
| 选项 option | 调整命令行为 | `-r`、`--recursive` |
| 参数 argument | 指定源文件、目标路径，或为选项提供值 | `src/`、`backup/`、`10` |

`cp -r src backup` 中，`-r` 是选项，`src` 和 `backup` 分别是源路径与目标路径。`head -n 10 app.log` 中，`10` 是选项 `-n` 的值，`app.log` 是文件参数。

- `[ ]` 表示可选，`...` 表示可以重复，均不是需要原样输入的字符。
- 短选项通常以 `-` 开头，长选项以 `--` 开头；能否合并短选项取决于命令。
- 同一选项在不同命令中含义可能不同，例如 `ls -a` 显示隐藏文件，`cp -a` 用于归档式复制。

| 路径写法 | 含义 | 示例 |
| --- | --- | --- |
| `/` 开头 | 从根目录开始的绝对路径 | `/var/log` |
| 不以 `/` 开头 | 相对于当前目录的路径 | `src/main.cpp` |
| `.` | 当前目录 | `cp /etc/hosts .` |
| `..` | 上一级目录 | `cd ..` |
| `~` | 当前用户的主目录 | `cd ~/projects` |

路径区分大小写，包含空格时使用引号，例如 `cd "project files"`。GNU 命令通常用 `--` 结束选项解析，例如 `rm -- -notes.txt`。

## 路径定位与目录列表

### pwd 和 cd

| 命令 | 全称 | 含义 | 参数 |
| --- | --- | --- | --- |
| `pwd` | print working directory | 显示当前工作目录 | 无必需参数 |
| `cd` | change directory | 切换工作目录，属于 Shell 内建命令 | 目标目录；省略时进入主目录 |

~~~bash
pwd
cd ~/projects
cd ..              # 上一级目录
cd -               # 上一次所在的目录
cd                 # 当前用户的主目录
~~~

`cd -` 中的 `-` 是特殊目录参数，不是通用选项。

### ls 列出目录内容

**来源：** list，列出文件和目录信息。

~~~text
ls [选项] [路径...]
~~~

路径参数可以是文件或目录，省略时列出当前目录。

| 选项 | 名称或含义 | 作用 |
| --- | --- | --- |
| `-l` | long listing format | 长格式，显示权限、链接数、所有者、大小和时间等 |
| `-a` / `--all` | all | 显示隐藏项，包含 `.` 和 `..` |
| `-h` / `--human-readable` | human-readable | 使用 K、M、G 等单位，通常与 `-l` 配合 |
| `-t` | 按时间排序 | 默认按修改时间从新到旧排序 |
| `-r` / `--reverse` | reverse | 反转排序结果 |

~~~bash
ls -lah                 # 当前目录，包含隐藏项和易读大小
ls -lt /var/log         # 按修改时间从新到旧排列
ls -ltr /var/log        # 按修改时间从旧到新排列
~~~

`ls -l` 默认显示最后修改时间，不是创建时间。目录行中的大小也不是目录全部内容的总大小。

`ll` 通常是 `ls` 的别名，具体定义取决于 Shell 配置，不是独立的标准命令。

## 创建文件与目录

### mkdir 创建目录

**全称：** make directory。

~~~text
mkdir [选项] 目录...
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-p` / `--parents` | parents | 自动创建缺失的父目录；目标目录已存在时不报错 |

~~~bash
mkdir build
mkdir -p project/src project/tests
~~~

### touch 创建空文件或更新时间

**来源：** touch，英文原词，意为触碰。

~~~text
touch [选项] 文件...
~~~

文件不存在时创建空文件；文件已存在时更新访问时间和修改时间，不清空内容。

~~~bash
touch README.md
touch app.log error.log
~~~

## 复制 移动与删除

### cp 复制文件与目录

**来源：** copy。

~~~text
cp [选项] 源路径 目标路径
cp [选项] 源路径... 目标目录
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-r` / `-R` / `--recursive` | recursive | 递归复制目录及其内容 |
| `-a` / `--archive` | archive | 递归复制，保留符号链接，并尽可能保留权限、时间等属性 |
| `-i` / `--interactive` | interactive | 覆盖已有文件前询问 |

~~~bash
cp config.yaml config.yaml.bak       # 复制为新文件
cp -i config.yaml deploy/            # 复制到目录，覆盖前询问
cp -r src src-copy                   # 复制目录
cp -a project/. backup/              # 复制目录内容，包含隐藏项
~~~

目标目录是否存在会影响复制位置：

- `cp -r src backup`：`backup` 不存在时创建它，并复制 `src` 的内容；已存在时通常生成 `backup/src`。
- `cp -a src/. backup/`：将 `src` 内的内容复制到 `backup`，包含隐藏项，不再额外嵌套一层 `src`。

### mv 移动文件与重命名

**来源：** move。

~~~text
mv [选项] 源路径 目标路径
mv [选项] 源路径... 目标目录
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-i` / `--interactive` | interactive | 覆盖已有目标前询问 |

~~~bash
mv old.conf new.conf        # 同一目录内重命名
mv -i new.conf config/      # 移入已有目录
mv src source              # source 不存在时重命名目录
~~~

移动目录不需要 `-r`。目标是已有目录时，源文件或源目录通常移入其中。

### rm 删除文件与目录

**来源：** remove。

~~~text
rm [选项] 路径...
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-r` / `-R` / `--recursive` | recursive | 递归删除目录及其内容 |
| `-i` | interactive | 每次删除前询问 |
| `-I` | 大写 i | 删除超过三个文件，或递归删除时，统一询问一次 |
| `-f` / `--force` | force | 忽略不存在的文件，不弹出删除确认 |

~~~bash
rm old.log
rm -i config.yaml.bak
rm -rI build/               # 统一确认后删除目录树
rm -f /tmp/app.pid          # 文件不存在时不报错
~~~

`rm` 不经过桌面回收站。`-f` 不会绕过权限检查；`rm -rf` 表示递归删除且不询问。

`*` 默认不匹配以 `.` 开头的隐藏名称，所以 `rm directory/*` 不等于删除目录中的全部内容。

## 查看文件与日志

### cat 输出文件内容

**全称：** concatenate，连接多个文件并输出内容，也常用于查看短文本。

~~~text
cat [选项] [文件...]
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-n` / `--number` | number | 给所有输出行编号 |

~~~bash
cat config.yaml
cat -n script.sh
cat part1.txt part2.txt > merged.txt
~~~

最后一条按参数顺序连接两个文件，`>` 由 Shell 将输出覆盖写入 `merged.txt`。

### less 分页查看长文本

**来源：** less，英文原词，意为更少；这里是分页查看器名称。

~~~text
less [选项] 文件
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-N` / `--LINE-NUMBERS` | line numbers | 显示行号，注意为大写 `N` |

~~~bash
less -N app.log
~~~

| 阅读界面中的按键 | 作用 |
| --- | --- |
| 空格 / `b` | 向下／向上翻页 |
| `g` / `G` | 文件开头／文件末尾 |
| `/关键词`，再按回车 | 向后搜索 |
| `n` / `N` | 下一个／上一个匹配 |
| `q` | 退出 |

这些按键在 `less` 内部生效，不是 Shell 命令行选项。

### head 和 tail 查看头尾与追踪日志

| 命令 | 来源 | 含义 |
| --- | --- | --- |
| `head` | head，头部 | 显示文件开头，默认 10 行 |
| `tail` | tail，尾部 | 显示文件结尾，默认 10 行 |

~~~text
head [选项] [文件...]
tail [选项] [文件...]
~~~

| 命令 | 选项 | 含义 |
| --- | --- | --- |
| 两者 | `-n N` / `--lines=N` | 显示 `N` 行，`N` 是选项值 |
| `tail` | `-f` / `--follow` | 持续追踪新增内容，默认跟随文件描述符 |
| `tail` | `-F` | 按文件名追踪并重试，适合日志轮转后重新创建的同名文件 |

~~~bash
head -n 20 config.yaml
tail -n 100 app.log
tail -F app.log
~~~

`tail -F` 持续运行，`Ctrl+C` 结束追踪。

## 查找文件与检索内容

### find 按路径和属性查找文件

**来源：** find，英文原词，意为查找。

~~~text
find 搜索路径 [表达式]
~~~

搜索路径指定遍历起点，`.` 表示当前目录。表达式由选项、测试条件和动作组成；没有指定其他动作时，常见用法默认输出匹配路径。

| 写法 | 类别 | 含义 |
| --- | --- | --- |
| `-maxdepth N` | 选项 | 最大搜索深度，起点深度为 0 |
| `-type f` | 测试条件 | 普通文件；`f` 为 file |
| `-type d` | 测试条件 | 目录；`d` 为 directory |
| `-name '模式'` | 测试条件 | 按名称匹配，区分大小写 |
| `-iname '模式'` | 测试条件 | 按名称匹配，忽略大小写 |

~~~bash
find . -type f -name '*.log'
find src -type f -iname '*.md'
find . -maxdepth 2 -type d -name build
~~~

相邻测试条件默认按“且”组合。名称模式使用引号，避免 `*.log` 先被 Shell 展开。

### grep 检索文件内容

**名称来源：** 编辑器命令 `g/re/p`，常解释为 global regular expression print，即全局正则表达式匹配并打印。

~~~text
grep [选项] 模式 [文件...]
~~~

模式是匹配规则，文件是搜索对象；默认输出匹配的完整行。

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-n` / `--line-number` | line number | 显示匹配行的行号 |
| `-i` / `--ignore-case` | ignore case | 忽略大小写 |
| `-r` / `--recursive` | recursive | 递归搜索目录 |
| `-F` / `--fixed-strings` | fixed strings | 将模式作为普通字符串，不解释正则符号 |
| `-v` / `--invert-match` | invert match | 输出不匹配的行 |

~~~bash
grep -ni 'error' app.log
grep -rnF -- 'TODO' src/
grep -v '^#' config.ini          # 排除以 # 开头的行
~~~

`find` 寻找符合条件的文件路径，`grep` 筛选文件中的文本行。`grep` 未找到匹配时通常没有输出，退出状态为 `1`。

## 符号链接

### ln 创建链接

**来源：** link。符号链接常用于配置文件引用和版本目录切换。

~~~text
ln -s 目标路径 链接路径
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-s` / `--symbolic` | symbolic | 创建符号链接；省略时默认创建硬链接 |

~~~bash
ln -s /srv/app/releases/v1 /srv/app/current
ls -l /srv/app/current
~~~

`/srv/app/current` 是新建的链接，指向已有版本目录。符号链接保存目标路径；相对目标路径以链接所在目录为基准解析。目标不存在时，链接会失效。

## 归档与压缩

### tar 打包与解包

**全称：** tape archiver，磁带归档程序。归档负责将多个文件组织成一个文件，压缩由 gzip 等程序完成。

~~~text
tar -czf 归档文件.tar.gz 源路径...
tar -xzf 归档文件.tar.gz [-C 目标目录]
tar -tzf 归档文件.tar.gz
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-c` / `--create` | create | 创建归档 |
| `-x` / `--extract` | extract | 解包 |
| `-t` / `--list` | list | 列出归档成员 |
| `-z` / `--gzip` | gzip | 使用 gzip 处理压缩 |
| `-f 文件` / `--file=文件` | file | 指定归档文件，文件名是该选项的值 |
| `-C 目录` / `--directory=目录` | directory | 先切换目录，后续操作在该目录中进行 |
| `-v` / `--verbose` | verbose | 显示处理的文件名，按需添加 |

~~~bash
tar -czf project.tar.gz project/
tar -tzf project.tar.gz
mkdir -p restore
tar -xzf project.tar.gz -C restore/
~~~

`-c`、`-x`、`-t` 是不同操作，每次选择一种。`-f` 后紧跟归档文件名；`-C` 的目标目录需要已存在。

示例归档包含顶层 `project`，解包后得到 `restore/project`。输出归档放在源目录之外，可避免把归档文件自身包含进去。

### gzip 压缩单个文件

**全称：** GNU zip。常用于单个日志文件的压缩，不负责将目录打包。

~~~text
gzip [选项] 文件...
~~~

| 选项 | 名称 | 作用 |
| --- | --- | --- |
| `-k` / `--keep` | keep | 保留输入文件 |
| `-d` / `--decompress` | decompress | 解压缩 |

~~~bash
gzip -k app.log            # 生成 app.log.gz，保留 app.log
gzip -dk archived.log.gz   # 生成 archived.log，保留压缩文件
~~~

省略 `-k` 时，成功后通常以输出文件替换输入文件。目标文件已存在时可能询问是否覆盖。

## 常见边界

1. 命令执行成功不一定输出文字；复制、移动和删除后可用 `ls` 核对。
2. `cp`、`mv` 的目标目录是否存在，会影响最终文件层级。
3. `touch` 不清空已有文件，`>` 重定向会覆盖目标文件内容。
4. `find -name '*.log'` 的模式需要引号；`grep -F` 适合搜索普通字符串。
5. 符号链接的相对目标路径以链接所在目录为基准，不以当前工作目录为基准。
6. 解包位置由当前目录、`-C` 和归档内部路径共同决定。

## 查询帮助

~~~bash
cp --help         # GNU 命令的选项摘要
man cp            # 完整手册
help cd           # Bash 内建命令帮助
~~~

`man` 来自 manual，参数为手册名称；`help` 是 Bash 内建命令，参数为待查询的内建命令名。

参考文档：[GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html)、[GNU Findutils](https://www.gnu.org/software/findutils/manual/html_mono/find.html)、[GNU Grep](https://www.gnu.org/software/grep/manual/grep.html)、[GNU tar](https://www.gnu.org/software/tar/manual/tar.html)。
