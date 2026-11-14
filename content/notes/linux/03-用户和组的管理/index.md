---
knowledge_id: "notes-linux-03"
url: "/p/notes-linux-03/"
series_id: "linux"
series_order: 3
title: "【Linux】用户、用户组与文件权限"
date: 2026-10-23
lastmod: 2026-11-14
description: "查看账号和组关系，设置共享目录与服务账号的权限，排查 Permission denied。"
tags:
  - "notes: Linux"
weight: 30
draft: false
---

## 查看用户和组

~~~bash
whoami
id
id alice
getent passwd alice
getent group project
~~~

`whoami` 显示当前有效用户。`id` 显示当前进程的用户 ID（UID）、主组 ID（GID）和附加组。加上用户名后，`id alice` 查询该账号当前配置的组关系。`getent` 通过系统配置的账号来源查询记录，本地账号和通过目录服务提供的账号都可以用这个命令查。

## 给目录分配权限

~~~bash
ls -l config.yaml
ls -ld data/
stat -c '%A %a %U:%G %n' config.yaml data/
~~~

`ls -l` 的权限字段首位表示类型，`-` 是普通文件，`d` 是目录。后面每三个字符一组，依次对应所有者、所属组和其他用户。`stat` 还可以显示八进制权限和文件归属。`%A` 和 `%a` 分别输出字符与八进制权限，`%U:%G` 输出所有者和组，`%n` 输出文件名。

| 权限 | 普通文件 | 目录 |
| --- | --- | --- |
| `r` | 读内容 | 列出目录项 |
| `w` | 改内容 | 配合 `x` 创建、删除和重命名目录项 |
| `x` | 执行文件 | 进入目录，访问已知名称的条目 |

打开 `data/input.csv` 时，读者需要文件的读取权限，也需要路径上每一级父目录的 `x` 权限。删除文件主要取决于父目录的写入与进入权限，还受 sticky bit 等限制。

~~~bash
chmod 640 config.yaml
chmod u+x run.sh
sudo chown alice:project config.yaml
sudo chgrp project data/
~~~

八进制权限中 `r=4`、`w=2`、`x=1`，每一位取权值之和。`640` 允许所有者读写、所属组读取，其他用户没有权限。`u+x` 只给所有者加执行权限。`chown 用户:组 路径` 同时修改两种归属，`chgrp` 只改所属组。修改目录时默认只作用于目录本身。

## 配置共享目录

下面以 Ubuntu、Debian 为例，假设 `alice` 和 `bob` 已有账号，需要共同维护 `/srv/project`。

~~~bash
sudo groupadd project
sudo usermod -aG project alice
sudo usermod -aG project bob
sudo mkdir -p /srv/project
sudo chown alice:project /srv/project
sudo chmod 2770 /srv/project
~~~

`usermod -aG` 把用户追加到指定附加组。省略 `-a` 会用指定列表替换原有附加组。成员要重新登录，再运行 `id` 确认当前会话已取得新的组列表。已经启动的服务也要重新启动进程才会读取变化。需要移除附加组成员时用 `sudo gpasswd -d bob project`。

`2770` 的第一位 `2` 给目录设置 setgid，新建文件和子目录默认继承 `project` 组。后三位 `770` 允许所有者和组成员进入并写入这个目录。文件本身是否允许组成员修改，还取决于创建时的权限。

~~~bash
cd /srv/project
umask 0002
touch result.csv
ls -l result.csv
~~~

`umask` 按位去掉程序请求的权限。普通文件按 `666`、目录按 `777` 请求权限时，`0002` 得到 `664` 和 `775`，`0027` 得到 `640` 和 `750`。若 `result.csv` 已存在，`touch` 只更新时间。`umask` 对当前 Shell 及之后启动的子进程生效。

## 用独立账号运行程序

~~~bash
sudo useradd --system --user-group --no-create-home --shell /usr/sbin/nologin appsvc
sudo install -d -o root -g appsvc -m 0750 /srv/myapp
sudo install -d -o appsvc -g appsvc -m 0750 /srv/myapp/logs
sudo install -o root -g appsvc -m 0640 app.conf /srv/myapp/app.conf
~~~

`--system` 创建系统账号，`--user-group` 同时创建同名组，`--no-create-home` 跳过创建主目录，`nologin` 用于阻止交互登录。需要普通登录账号时，可用 `sudo useradd -m -U -s /bin/bash alice`，再按实际登录方式配置认证。`-m` 创建主目录，`-U` 创建同名组，`-s` 指定登录 Shell。

`install -d` 创建目录，`-o` 和 `-g` 设置归属，`-m` 设置权限。这里 `appsvc` 能读 `/srv/myapp/app.conf` 并写入 `logs/`，代码和配置可以由管理账号更新。

## 排查 Permission denied

先确认程序的运行用户，再顺着报错路径看每一级权限。

~~~bash
ps -p 12345 -o user,group,pid,args
namei -l /srv/myapp/app.conf
sudo -u appsvc test -r /srv/myapp/app.conf
sudo -u appsvc test -w /srv/myapp/logs
sudo -u appsvc test -x /srv/myapp/logs
~~~

把 `12345` 换成实际进程号。`namei -l` 会把路径拆开逐级显示权限和归属。`sudo -u appsvc` 让 `test` 以服务账号执行。`-r` 检查文件可读，`-w` 和 `-x` 分别检查目录可写、可进入，成功时返回 `0`。需要验证实际写入时，可用 `sudo -u appsvc touch /srv/myapp/logs/permission-check.log`。

Shell 重定向默认由当前 Shell 打开文件。例如需要以 `appsvc` 身份打开输出文件时，用 `sudo -u appsvc sh -c 'printf "%s\n" ready > /srv/myapp/logs/status.log'`，让命令和重定向在同一个身份下执行。

普通权限检查通过后，再看目标文件系统是否只读，以及服务配置、SELinux 或 AppArmor 是否限制了该路径。
