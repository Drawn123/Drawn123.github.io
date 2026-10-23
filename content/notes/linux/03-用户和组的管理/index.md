---
knowledge_id: "notes-linux-03"
url: "/p/notes-linux-03/"
series_id: "linux"
series_order: 3
title: "【Linux】项目部署中的用户、用户组与权限管理"
date: 2026-10-23
lastmod: 2026-10-23
description: "部署账号、服务账号、用户组和项目目录的权限配置。"
tags:
  - "notes: Linux"
weight: 30
draft: true
---

## 部署账号与服务账号

部署项目时，上传代码的账号和运行程序的账号通常分开使用。`deploy` 负责更新代码，`myapp` 负责运行服务；代码由 `deploy` 管理，日志目录允许 `myapp` 写入。

| 对象 | 用途 |
| --- | --- |
| `deploy` 用户 | 登录服务器、上传文件和更新代码 |
| `myapp` 用户 | 运行应用程序 |
| `myapp` 组 | 控制项目文件的组访问权限 |
| `/srv/myapp/releases` | 存放部署文件 |
| `/srv/myapp/logs` | 存放程序日志 |

以下命令以 Ubuntu/Debian、Bash 为例，使用新建的账号和项目目录。带 `sudo` 的操作需要管理员授权。

## 用户、用户组与文件归属

### UID、GID 和两种用户组

Linux 使用数字标识身份：用户对应 **UID**，用户组对应 **GID**。用户名和组名方便人阅读，文件的归属最终关联的是这些数字。

| 概念 | 含义 |
| --- | --- |
| `root` | UID 为 `0` 的超级用户，具备广泛的系统管理权限 |
| 普通用户 | 通常供人登录、开发和执行日常操作 |
| 系统用户 | 通常供系统组件或应用服务运行使用 |
| 主组 primary group | 账号记录中的默认组 |
| 附加组 supplementary groups | 为访问其他资源而加入的组，可以有多个 |

很多发行版从 UID `1000` 开始分配普通用户，具体范围由系统配置决定。系统账号是否允许登录，取决于登录 Shell 和认证配置。

新建文件通常使用创建进程的有效 GID 作为所属组；父目录设置了 setgid 时，可以继承父目录的组。

### 文件的所有者和所属组

~~~bash
ls -l /srv/myapp/releases/app.conf
~~~

示意输出：

~~~text
-rw-r----- 1 deploy myapp 18 Oct 23 12:00 app.conf
~~~

| 部分 | 含义 |
| --- | --- |
| 第一个 `-` | 普通文件；`d` 表示目录 |
| `rw-` | 所有者的权限 |
| `r--` | 所属组的权限 |
| `---` | 其他用户的权限 |
| `deploy` | 文件所有者 |
| `myapp` | 文件所属组 |

这里表示 `deploy` 可以读写文件，属于 `myapp` 组的其他用户可以读取，其余用户没有访问权限。

在没有扩展 ACL 的普通权限模型中，系统先判断是否为所有者，再判断是否匹配所属组，否则使用其他用户权限；**三组权限不会简单相加**。例如所有者没有写权限时，不能再借用“其他用户”的写权限。

## 先确认当前身份

### whoami、id 和 groups

~~~bash
whoami             # 当前有效用户的名称
id                 # 当前进程的 UID、GID 和组列表
id deploy          # 查询 deploy 账号的用户和组信息
groups deploy      # 查询 deploy 所属的组
~~~

`id deploy` 的示意输出：

~~~text
uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),1002(myapp)
~~~

`gid` 是主组，`groups` 列出组关系，包括主组和附加组。示例中的具体数字由系统分配，不需要照着指定。

`id` 查看当前进程的身份，`id deploy` 查询账号的组关系。刚修改完组成员时，账号记录已经更新，当前进程仍可能持有旧的组列表。

### getent 查询账号信息

~~~text
getent 数据库名称 查询对象
~~~

~~~bash
getent passwd deploy
getent group myapp
~~~

`getent` 按系统的名称服务配置查询账号。使用 LDAP 等集中管理账号时，用户不一定记录在本地 `/etc/passwd` 中，仍可以通过 `getent` 查询。

本地账号信息主要保存在以下文件中：

| 文件 | 主要内容 |
| --- | --- |
| `/etc/passwd` | 用户名、UID、主组 GID、主目录和登录 Shell 等 |
| `/etc/shadow` | 密码哈希及密码有效期等信息，访问受限 |
| `/etc/group` | 组名、GID 和显式成员列表 |
| `/etc/gshadow` | 组的受保护信息 |

`/etc/passwd` 中的 `x` 通常表示密码哈希保存在 `/etc/shadow`，不是实际密码。日常操作通过管理命令完成，不需要直接编辑这些文件。

主组关系记录在用户信息中，不一定出现在 `/etc/group` 的成员列表里。查询用户所属的组时，使用 `id 用户名`。

## 创建部署账号和服务账号

### useradd 创建账号

~~~text
useradd [选项] 用户名
~~~

常用选项：

| 选项 | 长选项 | 作用 |
| --- | --- | --- |
| `-m` | `--create-home` | 创建主目录 |
| `-M` | `--no-create-home` | 不创建主目录 |
| `-d 路径` | `--home-dir` | 指定主目录路径；本身不保证创建目录 |
| `-s 路径` | `--shell` | 指定登录 Shell |
| `-g 组名` | `--gid` | 指定主组，组需要已存在 |
| `-G 组列表` | `--groups` | 指定附加组，多个组用逗号分隔 |
| `-U` | `--user-group` | 创建与用户同名的组并作为主组 |
| `-r` | `--system` | 创建系统账号 |

创建部署账号：

~~~bash
sudo useradd -m -U -s /bin/bash deploy
id deploy
getent passwd deploy
~~~

`-m` 创建主目录，`-U` 创建同名主组，`-s /bin/bash` 指定登录 Shell。

`useradd` 不会自动交互式设置密码。需要使用密码认证时，再执行：

~~~bash
sudo passwd deploy
~~~

创建本地账号也不等于完成远程登录配置。通过 SSH 登录时，还要根据服务器策略配置公钥或密码认证。

### 给服务单独创建账号

先创建项目组，再创建使用该主组的服务账号：

~~~bash
sudo groupadd myapp
sudo useradd -r -M -g myapp -s /usr/sbin/nologin myapp
id myapp
~~~

`-r` 创建系统账号，`-M` 不创建主目录，`-g myapp` 指定主组。`/usr/sbin/nologin` 拒绝通过登录 Shell 进入账号，管理员仍可以该用户身份启动程序。`nologin` 的路径可用 `command -v nologin` 查询。

服务用户只授予程序运行所需的权限。例如允许它读取部署文件、写入日志目录，代码目录的修改权限仍由部署用户持有。

## 管理用户组

### usermod -aG 追加附加组

~~~text
usermod -aG 组名 用户名
~~~

将 `deploy` 加入 `myapp` 组：

~~~bash
sudo usermod -aG myapp deploy
id deploy
~~~

| 写法 | 含义 |
| --- | --- |
| `-g 组名` | 修改主组 |
| `-G 组列表` | 设置附加组列表 |
| `-aG 组列表` | 在原有附加组基础上追加 |

**添加组成员时通常使用 `-aG`。** 单独使用 `-G` 会重新设置附加组列表，用户原来属于、但没有写进列表的附加组会被移除。

用户加入 `myapp` 组后，可以使用所属组为 `myapp` 的文件的组权限。能否读写仍取决于文件的权限设置，`sudo` 权限则由 sudo 策略单独控制。

### 组成员修改后的生效时间

组成员关系修改后，已经运行的 Shell 和程序不会自动更新自己的组列表。

如果当前登录的就是 `deploy`，修改后应重新建立 SSH 登录会话，再执行：

~~~bash
id
~~~

新开一个沿用旧登录环境的终端窗口不一定能解决问题。对于持续运行的服务，也要让服务进程重新启动并重新取得组身份。

移除某个附加组成员可以使用：

~~~bash
sudo gpasswd -d deploy myapp
~~~

`-d` 表示从指定组的显式成员列表中删除该用户，不是删除账号；主组需要另行修改。移除成员同样不会立即收回旧进程已经持有的组身份。

## 用 sudo 切换执行身份

~~~text
sudo [选项] 命令 [参数...]
~~~

| 写法 | 作用 |
| --- | --- |
| `sudo 命令` | 按授权规则执行命令，默认目标用户通常为 `root` |
| `sudo -u 用户 命令` | 以指定用户身份执行命令 |
| `sudo -l` | 查看当前用户获准使用的 sudo 权限 |
| `sudo -iu deploy` | 以 deploy 身份启动登录 Shell |

~~~bash
sudo -l
sudo -u myapp id
sudo -iu deploy
~~~

进入登录 Shell 后，用 `exit` 返回原来的 Shell。创建 `deploy` 账号不会自动给它管理员权限；本节操作是否允许，由现有 sudo 策略决定。

排查服务权限时，可以用 `sudo -u myapp 命令` 执行一次目标操作，检查服务用户是否具备相应的读写权限。

## 配置项目目录的归属和权限

### 文件和目录的 rwx 含义不同

| 权限 | 普通文件 | 目录 |
| --- | --- | --- |
| `r` read | 读取文件内容 | 列出目录中的文件名 |
| `w` write | 修改文件内容 | 配合 `x` 创建、删除或重命名目录项 |
| `x` execute/search | 允许尝试直接执行文件，还需满足格式、解释器等条件 | 进入目录、搜索目录项，继续解析后续路径 |

访问 `/srv/myapp/releases/app.conf` 时，需要对路径中的各级目录具备 `x` 权限，并对目标文件具备所需权限。仅把文件设成可读，不能解决父目录无法穿过的问题。

删除文件主要取决于父目录的 `w` 和 `x`，不取决于文件自身是否可写。目录的 sticky bit、ACL 等机制还可能增加限制。

### chmod 修改权限

~~~text
chmod 权限 文件或目录...
~~~

符号写法中，`u` 表示所有者，`g` 表示所属组，`o` 表示其他人；`+` 增加权限，`-` 移除权限，`=` 设置对应权限。

~~~bash
chmod u+x start.sh          # 给所有者增加执行权限
chmod g+r app.conf          # 给所属组增加读取权限
chmod o-rwx app.conf        # 移除其他人的读、写、执行权限
~~~

数字写法中，`r=4`、`w=2`、`x=1`，每一组分别相加：

| 数字 | 权限 | 常见用途 |
| --- | --- | --- |
| `640` | `rw-r-----` | 所有者读写，所属组只读的配置文件 |
| `750` | `rwxr-x---` | 所有者可管理、所属组可访问的目录或脚本 |
| `600` | `rw-------` | 仅所有者读写的文件 |

~~~bash
chmod 640 app.conf
chmod 750 start.sh
~~~

`chmod` 修改读、写、执行权限，`chown` 修改所有者和所属组。

### chown 修改所有者和所属组

~~~text
chown 所有者:所属组 文件或目录...
~~~

~~~bash
sudo chown deploy:myapp /srv/myapp/releases
~~~

这会把该目录的所有者设为 `deploy`，所属组设为 `myapp`，但不会自动修改读写权限，也不会修改目录内已有文件。

### 代码目录和日志目录

创建目录并设置归属和权限：

~~~bash
sudo mkdir -p /srv/myapp/releases /srv/myapp/logs
sudo chown root:root /srv/myapp
sudo chmod 755 /srv/myapp

sudo chown deploy:myapp /srv/myapp/releases
sudo chmod 2750 /srv/myapp/releases

sudo chown myapp:myapp /srv/myapp/logs
sudo chmod 750 /srv/myapp/logs

ls -ld /srv/myapp /srv/myapp/releases /srv/myapp/logs
~~~

| 目录 | 所有者:所属组 | 权限 |
| --- | --- | --- |
| `/srv/myapp` | `root:root` | 允许穿过父目录，普通用户不能修改这一层的目录项 |
| `/srv/myapp/releases` | `deploy:myapp` | deploy 更新部署文件，服务用户读取和进入，组成员不能在此创建或删除文件 |
| `/srv/myapp/logs` | `myapp:myapp` | 服务用户创建日志，组成员可查看目录，其他用户无权限 |

`2750` 最前面的 `2` 表示目录的 **setgid**。它使目录内新建的文件和子目录继承该目录的所属组；新建子目录还会继承 setgid。它不自动赋予组写权限，也不改变已有文件。

在这个目录下新建文件时，所属组会继承为 `myapp`。移动已有文件或复制时保留原属性，仍可能带入原来的组和权限，部署后需要检查。

### umask 控制新建文件的默认权限

setgid 控制新文件的组归属，`umask` 屏蔽新建文件的部分权限。

在没有默认 ACL、程序按常见方式请求文件 `666` 和目录 `777` 的情况下：

| umask | 新文件权限 | 新目录的普通权限位 |
| --- | --- | --- |
| `0022` | `644` | `755` |
| `0027` | `640` | `750` |
| `0077` | `600` | `700` |

`umask` 按位屏蔽权限，不是普通十进制减法；程序也可以请求比这些更严格的权限。它只影响此后创建的对象，不修改已有文件。

以 `deploy` 身份新建配置文件：

~~~bash
sudo -u deploy sh -c 'umask 0027; printf "%s\n" "APP_ENV=production" > /srv/myapp/releases/app.conf'
ls -l /srv/myapp/releases/app.conf
~~~

`app.conf` 原先不存在时，新文件的所有者为 `deploy`，所属组为 `myapp`，权限为 `640`。服务用户可以读取配置，但不能修改。

`sh -c` 中的命令和重定向整体以 `deploy` 身份执行。若写成 `sudo -u deploy echo ... > 文件`，重定向仍由外层 Shell 处理。

## Permission denied 排查

### 先看进程实际以谁运行

~~~bash
whoami
id
ps -eo user,group,pid,args
~~~

交互式终端的用户和后台服务的用户可能不同。修改了账号的组关系后，也要确认当前进程是否已经重新取得新的组列表。

### 再看目标和每一级父目录

~~~bash
ls -ld /srv /srv/myapp /srv/myapp/releases /srv/myapp/logs
ls -l /srv/myapp/releases/app.conf
namei -l /srv/myapp/releases/app.conf
~~~

`namei -l` 会沿着路径显示各级对象的权限和归属，适合找出是哪一级父目录缺少 `x`。

### 用服务身份验证具体操作

按前面的目录配置，检查服务用户的读写权限：

~~~bash
sudo -u myapp cat /srv/myapp/releases/app.conf
sudo -u myapp touch /srv/myapp/logs/permission-check.log
sudo -u myapp touch /srv/myapp/releases/should-fail
~~~

前两条应成功；第三条应提示权限不足，因为 `myapp` 没有代码目录的写权限。

普通文件权限正确时，继续检查 systemd 的目录限制、容器挂载、只读文件系统和 SELinux/AppArmor 规则。

不建议用 `chmod -R 777` 处理项目权限：它会让所有用户都能修改文件，还会给普通文件批量增加执行位。递归修改前应明确目标范围，并分别考虑目录、配置文件和可执行文件需要什么权限。

## 常用操作速查

| 目的 | 命令 |
| --- | --- |
| 查看当前进程身份 | `id` |
| 查询账号的组关系 | `id deploy` |
| 查询账号记录 | `getent passwd deploy` |
| 创建有主目录的普通账号 | `sudo useradd -m -U -s /bin/bash deploy` |
| 创建用户组 | `sudo groupadd myapp` |
| 追加附加组 | `sudo usermod -aG myapp deploy` |
| 移除附加组成员 | `sudo gpasswd -d deploy myapp` |
| 以服务身份执行命令 | `sudo -u myapp 命令` |
| 修改文件归属 | `sudo chown deploy:myapp 文件` |
| 设置配置文件权限 | `chmod 640 文件` |
| 检查整条路径权限 | `namei -l 路径` |
