---
knowledge_id: "notes-linux-05"
url: "/p/notes-linux-05/"
series_id: "linux"
series_order: 5
title: "【Linux】软件包安装、升级与依赖查询"
description: "用 APT 安装和查询软件包，处理本地安装包、缺失依赖与源码构建。"
date: 2026-11-14
tags:
  - "notes: Linux"
weight: 50
draft: false
---

## 从仓库安装软件

先看发行版，再选包管理器。Ubuntu、Debian 用 APT 管理 `.deb` 包，Fedora、较新的 RHEL 用 DNF 管理 `.rpm` 包。

~~~bash
cat /etc/os-release
~~~

### APT 查找和安装

~~~bash
sudo apt update
apt search '^ffmpeg$'
apt show ffmpeg
apt-cache policy ffmpeg
sudo apt install ffmpeg
ffmpeg -version
~~~

`apt update` 从已配置的仓库刷新本地索引。`apt search` 按名称和描述搜索，`apt show` 查看包的描述和依赖。`apt-cache policy` 的 `Installed` 是已安装版本，`Candidate` 是按当前源和优先级选出的候选版本。`apt install` 会下载软件和所需依赖。

配置脚本中用 `apt-get`。例如 `sudo apt-get install -y build-essential pkg-config`，`-y` 自动确认安装计划。交互操作可以省掉 `-y`，先看准备安装、升级或删除哪些包。[Ubuntu 软件包管理](https://ubuntu.com/server/docs/how-to/software/package-management/)

### 升级与卸载

| 命令 | 作用 |
| --- | --- |
| `apt list --upgradable` | 列出有升级版本的已安装包 |
| `sudo apt upgrade` | 升级可升级的包，可安装新依赖，保留需要先移除其他包才能升级的包 |
| `sudo apt full-upgrade` | 为完成系统升级，可移除已安装的包 |
| `sudo apt remove ffmpeg` | 卸载软件，保留由软件包管理的配置文件 |
| `sudo apt purge ffmpeg` | 卸载软件并清理由包管理的配置，用户主目录中的配置需另行处理 |
| `sudo apt autoremove` | 移除当前已无其他包依赖的自动安装项 |

执行全量升级或清理前，可以预览事务。`-s` 只模拟，输出中的 `Remv` 是计划移除的软件包。

~~~bash
apt-get -s dist-upgrade
apt-get -s autoremove
~~~

如果只想升级已安装的 `ffmpeg`，用 `sudo apt install --only-upgrade ffmpeg`。解析依赖时，相关包也可能随之变动。[APT 手册](https://manpages.debian.org/bookworm/apt/apt.8.en.html)

## 查软件版本和文件归属

~~~bash
dpkg-query -W -f='${Package}\t${Version}\n' ffmpeg
dpkg -L ffmpeg
dpkg -S /usr/bin/ffmpeg
command -v ffmpeg
~~~

第一条从本机软件包数据库读取包名和版本。`dpkg -L` 列出该包登记的文件，`dpkg -S` 反查给定路径由哪个包提供。若 `command -v ffmpeg` 指向 `/usr/local/bin` 或某个 Conda 环境，先用该路径检查实际调用的版本。手动复制进去的文件可能没有包归属。

编译时报缺少头文件，先查对应开发包。例如运行库已经安装，编译仍提示找不到 `openssl/ssl.h`，在 Ubuntu、Debian 上可安装 `libssl-dev`。若项目用 `pkg-config` 找库，可以顺便确认它能读到库的元数据。

~~~bash
sudo apt install libssl-dev pkg-config
pkg-config --modversion openssl
~~~

## 安装下载的安装包

假设已经从软件发布方下载 `tool_1.2.3_amd64.deb`，先看系统架构和包里的元数据。

~~~bash
dpkg --print-architecture
dpkg-deb -f ./tool_1.2.3_amd64.deb Package Version Architecture Depends
sudo apt install ./tool_1.2.3_amd64.deb
~~~

`./` 表示传入当前目录下的文件。APT 会尝试从当前仓库补齐依赖，还要核对安装包支持的发行版版本。如果此前用 `dpkg -i` 安装后卡在依赖状态，先用 `apt-get -s --fix-broken install` 看修复计划，再按需要执行 `sudo apt --fix-broken install`。无法满足依赖时，计划可能移除未完成安装的包。

在使用 DNF 的发行版上，从仓库安装和安装本地包分别写作 `sudo dnf install git` 和 `sudo dnf install ./tool.rpm`。已安装的文件可用 `rpm -qf /usr/bin/git` 查询归属。

## 找不到包或下载失败

~~~bash
cat /etc/os-release
sudo apt update
apt-cache policy ffmpeg
ls /etc/apt/sources.list.d/
~~~

遇到 `Unable to locate package`，先检查包名、`apt update` 的报错和仓库是否包含该包。Ubuntu 24.04 的默认源配置在 `/etc/apt/sources.list.d/ubuntu.sources`，一些旧系统仍使用 `/etc/apt/sources.list`。`.sources` 文件里，`URIs` 指定仓库地址，`Suites` 指定发行版代号和更新分支，`Signed-By` 指定校验仓库签名用的密钥文件。[Ubuntu 24.04 源配置说明](https://documentation.ubuntu.com/release-notes/24.04/)

更换镜像时，先确认它支持当前发行版、架构和更新分支。签名错误应核对软件源、发布方密钥和系统时间。修改源以后重新执行 `apt update`，再用 `apt-cache policy 包名` 检查候选版本来自哪里。

## 从源码构建到用户目录

需要的版本仓库未提供时，可以按源码包的说明编译。对于提供 `configure` 脚本的项目，进入解压后的源码目录执行以下命令，各步成功后再继续。

~~~bash
sudo apt install build-essential
./configure --prefix="$HOME/.local"
make -j2
make install
~~~

`build-essential` 提供编译器和 `make` 等工具，额外的开发库按项目说明安装。`--prefix` 指定安装前缀，程序通常放在 `~/.local/bin`，库文件通常放在 `~/.local/lib`。`-j2` 允许同时执行两个构建任务，可以根据内存和 CPU 调整。

源码安装生成的文件通常由项目自己的安装规则管理。要卸载时，先查它是否提供卸载目标。需要保留多个版本时，也可给每个版本指定独立的安装目录。找不到新装的命令时，检查 [PATH 和命令查找](knowledge:notes-linux-01)。
