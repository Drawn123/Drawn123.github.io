---
knowledge_id: "notes-linux-06"
url: "/p/notes-linux-06/"
series_id: "linux"
series_order: 6
title: "【Linux】Python 环境与依赖管理"
description: "用 Conda 或 venv 创建 Python 环境，安装依赖、导出配置并检查 GPU。"
date: 2026-11-14
tags:
  - "notes: Linux"
weight: 60
draft: false
---

## 安装 Miniconda

已有 `conda` 时直接查看版本和环境列表。需要安装时，先用 `uname -m` 查机器架构，从发布页下载对应的 Linux 安装文件。下面以 `x86_64` 为例，`aarch64` 机器要选择对应文件。`sha256sum` 输出的散列值应与下载页给出的一致。[Miniconda Linux 安装说明](https://www.anaconda.com/docs/getting-started/miniconda/install/linux-install)

~~~bash
uname -m
sha256sum Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
~~~

可以安装到自己的主目录。以下假设安装路径是 `~/miniconda3`。安装时若跳过了 Bash 初始化，执行第一行后重新打开终端。

~~~bash
~/miniconda3/bin/conda init bash
conda --version
conda env list
~~~

`conda init bash` 写入 Bash 的初始化配置，让 `conda activate` 可以修改当前 Shell 的环境。临时使用时也可以执行 `source ~/miniconda3/etc/profile.d/conda.sh`。

## 创建环境并检查解释器

~~~bash
conda create -n analysis --override-channels -c conda-forge python=3.11 numpy scikit-learn matplotlib
conda activate analysis
python -V
python -c 'import sys; print(sys.executable)'
python -c 'import sklearn; print(sklearn.__version__)'
~~~

`-n analysis` 指定环境名，`python=3.11` 选定 Python 的次版本。`-c conda-forge` 指定包渠道，`--override-channels` 让这次创建只从指定渠道查包。安装名是 `scikit-learn`，导入名写成 `sklearn`。需要查看 NumPy、SciPy 等依赖的版本时，用 `python -c 'import sklearn; sklearn.show_versions()'`。

`conda env list` 在当前环境旁显示 `*`，`conda list` 列出环境里的包。运行脚本时也可以直接指定环境，例如 `conda run -n analysis python main.py`。需要实时查看输出时加 `--no-capture-output`。

## 安装、更新和移除依赖

下面三条分别对应给 `analysis` 环境装包、更新包和卸载包。按需要执行其中一条。

~~~bash
conda install -n analysis --override-channels -c conda-forge pandas
conda update -n analysis --override-channels -c conda-forge scikit-learn
conda remove -n analysis pandas
~~~

安装或升级时看一下事务列表，求解依赖可能同时变更其他包的版本。`conda deactivate` 退出当前环境。确认整个环境可以删除后，用 `conda env remove -n analysis` 移除它。

需要使用 pip 时，在创建环境时把 `pip` 加进依赖，先装 Conda 包，再用 `python -m pip install -r requirements.txt` 安装剩余依赖。用 `python -m pip --version` 确认 pip 跟着当前解释器走。如果装好后仍提示 `ModuleNotFoundError`，先核对报错进程实际使用的 `sys.executable`，再检查对应环境里有没有该包。[Conda 环境管理](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html)

## 保存和重建环境

~~~bash
conda env export -n analysis --from-history > environment.yml
conda env create -n analysis-copy -f environment.yml
~~~

`--from-history` 保留显式指定的 Conda 依赖，适合保存项目需要的包和版本约束。重建时会重新求解依赖，pip 安装项也要写入文件的 `pip:` 小节，或随项目提供 `requirements.txt`。共享前检查导出的 `channels:`，并删掉指向本机绝对路径的 `prefix:`（如果有）。

只在同一平台和架构上恢复相同的 Conda 包构建时，可以导出包的具体 URL。pip 安装项仍要另外记录。

~~~bash
conda list -n analysis --explicit > conda-linux.txt
conda create -n analysis-pinned --file conda-linux.txt
~~~

## 用 venv 安装纯 pip 依赖

项目已有可用的系统 Python 和 `requirements.txt` 时，可以直接在项目目录建 `.venv`。Ubuntu、Debian 上缺少 `venv` 模块时，先安装 `python3-venv`。

~~~bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pip check
deactivate
~~~

`venv` 使用创建它时的 Python 版本。`pip check` 检查已安装包声明的依赖是否满足。脚本也可以直接调用 `.venv/bin/python main.py`。

## 安装 TensorFlow 并检查 GPU

TensorFlow 用独立的环境安装，Python 版本按要装的 TensorFlow 版本选择。以下以 Linux 上的 Python 3.11 为例，CPU 和 NVIDIA GPU 两种安装方式选其一。[TensorFlow 安装说明](https://www.tensorflow.org/install/pip)

~~~bash
conda create -n tensorflow-env --override-channels -c conda-forge python=3.11 pip
conda activate tensorflow-env
~~~

只跑 CPU 时，先用一个张量运算验证安装。

~~~bash
python -m pip install tensorflow
python -c 'import tensorflow as tf; print(tf.__version__); print(tf.reduce_sum([1, 2, 3]).numpy())'
~~~

使用 NVIDIA GPU 时，先确认环境所在的机器能看到 GPU，再装带 CUDA 用户态依赖的版本。

~~~bash
nvidia-smi
python -m pip install 'tensorflow[and-cuda]'
python -c 'import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices("GPU"))'
~~~

`nvidia-smi` 显示驱动和 GPU 状态。它报告的 `CUDA Version` 是驱动支持的最高 CUDA 版本。最后一条命令返回 `[]` 时，表示当前 Python 进程里的 TensorFlow 没有检测到 GPU。先确认当前节点或容器分到了 GPU，再查驱动与 TensorFlow 版本要求。

远程终端没有图形会话时，可以用 `MPLBACKEND=Agg python plot.py` 运行绘图脚本，并在脚本里调用 `plt.savefig("result.png")` 保存结果。
