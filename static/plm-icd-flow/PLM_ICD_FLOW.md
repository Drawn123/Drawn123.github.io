# PLM-ICD 流程图

## 主线

```text
01 初始化配置与设备 → 02 读取病历并分词 → 03 整理 ICD 标签与类别索引
→ 04 创建或加载模型 → 05 可选：生成教师分数 → 06 准备数据批次、损失和指标
→ 07 准备优化器与更新规则 → 08 训练、验证、保存与测试
```

第 05 步由 `cfg.distillation` 控制，基础实验从 04 直接进入 06。

## 01 初始化配置与设备

**起点** 项目环境、命令行参数、主配置与实验配置。

**交接** 合并后的 `cfg`，以及后面放模型和张量的 `device`。

**流程**

1. 想先看配置，可以输入 `poetry run python train_plm.py experiment=mdace_icd9_code/plm_icd gpu=0 --cfg job`。
2. Hydra 从主 `config.yaml` 和实验 YAML 选配置。这次选 `explainable_medical_coding/config/model/plm_icd.yaml`，里头写着 `name: PLMICD`。
3. 合并出 `cfg`。这条预览命令就在这里打印并退出。正常运行时继续把 `cfg` 传给 `main()`。
4. `main()` 设随机种子并选择设备，得到后面要用的 `device`。

### 1.1 用项目环境启动入口

- **输入** `pyproject.toml`、`poetry.lock` 和 `poetry run python train_plm.py …`。
- **动作** Poetry 在项目使用的 Python 环境里启动 `train_plm.py`，把后面的实验参数交给脚本。
- **产物** Python 开始执行脚本顶部，随后进入 Hydra 的配置处理。
- **源码** `train_plm.py`（训练入口） · `pyproject.toml`（项目依赖）

- **代码位置** 终端命令，在项目根目录执行；启动文件为 `train_plm.py`。

```bash
# 查看配置：这条命令不会进入 main() 中的训练流程
poetry run python train_plm.py experiment=mdace_icd9_code/plm_icd gpu=0 --cfg job
```

- **读法** 从左到右读：Poetry 选项目环境，Python 执行训练入口，experiment 选择实验配置，gpu 选择设备，--cfg job 让 Hydra 打印组合好的配置后退出。先用这条命令确认配置，再决定是否去掉最后的预览参数。
> **补充解释** Poetry 管依赖和运行环境。`experiment=…`、`gpu=0` 是 Hydra 处理的配置参数。

### 1.2 读环境变量

- **输入** 工作区的 `.env` 和当前进程已有的环境变量。
- **动作** `load_dotenv(find_dotenv())` 查找并加载 `.env`。
- **产物** 后续组件可从进程环境读取路径等设置。
- **源码** `train_plm.py`（加载环境变量）

- **代码位置** `train_plm.py`，模块顶部，`load_dotenv(find_dotenv())`。

```python
load_dotenv(find_dotenv())
```

- **读法** find_dotenv() 找到 .env，load_dotenv() 读入其中的环境变量。把它理解成给当前程序补充运行所需的设置；它还没有读取病历或更新模型。
> **补充解释** `.env` 提供运行环境中的值。Hydra 的 YAML 提供 `cfg` 里的实验参数。

### 1.3 选配置并合并成 `cfg`

- **输入** 主 `config.yaml`、`defaults` 指定的配置组、实验选项和命令行覆盖值。
- **动作** Hydra 从主配置出发。基础实验的 `override /model: plm_icd` 选择 `explainable_medical_coding/config/model/plm_icd.yaml`，选中的内容合并到 `cfg.model`。
- **产物** `main(cfg)` 收到一份有 `cfg.data`、`cfg.model`、`cfg.loss`、`cfg.trainer` 等字段的配置对象。
- **源码** `explainable_medical_coding/config/config.yaml`（主 YAML） · `explainable_medical_coding/config/experiment/mdace_icd9_code/plm_icd.yaml`（实验 YAML） · `train_plm.py`（Hydra 入口）

- **代码位置** `train_plm.py`，`main()` 上方的 `@hydra.main(...)` 及函数定义。

```python
@hydra.main(
    version_base=None,
    config_path="explainable_medical_coding/config",
    config_name="config",
)
def main(cfg: OmegaConf) -> None:
    # 下面开始使用合并好的 cfg
    ...
```

- **读法** 装饰器规定从哪个目录、哪个主配置开始读。cfg 是传入 main() 的配置对象。先看 `explainable_medical_coding/config/config.yaml` 的 defaults，再看 `explainable_medical_coding/config/experiment/mdace_icd9_code/plm_icd.yaml` 的 override /model: plm_icd，才能确定本次选了 `explainable_medical_coding/config/model/plm_icd.yaml`。
> **补充解释** `cfg` 是 configuration 的缩写，这里是 Python 变量名。模型目录中的多个 YAML 是同组的候选项。`model: plm_icd` 选文件，文件里的 `name: PLMICD` 选 Python 类，`configs.model_path` 选预训练编码器。

### 1.4 按启动模式决定是否进入训练入口

- **输入** 是否带 `--cfg job`，以及可选的 `--package model`。
- **动作** 配置预览模式打印合并后的配置并退出。正常运行模式把合并结果传给 `main(cfg)`。
- **产物** 预览时得到 YAML 文本。正常运行时进入后续初始化。
- **源码** `train_plm.py`（脚本入口） · Hydra 参数说明：`https://hydra.cc/docs/1.3/advanced/hydra-command-line-flags/`

- **代码位置** 终端命令，在项目根目录执行；启动文件为 `train_plm.py`，配置由 Hydra 处理。

```bash
# 只查看最终模型配置，不训练
poetry run python train_plm.py experiment=mdace_icd9_code/plm_icd --cfg job --package model
```

- **读法** --package model 让输出只留下模型这一部分。看到 name: PLMICD 和 configs.model_path，就知道将来会创建哪个类、从哪里加载基础编码器。这个预览不会验证数据是否齐全或模型是否能正常运行。
> **补充解释** 想看当前用的是哪个模型，可以执行 `poetry run python train_plm.py experiment=mdace_icd9_code/plm_icd --cfg job --package model`。这条命令只打印模型配置。

### 1.5 设置随机性与运行设备

- **输入** `cfg.seed`、`cfg.deterministic`、GPU 配置和当前 CUDA 环境。
- **动作** 按需启用确定性设置，用 `set_seed()` 设置随机种子，再用 `set_gpu()` 得到设备。
- **产物** 统一的随机种子设置和 `device`，例如 CUDA 或 CPU。
- **源码** `train_plm.py`（初始化） · `explainable_medical_coding/utils/tensor.py`（设备选择） · `explainable_medical_coding/utils/seed.py`（随机种子）

- **代码位置** `train_plm.py`，`main()`，初始化设备与随机种子的部分。

```python
if cfg.deterministic:
    deterministic()
set_seed(cfg.seed)
device = set_gpu(cfg)
```

- **读法** device 是后面统一使用的设备。固定 seed 能让随机过程更容易复现，但不等于所有硬件和设置下的结果都完全相同。模型和一批数据之后需要放到同一设备上才能一起计算。
> **补充解释** 固定种子方便重复比较。做两种方法的对照时，也需要固定数据划分与训练预算。

## 02 读取病历并分词

**起点** `cfg.data`、原始病历数据和预训练模型配套的分词器。

**交接** `train`、`validation`、`test` 中每条病历新增 `input_ids`、`attention_mask`、`length`。

**流程**

1. `load_dataset(...)` 读病历。病历甲的正文用 `fever cough` 示意，这条记录里还带着已有的 ICD 标签。
2. 从预训练模型目录加载一次分词器，让后面所有病历都用同一份规则和词表。
3. 把病历甲交给分词器。假设两个文字片段的编号是 `41` 和 `98`，就得到 `input_ids = [41, 98]`，这里省略首尾特殊 token。
4. 写回 `attention_mask = [1, 1]` 和 `length = 2`。这时正文已经变成一串整数。到第 8.3 步，模型再拿整数查向量。

### 2.1 取出列名和两个路径

- **输入** `cfg.data.target_columns`、`cfg.data.dataset_path`、`cfg.load_model`。
- **动作** 把标签列名转为 Python 列表，把数据集加载脚本的地址转为 `Path`。旧实验目录有值时也转为 `Path`。
- **产物** `target_columns`、`dataset_path` 和供第 03～05 步使用的 `model_path` 或 `None`。
- **源码** `train_plm.py`（取配置值） · `explainable_medical_coding/config/data/mdace_inpatient_icd9_code.yaml`（数据组 YAML）

- **代码位置** `train_plm.py`，`main()`，第 2 部分开头。

```python
target_columns = list(cfg.data.target_columns)
dataset_path = Path(cfg.data.dataset_path)
model_path = Path(cfg.load_model) if cfg.load_model is not None else None
```

- **读法** list(...) 把配置里的标签列名取成列表；Path(...) 把路径文字包装成路径对象。最后一行是条件表达式：填了旧实验目录就保存路径，没填就得到 None。这里的 model_path 指旧实验存档；cfg.model.configs.model_path 指基础预训练模型，两者用途不同。
> **补充解释** 局部变量 `model_path` 指旧实验目录。后面 `cfg.model.configs.model_path` 指预训练分词器与编码器目录。

### 2.2 加载三份病历数据

- **输入** `dataset_path` 指向的 Python dataset builder，以及它要读取的 Parquet 文件。
- **动作** `load_dataset(str(dataset_path))` 按 builder 的定义读取病历并给出各个 split。
- **产物** 一个 `DatasetDict`，可以取 `dataset['train']`、`dataset['validation']` 和 `dataset['test']`。
- **源码** `train_plm.py`（加载数据） · `explainable_medical_coding/datasets/mdace_inpatient_icd9_code.py`（基础数据集的三个划分）

- **代码位置** `train_plm.py`，`main()`，`dataset = load_dataset(...)`。

```python
dataset = load_dataset(str(dataset_path))
```

- **读法** str(...) 把路径对象转成字符串交给加载函数。它调用 dataset_path 指定的 Python builder，builder 再读取 Parquet。得到的 dataset 里分别有 train、validation、test，各条记录已经含有 text 和人工整理好的 ICD 标签。
> **补充解释** 每条记录已经带有病历正文、诊断代码、操作代码等字段。训练集用于更新参数，验证集用于选择模型和阈值，测试集用于最终评估。

### 2.3 加载固定的文本分词器

- **输入** `cfg.model.configs.model_path`，基础实验指向 `models/roberta-base-pm-m3-voc-hf`。
- **动作** `AutoTokenizer.from_pretrained(...)` 读取预训练模型配套的分词规则和词表。
- **产物** 可重复调用的 `text_tokenizer` 对象。
- **源码** `train_plm.py`（加载分词器） · `README.md`（下载说明） · `Makefile`（下载命令实现）

- **代码位置** `train_plm.py`，`main()`，`AutoTokenizer.from_pretrained(...)`。

```python
text_tokenizer = AutoTokenizer.from_pretrained(
    cfg.model.configs.model_path,
)
```

- **读法** 这行准备一个可反复使用的分词器。它读取已有的切分规则和词表，尚未对每条病历分词。词表与编码器配套，包含完整词和子词，并非收集这批病历后临时做出的全部英文单词表。
> **补充解释** 这个医学 RoBERTa 的文本词表提前从 PubMed 文献学好，包含常见完整词和子词。一份词表供所有病历共用。基础实验运行前按 README 准备本地模型目录，可以用 `make download_roberta`。词表来源：`https://aclanthology.org/2020.clinicalnlp-1.17.pdf`

### 2.4 设置最大 token 长度

- **输入** `cfg.data.max_length`，基础实验里是 `6000`。
- **动作** 转成整数并传给分词器的 `max_length`，同时开启 `truncation=True`。
- **产物** 每条病历分词后的序列有统一的最长上限。
- **源码** `train_plm.py`（长度与截断） · `explainable_medical_coding/config/experiment/mdace_icd9_code/plm_icd.yaml`（基础实验长度配置）

- **代码位置** `train_plm.py`，`main()`，`max_input_length = ...`。

```python
max_input_length = int(cfg.data.max_length)
```

- **读法** int(...) 转成整数。基础实验上限为 6000 token，超过上限的内容在分词时截断；不是把一份病历缩成一个 6000 维向量。128 是后面编码器切块的长度，与这个总上限分别控制不同步骤。
> **补充解释** `6000` 是一份病历保留下来的 token 上限。`chunk_size=128` 是 RoBERTa 一块编码多少 token，发生在第 08 步的前向传播中。

### 2.5 对每个 split 逐批分词

- **输入** `dataset.map()` 交进来的 `x['text']`，即一批病历字符串。
- **动作** `text_tokenizer(...)` 切出 token、查词表编号，按配置截断，再返回掩码和序列长度。
- **产物** 每条记录写入 `input_ids`、`attention_mask` 和 `length`，原始病历与 ICD 字段也供后续使用。
- **源码** `train_plm.py`（批量分词）

- **代码位置** `train_plm.py`，`main()`，带有 `desc="Tokenizing text"` 的 `dataset.map(...)`。

```python
dataset = dataset.map(
    lambda x: text_tokenizer(
        x[TEXT_COLUMN], return_length=True,
        truncation=True, max_length=max_input_length,
    ),
    batched=True, num_proc=8, batch_size=1_000,
    desc="Tokenizing text",
)
```

- **读法** map 表示把这个处理应用到数据记录上。lambda x: ... 是一个临时函数；batched=True 时 x['text'] 是一批文本。return_length 要长度，truncation 开启截断。这里一次预处理 1000 条，不代表训练时一次喂 1000 条。得到的 input_ids 仍是一串整数，向量要等模型里的 embedding 层生成。
> **补充解释** 加载分词器是准备规则，逐批分词是反复使用规则。`batched=True` 让 `x['text']` 成为文本列表，`batch_size=1000` 和 `num_proc=8` 控制预处理。第 06 步另有训练批大小和补齐规则。

## 03 整理 ICD 标签与类别索引

**起点** 每条病历已有的诊断代码列表、操作代码列表和分词结果。

**交接** `target_ids`、固定的 ICD 类别顺序，以及模型和评估要用的 `lookups`。

**流程**

1. **取两栏。** 病历甲的诊断栏是 `["250.00"]`，操作栏是 `["39.61"]`。这两栏的值已经写在数据里。
2. **把列表接起来。** `["250.00"]` 接上 `["39.61"]`，得到这条病历的 `target = ["250.00", "39.61"]`。每栏可以有好几个代码，也可以为空。
3. **给整个实验做一张编号表。** 假设所有病历总共只出现过三个代码。排好之后，`"250.00" → 0`，`"272.4" → 1`，`"39.61" → 2`。每个编号对应一个单独的代码。
4. **病历甲查表。** `"250.00"` 查到 `0`，`"39.61"` 查到 `2`，所以 `target_ids = [0, 2]`，意思是「这条病历有第 0 和第 2 个代码」。
5. **第 6.4 步填 0/1。** 先摆出三个位置 `[0, 0, 0]`，把位置 `0` 和 `2` 改成 `1`，得到 `[1, 0, 1]`。如果有 5000 个候选 ICD，做法一样，只是每行有 5000 格。
6. **一批病历就是好几行。** 例如病历乙只有 `"272.4"`，查表得到 `[1]`，于是填成 `[0, 1, 0]`。把甲、乙两行叠起来，就是下面这张 0/1 表。

| 一行是一条病历 | 第 0 列 `250.00` | 第 1 列 `272.4` | 第 2 列 `39.61` |
| --- | --- | --- | --- |
| 病历甲，`target_ids = [0, 2]` | **1** | 0 | **1** |
| 病历乙，`target_ids = [1]` | 0 | **1** | 0 |

### 3.1 合并每条病历的诊断和操作代码

- **输入** 单条记录里 `diagnosis_codes` 和 `procedure_codes` 两个列表。
- **动作** `create_targets_column()` 按列名取值，跳过 `None`，将保留的列表接起来。
- **产物** 一条病历的 ICD 字符串列表 `target`，例如诊断 `[A]` 和操作 `[C]` 得到 `[A, C]`。
- **源码** `train_plm.py`（调用位置） · `explainable_medical_coding/utils/data_helper_functions.py`（合并标签）

- **代码位置** `explainable_medical_coding/utils/data_helper_functions.py`，`create_targets_column()`。

```python
# create_targets_column() 中的核心代码
example[TARGET_COLUMN] = []
for target_column in target_columns:
    if example[target_column] is not None:
        example[TARGET_COLUMN] += example[target_column]
```

- **读法** 先准备空列表，再逐栏把列表内容接进去。比如诊断 ['250.00'] 和操作 ['39.61'] 得到 target=['250.00', '39.61']。这里的 += 是列表拼接。两栏各自都可以有多个代码，因此不是给一个固定二元组分类。
> **补充解释** 诊断代码记录诊断的问题，操作代码记录做过的手术或医疗操作。每列可以有零个、一个或多个代码。这些是数据集提供的标准答案，模型的预测发生在后面。

### 3.2 收集已知代码并筛每条病历的标签

- **输入** 各 split 中每条病历的 `target` 列表。
- **动作** `get_unique_targets()` 展开所有 `target` 并取并集。`filter_unknown_targets()` 根据这份集合逐个检查每条病历的代码。
- **产物** `known_targets` 集合和逐条检查后的 `target`。
- **源码** `train_plm.py`（收集并筛选） · `explainable_medical_coding/utils/data_helper_functions.py`（收集各 split 的代码）

- **代码位置** `train_plm.py`，`main()`，收集 `known_targets` 及过滤标签的部分。

```python
known_targets = set(get_unique_targets(dataset))
dataset = dataset.map(
    lambda x: filter_unknown_targets(x, known_targets=known_targets),
    desc="Filter unknown targets",
)
```

- **读法** set(...) 得到不重复的代码集合。注意这个仓库从当前所有 split 收集已出现的代码，再用它过滤同一份数据，所以通常不会删掉现有代码。它不是只拿训练集制作标签表；换数据复用旧模型时，还要检查旧编号表是否收录了新数据的代码。
> **补充解释** 这份集合来自当前数据的 train、validation、test，所以通常会保留当前数据里已有的代码。验证集或测试集独有的代码也会进入这张集合。

### 3.3 去掉空标签病历

- **输入** 已整理好 `target` 的三份数据。
- **动作** `dataset.filter(...)` 检查每条病历是否满足 `len(target) > 0`。
- **产物** 后续只处理至少有一个 ICD 标签的病历。
- **源码** `train_plm.py`（过滤空标签）

- **代码位置** `train_plm.py`，`main()`，带有 `desc="Filtering empty targets"` 的 `dataset.filter(...)`。

```python
dataset = dataset.filter(
    lambda x: len(x[TARGET_COLUMN]) > 0,
    desc="Filtering empty targets",
)
```

- **读法** filter 保留判断为 True 的整条记录。len(target)>0 就是这条病历至少还有一个标签。map 常用于改记录或加字段，filter 用于决定整条记录是否留下。
> **补充解释** 3.2 的检查单位是一个代码，3.3 的检查单位是一整条病历。

### 3.4 新建或恢复类别编号表

- **输入** `cfg.model.autoregressive`、数据里出现过的唯一代码，以及可选的旧实验词表。
- **动作** 创建 `TargetTokenizer`。新实验将单个 ICD 代码去重、排序、从 0 编号；旧实验从 `target_tokenizer.json` 恢复同样的列顺序。
- **产物** `target2id` 和 `id2target`，示例为 `A→0、B→1、C→2`。
- **源码** `train_plm.py`（新建与加载分支） · `explainable_medical_coding/utils/tokenizer.py`（类别编号）

- **代码位置** `explainable_medical_coding/utils/tokenizer.py`，`TargetTokenizer.fit()`，普通多标签分支的节选。

```python
# TargetTokenizer.fit() 中的核心代码
self.id2target = sorted(list(set(targets)))
self.target2id = {
    target: idx for idx, target in enumerate(self.id2target)
}
```

- **读法** set 去重，sorted 排序，enumerate 从 0 配上编号。这个 fit() 只是建查找表，没有 loss、backward 或参数更新。假设顺序为 A、B、C，就建立 A→0、B→1、C→2。加载旧模型时必须沿用旧表，否则同一输出列可能被误读成另一种 ICD。
> **补充解释** 编号的单位是每个 ICD 代码。`[0, 2]` 读作这条病历有第 0 类和第 2 类。若换数据加载旧模型，先确认新数据里的代码都在旧词表中，旧表缺少某个代码时，`encode()` 查表会报 `KeyError`。

### 3.5 把每条病历的标签转成编号列表

- **输入** 某条病历的 `target = [A, C]` 以及类别编号表。
- **动作** `target_tokenizer(target)` 逐个查表并写入新字段。
- **产物** `target_ids = [0, 2]`。各病历可以有不同数量的标签。
- **源码** `train_plm.py`（生成 target_ids） · `explainable_medical_coding/utils/tokenizer.py`（逐项查表）

- **代码位置** `train_plm.py`，`main()`，生成 `target_ids` 的部分；注释中的查表语句来自 `explainable_medical_coding/utils/tokenizer.py` 的 `TargetTokenizer.encode()`。

```python
dataset = dataset.map(
    lambda x: {"target_ids": target_tokenizer(x[TARGET_COLUMN])},
    desc="Converting targets to target ids",
)
# 编号器内部逐个查表：
# encoded_targets = [self.target2id[target] for target in targets]
```

- **读法** 外层给记录添加 target_ids，内层逐个代码查字典。A 和 C 分别查到 0 和 2，所以得到 [0, 2]。这个列表表示本病历命中了哪几列，此时还没展开成 [1, 0, 1]。
> **补充解释** 长度等于类别数的答案向量在第 06 步组批时展开。文本词表的 ID 指向 embedding 表的行，ICD 类别的 ID 指向模型输出的列。

### 3.6 设置读出格式

- **输入** `input_ids`、`length`、`attention_mask`、`target_ids` 四列。
- **动作** `dataset.set_format(type='torch', columns=...)` 指定取出这些列时的格式。
- **产物** 训练组件读取这几列时得到张量，组批时仍按各病历实际长度处理。
- **源码** `train_plm.py`（设置 PyTorch 格式）

- **代码位置** `train_plm.py`，`main()`，`dataset.set_format(...)`。

```python
dataset.set_format(
    type="torch",
    columns=["input_ids", "length", "attention_mask", "target_ids"],
)
```

- **读法** 指定这些字段取出来时采用 PyTorch 张量格式。张量可以是一串数、一张表或更多层的数字排列。这个设置不会把不同长度的病历补齐；补齐发生在真正取一批时。
> **补充解释** 数据仍保存原始 `text`、`target` 等列，后面的统计流程可以切换读取格式取这些字段。

### 3.7 计算模型与评估要用的数据统计

- **输入** 已处理的 dataset、文本分词器和 ICD 编号器。
- **动作** `get_lookups()` 记录样本数、类别数、文本词表大小与补齐 ID，并统计各个 split 出现过的类别列。
- **产物** `lookups.data_info`、`lookups.split2code_indices` 和 `lookups.target_tokenizer`。
- **源码** `explainable_medical_coding/utils/lookups.py`（打包 Lookups） · `train_plm.py`（打印数据统计）

- **代码位置** `train_plm.py`，`main()`，`factories.get_lookups(...)` 及其后的日志语句。

```python
lookups = factories.get_lookups(
    dataset=dataset,
    text_tokenizer=text_tokenizer,
    target_tokenizer=target_tokenizer,
)
LOGGER.info(lookups.data_info)
```

- **读法** 这一步把各处会用到的信息放到一起：有多少样本、有多少 ICD 类别、文本词表多大、补齐用哪个 ID。比如 num_classes=3，下一步就知道模型每条病历要输出 3 个分数。LOGGER.info 是打印统计信息。
> **补充解释** 如果 `num_classes=3`，第 04 步就创建能输出 3 列的模型。`utils` 是项目存放可复用工具代码的目录，主流程在 `train_plm.py` 中调用它们。

## 04 创建或加载模型

**起点** `cfg.model`、`lookups.data_info`，以及新建或加载旧实验的选择。

**交接** 一个放在运行设备上的 `model`，调用时接收文本张量并返回 ICD 原始分数。

**流程**

1. 看 `cfg.load_model`。留空就新建，填了旧实验目录就加载旧权重。
2. 新建时，`name: PLMICD` 选中模型类，`configs.model_path` 选中医学 RoBERTa。假设我们有 3 个 ICD 类别，就创建能打出 3 个分数的分类头。
3. 加载旧模型时，先对上旧类别表，用旧 `config.yaml` 搭模型，再把 `best_model.pt` 的权重装进去。
4. 两条路都拿到了 `model`，然后执行 `model.to(device)`。它之后会收到病历编号，返回类似 `[2.0, -3.0, 1.0]` 的三个分数。

### 4.1 根据旧实验目录选择分支

- **输入** 第 2.1 步得到的 `model_path`，来自 `cfg.load_model`。
- **动作** `model_path is None` 时走 4.2～4.3 新建分支。有目录时走 4.4 加载分支。
- **产物** 两条分支都建立 `model`，然后汇合到 4.5。
- **源码** `train_plm.py`（选择建模分支）

- **代码位置** `train_plm.py`，`main()`，第 4 部分，新建或加载模型的分支节选。

```python
if model_path is None:
    model = factories.get_model(config=cfg.model, data_info=lookups.data_info)
else:
    saved_config = OmegaConf.load(model_path / "config.yaml")
    # 接下来调用 load_trained_model() 恢复旧模型
```

- **读法** 等号左边的 model 就是后面真正调用的模型对象。新建分支从基础预训练编码器开始，另建 ICD 分类头；加载分支恢复某次 ICD 训练的权重。Path 对象用 / 拼接路径，所以 model_path / 'config.yaml' 是旧实验目录下的配置文件。
> **补充解释** 第 01 步已经决定新建时选哪份 YAML。旧模型分支从旧实验保存的配置恢复其模型结构。

### 4.2 新建分支：找到 `PLMICD` 类并加载编码器

- **输入** `cfg.model.name='PLMICD'`、`cfg.model.configs`、类别数及文本补齐 ID。
- **动作** `get_model()` 按 `name` 找到 Python 类，调用构造函数。`AutoModel.from_pretrained()` 根据配置加载医学 RoBERTa。
- **产物** 能把 token ID 变成带上下文向量的预训练编码器。
- **源码** `explainable_medical_coding/config/factories.py`（工厂） · `explainable_medical_coding/models/models.py`（模型构造）

- **代码位置** `explainable_medical_coding/config/factories.py`，`get_model()`。

```python
# explainable_medical_coding/config/factories.py：按名字找到类，再调用构造函数
model_class = getattr(models, config.name)
return model_class(**data_info, **config.configs)

```

- **代码位置** `explainable_medical_coding/models/models.py`，`PLMICD.__init__()`，加载基础编码器的部分。

```python
# explainable_medical_coding/models/models.py：PLMICD.__init__() 中读取基础编码器
self.roberta_encoder = AutoModel.from_pretrained(
    model_path, config=self.config, add_pooling_layer=False
)
```

- **读法** getattr(models, 'PLMICD') 可以理解成按名字取出 models.PLMICD。** 把字典里的键值展开成构造参数，例如 num_classes=3、chunk_size=128。RoBERTa 已经有预训练权重，但新建的 ICD 分类头还需要通过后面的标签训练。
> **补充解释** Windows 工作区按 README 准备分词器和基础编码器目录即可开始配置新训练，论文作者已训练的 ICD checkpoint 可以用于复用旧实验。

### 4.3 新建分支：装上 ICD 分类头

- **输入** `num_classes`、编码器的向量维数、`cross_attention` 和 `scale`。
- **动作** 基础配置选 `LabelCrossAttention`，为每个 ICD 类别建立可训练的类别表示；`cross_attention=false` 对应 `LabelAttention`。
- **产物** 完整的 `PLMICD` 对象。每条病历最后有 `num_classes` 个输出分数。
- **源码** `explainable_medical_coding/models/models.py`（分类头选择） · `explainable_medical_coding/models/modules/attention.py`（分类头实现）

- **代码位置** `explainable_medical_coding/models/models.py`，`PLMICD.__init__()`，选择标签注意力分类头的部分。

```python
if cross_attention:
    self.label_wise_attention = LabelCrossAttention(
        input_size=self.config.hidden_size,
        num_classes=num_classes, scale=scale,
    )
else:
    self.label_wise_attention = LabelAttention(
        input_size=self.config.hidden_size,
        projection_size=self.config.hidden_size,
        num_classes=num_classes,
    )
```

- **读法** 完整模型有两大部分：RoBERTa 把文字变成带上下文的向量，标签分类头用这些向量给每个 ICD 打分。cross_attention 选择分类头实现。它是深度多标签分类模型；最后的 sigmoid 与逻辑回归输出形式相似，整个模型还有前面的 Transformer 和标签注意力。
> **补充解释** RoBERTa 负责读文字，分类头负责给 ICD 打分。完整模型是深度多标签分类器，最后的线性打分加 sigmoid 与逻辑回归的输出形式相同。`mask_input=false` 走常规前向；打开时选模型的输入遮挡分支。
> **补充解释** 这份模型 YAML 中的 `loss` 和 `lambda_1` 被 PLMICD 构造函数的 `**kwargs` 接收，但该构造函数没有使用它们。实际训练损失由 `cfg.loss` 交给损失工厂选择；基础实验对应 `explainable_medical_coding/config/loss/bce.yaml`。不能只改一个名字相似的配置项，就认为损失已经改变。

### 4.4 加载分支：用三份文件恢复模型

- **输入** 旧实验的 `target_tokenizer.json`、`config.yaml`、`best_model.pt`。
- **动作** 第 03 步先恢复 ICD 列顺序。这里按旧 `config.yaml` 搭出模型，再将 `best_model.pt` 里的权重装进去，并读取旧阈值。
- **产物** 带旧权重的模型和旧 `decision_boundary`，模型暂时处于 `eval` 模式。
- **源码** `train_plm.py`（训练入口加载分支） · `explainable_medical_coding/utils/loaders.py`（恢复模型权重）

- **代码位置** `explainable_medical_coding/utils/loaders.py`，`load_trained_model()`，常规权重加载分支的节选。

```python
# explainable_medical_coding/utils/loaders.py：省略兼容 torch.compile 的部分
checkpoint = torch.load(experiment_path / "best_model.pt", map_location=device)
num_classes = checkpoint["num_classes"]
model = factories.get_model(
    config.model, {"num_classes": num_classes, "pad_token_id": pad_token_id}
)
model.load_state_dict(checkpoint["model"])
model.eval()
```

- **读法** 先按旧配置搭出结构，再把保存的参数填进去。target_tokenizer.json 决定输出各列的含义，config.yaml 决定结构和设置，best_model.pt 放训练存档。这里读取模型权重后，主入口仍会新建优化器，所以不能直接等同于完整恢复中断前的训练状态。
> **补充解释** checkpoint 像训练存档。`load_model` 用旧权重作为新训练的起点，本次优化器与训练轮数由后面重新创建。严格续跑还涉及原来的优化器、轮数、学习率调度等状态。

### 4.5 把模型移到指定设备

- **输入** 新建或恢复的 `model`，以及第 01 步得到的 `device`。
- **动作** 调用 `model.to(device)`，迁移模型参数和缓冲区。
- **产物** 设备上的模型。后续每个训练批次也会移到同一设备。
- **源码** `train_plm.py`（移动模型）

- **代码位置** `train_plm.py`，`main()`，第 4 部分末尾的 `model.to(device)`。

```python
model.to(device)
```

- **读法** 把模型参数放到指定设备，不会在这里训练。以后 batch 也需要移到相同设备。model(...) 会调用 PyTorch 模块的 forward()，它才是一次前向计算；forward 之后仍要算损失和更新参数，才能构成一次训练更新。
> **补充解释** 将来调用 `logits = model(input_ids, attention_masks)` 才会生产分数。模型输入走病历正文这条路，真实 0/1 标签稍后交给损失函数。

## 05 可选：生成教师分数

**起点** `cfg.distillation`、模型和分好词的病历数据。

**交接** 基础实验直接进入 06。蒸馏实验会额外给每条病历添加 `teacher_logits`。

**流程**

1. 基础实验的 `distillation=false`，直接到第 06 步。开启蒸馏时，先找到第 04 步加载的旧模型。
2. 把病历发给旧模型做一遍预测。比如旧模型为病历甲打出 `[2.0, -3.0, 1.0]`。
3. 把这组分数存成 `teacher_logits`。之后同一个模型在训练中继续更新，之前保存的那组三个分数留作参考。

### 5.1 检查蒸馏是否开启

- **输入** `cfg.distillation` 和旧实验目录。
- **动作** 为 `false` 时跳到 06。为 `true` 时要求已有模型目录，为空则报错。
- **产物** 普通训练继续使用原数据；蒸馏分支继续使用第 04 步加载的旧模型。
- **源码** `train_plm.py`（蒸馏条件） · `explainable_medical_coding/config/config.yaml`（基础默认值）

- **代码位置** `train_plm.py`，`main()`，第 5 部分的 `if cfg.distillation:`。

```python
if cfg.distillation:
    if model_path is None:
        raise ValueError("Distillation requires a pre-trained model")
```

- **读法** 蒸馏使用已有模型的预测作为额外参考。基础实验 distillation=false，整段跳过。开启开关只会进入生成教师输出的分支，具体训练损失是否利用这些输出，还取决于选择的损失函数。
> **补充解释** 教师就是这次更新之前的模型。先把它的输出存下来，就可以用同一个模型对象继续训练学生。

### 5.2 排序并切到推理模式

- **输入** 各份数据的 `length` 和旧模型。
- **动作** 按长度排序并执行 `model.eval()`，关闭 dropout 等训练态行为。
- **产物** 长度相近的病历相邻，模型准备做固定教师预测。
- **源码** `train_plm.py`（排序和模式切换）

- **代码位置** `train_plm.py`，`main()`，蒸馏分支中的排序与 `model.eval()`。

```python
dataset = dataset.sort("length")
model.eval()
```

- **读法** 排序让长短接近的病历更可能排在一起，减少补齐。eval() 把模型切到评估行为，例如停用 dropout；它本身不等于禁止梯度。这里的批量预测函数另外用 no_grad 禁止计算梯度。
> **补充解释** 同批病历长度接近，补齐的 token 一般更少。`eval()` 管模型行为，预测函数的 `no_grad()` 管梯度计算。

### 5.3 逐批前向得到原始 ICD 分数

- **输入** `map()` 中每次最多 64 条病历的 `input_ids`、补齐 ID 和旧模型。
- **动作** `predict()` 补齐输入，在 `no_grad()` 下运行前向。`return_logits=True` 选择 sigmoid 前的分数。
- **产物** 每条病历一组固定的教师分数，例如 `[2.0, -3.0, 1.0]`。
- **源码** `train_plm.py`（生成教师分数） · `explainable_medical_coding/utils/analysis.py`（预测函数）

- **代码位置** `train_plm.py`，`main()`，蒸馏分支中传给 `dataset.map()` 的预测调用；被调用函数定义在 `explainable_medical_coding/utils/analysis.py` 的 `predict()`。

```python
# train_plm.py 中传给 map 的预测部分
predict(
    model, x["input_ids"], device=device,
    return_logits=True, pad_id=text_tokenizer.pad_token_id,
)
```

- **读法** return_logits=True 要的是未经过 sigmoid 的原始分数，例如 [2.0, -3.0, 1.0]。predict() 内部做批量前向，没有在这一步执行 optimizer.step()。这里保存的分数是训练继续之前的模型输出。
> **补充解释** 当前 `predict()` 自己构造全 1 的注意力掩码。第 06 步训练 DataLoader 则会把它补齐的位置标为 0。这里的 64 也独立于训练 batch 大小。

### 5.4 写回预测，再切回训练模式

- **输入** 教师分数和还未更新的模型。
- **动作** 把预测存入数据集的 `teacher_logits` 列，执行 `model.train()`。组批时会把该列放进 `Batch`。
- **产物** 训练时可以读取教师分数和原始标签。使用遮挡蒸馏损失时，先对教师 logits 做 sigmoid，再与学生概率比较。
- **源码** `train_plm.py`（保存后切回训练） · `explainable_medical_coding/utils/loss_functions.py`（读取教师分数）

- **代码位置** `train_plm.py`，`main()`，蒸馏分支中写入 `teacher_logits` 的回调和末尾的 `model.train()`。

```python
# map 回调返回这个新字段，预测结果写入数据集
# {"teacher_logits": predict(...)}
model.train()
```

- **读法** map 返回的字典给每条记录加 teacher_logits。存好后，同一个模型对象切回训练模式并继续更新；保存在数据里的旧分数保持不变。train() 只是切模式，真正更新还在第 8 步。
> **补充解释** 真实标签 `[1, 0, 1]` 只标记有无。教师概率例如 `[0.88, 0.05, 0.73]`，还表达了旧模型对各类打分的高低。

## 06 准备数据批次、损失和指标

**起点** 已整理的 dataset、两个词表、模型和 `cfg.loss`、`cfg.dataloader`、`cfg.metrics`。

**交接** 可以取 `Batch` 的 `dataloaders`、可调用的 `loss_function`，以及各 split 的指标统计对象。

**流程**

1. 按 `cfg.loss` 选好二元交叉熵。以后每次取到一批病历，就用它对照模型打分和答案。
2. DataLoader 取出病历甲和乙。假设甲的编号是 `[41, 98]`、乙是 `[52, 73, 89]`，就把甲补成 `[41, 98, 1]`，掩码是 `[1, 1, 0]`。末尾的 `1` 是这里假设的补齐 ID。
3. 甲的标签编号 `[0, 2]` 填成 `[1, 0, 1]`，乙的 `[1]` 填成 `[0, 1, 0]`。叠起来就是 `targets = [[1, 0, 1], [0, 1, 0]]`，形状是 `2 条病历 × 3 个 ICD`。
4. 把正文编号、掩码和答案一起装进 `Batch`。F1 等指标也在这里准备好，等后面用预测和答案来统计。

### 6.1 按配置选损失函数

- **输入** `cfg.loss.name` 和该损失函数的参数。基础版从 `explainable_medical_coding/config/loss/bce.yaml` 得到 `binary_cross_entropy_loss`。
- **动作** 工厂按名字找到函数，用 `partial()` 绑定配置参数。
- **产物** 可调用的 `loss_function`，第 08 步才用具体的 batch 算损失。
- **源码** `train_plm.py`（选择损失） · `explainable_medical_coding/config/loss/bce.yaml`（BCE 配置） · `explainable_medical_coding/config/factories.py`（损失工厂）

- **代码位置** `train_plm.py`，`main()`，第 6 部分的损失工厂调用；注释中的损失名称来自 `explainable_medical_coding/config/loss/bce.yaml`。

```python
loss_function = factories.get_loss_function(config=cfg.loss)
# explainable_medical_coding/config/loss/bce.yaml 中：
# name: binary_cross_entropy_loss
```

- **读法** 这一步取出一个以后可调用的损失函数，还没有计算某批数据的 loss。阅读这个仓库要注意：binary_cross_entropy_loss() 内部会先调用 model(...) 做预测，再算损失，所以训练器里不一定直接出现 logits=model(...) 这一行。
> **补充解释** 基础训练的损失由顶层 `cfg.loss` 选择。模型 YAML 里同名的 `loss`、`lambda_1` 落进 `PLMICD` 的 `**kwargs`。遮挡等实验实际使用的附加损失权重在 `cfg.loss.configs.lambda_1`。

### 6.2 按数据划分创建 DataLoader

- **输入** `train`、`validation`、`test`、每批病历上限和分桶配置。
- **动作** 用 `BaseDataset` 包装各 split，并从 `train` 抽约 10% 供 `train_val` 评估。训练批大小取 `batch_size` 和 `max_batch_size` 中较小的值。
- **产物** `dataloaders['train']`、`['train_val']`、`['validation']`、`['test']`。
- **源码** `explainable_medical_coding/config/factories.py`（构造各 DataLoader） · `explainable_medical_coding/data/batch_sampler.py`（按长度分桶）

- **代码位置** `explainable_medical_coding/config/factories.py`，`get_dataloaders()`，未启用长度分桶时的分支节选。

```python
# explainable_medical_coding/config/factories.py：没有长度分桶时的 DataLoader 分支
train_batch_size = min(config.batch_size, config.max_batch_size)
dataloaders["train"] = torch.utils.data.DataLoader(
    datasets_dict["train"], shuffle=True,
    batch_size=train_batch_size, drop_last=config.drop_last,
    collate_fn=datasets_dict["train"].collate_fn,
    num_workers=config.num_workers, pin_memory=config.pin_memory,
)
```

- **读法** Dataset 保存记录；DataLoader 决定一次拿多少条、如何排列；collate_fn 把选中的记录拼成能计算的一批。基础实验还开启了按长度分桶，对应同文件的另一个分支。train_val 是抽出的训练样本观察集，不能替代独立 validation。
> **补充解释** `train_val` 的样本仍在原训练集，它用来观察训练数据上的表现。独立验证走 `validation`。训练分桶倾向把长度接近的病历放在一批。

### 6.3 取一批时补齐正文和掩码

- **输入** 某个 DataLoader 选中的记录，病历 token 长度可以不同。
- **动作** `collate_fn()` 把 `input_ids` 补到这批中最长的长度，文本位置用对应的 pad ID；`attention_masks` 在补齐位置用 0。
- **产物** 两个形状为 `[B, T]` 的张量。`B` 是这批病历数，`T` 是这批补齐后的 token 长度。
- **源码** `explainable_medical_coding/data/dataloader.py`（组批与补齐）

- **代码位置** `explainable_medical_coding/data/dataloader.py`，`BaseDataset.collate_fn()`，两处补齐语句。

```python
# BaseDataset.collate_fn() 中的关键两行
input_ids = self.pad(sequence=batch["input_ids"], pad_id=self.pad_token_id)
attention_masks = self.pad(sequence=batch["attention_mask"], pad_id=0)
```

- **读法** 例如两条正文分别长 2 和 3，就把短的补到 3。补齐 ID 假设为 1：正文 [41,98] 变成 [41,98,1]，对应掩码是 [1,1,0]。正文里的数字 1 是词表编号；掩码里的 1 表示有效位置，两种 1 的含义不同。
> **补充解释** 假设补齐 ID 是 1，较短的一条可以从 `[0, 124, 2]` 变成 `[0, 124, 2, 1]`，掩码变为 `[1, 1, 1, 0]`。

### 6.4 按 ICD 类别表展开每条标签

- **输入** 例如两条病历的 `target_ids` 是 `[0, 2]` 和 `[1]`，全局共有 3 类。
- **动作** 为每条病历建长度 `C` 的向量，将编号出现的位置设为 1，再把这些向量叠起来。
- **产物** `Batch.targets = [[1, 0, 1], [0, 1, 0]]`，形状 `[B, C]`。正文张量和可选教师分数也随 `Batch` 返回。
- **源码** `explainable_medical_coding/data/dataloader.py`（展开并组装 Batch） · `explainable_medical_coding/utils/tokenizer.py`（生成 0/1 标签）

- **代码位置** `explainable_medical_coding/data/dataloader.py`，`BaseDataset.collate_fn()`，非自回归标签分支。

```python
# BaseDataset.collate_fn() 的非自回归分支
targets = self.target_tokenizer.torch_one_hot_encoder(target_ids_list)

```

- **代码位置** `explainable_medical_coding/utils/tokenizer.py`，`TargetTokenizer.torch_one_hot_encoder()`。

```python
# TargetTokenizer.torch_one_hot_encoder() 内部
target_ids = [
    torch.nn.functional.one_hot(target_id, num_classes=len(self)).sum(0).bool()
    for target_id in target_ids
]
return torch.vstack(target_ids).float()
```

- **读法** 以 [0,2]、总共 3 类为例：one_hot 先给出 [[1,0,0],[0,0,1]]，sum(0) 合并成 [1,0,1]，bool 把重复命中归为有或无。vstack 把多份病历叠成多行，float 转成损失函数使用的小数类型。函数名写 one_hot，最终每条病历可有多个 1，通常称 multi-hot。
> **补充解释** 每份病历有自己的 0/1 向量，同一次实验里所有病历共用列顺序。同一列在 `logits` 和 `targets` 里代表同一个 ICD。

### 6.5 创建评估指标对象

- **输入** `cfg.metrics`、全局类别数，以及各 split 的 `split2code_indices`。
- **动作** 给每个 split 独立创建 F1、精确率、召回率、mAP 等统计对象。部分指标按相应类别列统计。
- **产物** `metric_collections`，训练或验证时逐批喂入概率与真实值。
- **源码** `explainable_medical_coding/config/factories.py`（指标工厂） · `explainable_medical_coding/config/metrics/defaults.yaml`（默认指标）

- **代码位置** `train_plm.py`，`main()`，第 6 部分的 `factories.get_metric_collections(...)`。

```python
metric_collections = factories.get_metric_collections(
    config=cfg.metrics,
    number_of_classes=lookups.data_info["num_classes"],
    split2code_indices=lookups.split2code_indices,
    autoregressive=cfg.model.autoregressive,
)
```

- **读法** 每份数据分别准备统计对象，避免训练集和验证集的结果混在一起。精确率看选中的代码有多少选对，召回率看应该选中的有多少找到了，F1 综合两者；mAP 还考察模型是否把正确类别排在更前面。它们用于评估，参数更新用的是 loss。
> **补充解释** 损失用来计算参数梯度。F1、mAP 等用来观察预测质量，其中基础实验以验证集 mAP 选择最佳模型。

## 07 准备优化器与更新规则

**起点** 模型参数、DataLoader 报告的批次数、训练轮数和相关 YAML。

**交接** `optimizer`、梯度累积次数、`lr_scheduler` 和 `callbacks`。

**流程**

1. 把模型参数交给 AdamW，告诉它初始配置里的学习率是 `5e-5`。
2. 如果显存一次只能放 8 条，而你想用 16 条算一次更新，就先跑第一批 8 条算梯度，再跑第二批 8 条把梯度累加起来。
3. 每两小批更新一次。假设一轮有 5 小批，就在第 2、4、5 批之后分别尝试更新，预计一轮 3 次，3 轮就是 9 次。
4. 按预计更新次数安排学习率。再把记录日志、保存最佳模型、早停这些动作交给回调。

### 7.1 创建优化器

- **输入** `cfg.optimizer` 与 `model.parameters()`。基础实验使用 AdamW，配置学习率为 `5e-5`。
- **动作** 按名字创建优化器，把要更新的参数和学习率交给它。启用权重衰减时，工厂会给某些 bias、LayerNorm 参数单独分组。
- **产物** 可在训练时根据 `.grad` 更新参数的 `optimizer`。
- **源码** `explainable_medical_coding/config/factories.py`（优化器工厂） · `explainable_medical_coding/config/experiment/mdace_icd9_code/plm_icd.yaml`（基础实验学习率）

- **代码位置** `train_plm.py`，`main()`，第 7 部分的优化器调用；注释说明对应 `explainable_medical_coding/config/factories.py` 的 `get_optimizer()` 和基础实验 YAML。

```python
optimizer = factories.get_optimizer(config=cfg.optimizer, model=model)
# weight_decay 为 0 时，工厂把 model.parameters() 直接交给优化器
# 基础实验最终选择 AdamW，lr=5e-5
```

- **读法** model.parameters() 给出需要学习的参数集合，包含编码器和分类头中的参数。创建 AdamW 相当于准备好更新规则。backward() 把梯度写进参数的 .grad，优化器之后读取它来修改参数。学习率 5e-5 就是 0.00005。
> **补充解释** `backward()` 算的是参数梯度，优化器负责实际修改参数。SGD 的简化更新是 `新参数 = 旧参数 - 学习率 × 梯度`，这个项目用 AdamW 实现更新。

### 7.2 计算攒几批梯度才更新一次

- **输入** 目标 `batch_size` 和单批上限 `max_batch_size`。
- **动作** 用 `int(max(batch_size / max_batch_size, 1))` 得到 `accumulate_grad_batches`。
- **产物** 更新间隔。目标 16、单批最多 8 时是 2 个小 batch；基础实验 16 和 16 得到 1。
- **源码** `train_plm.py`（计算累积次数）

- **代码位置** `train_plm.py`，`main()`，第 7 部分的 `accumulate_grad_batches` 计算。

```python
accumulate_grad_batches = int(
    max(cfg.dataloader.batch_size / cfg.dataloader.max_batch_size, 1)
)
```

- **读法** 目标 16、一次最多 8，结果为 2：先用两批各算一次梯度，攒到一起再更新。基础实验是 16/16=1，每批通常更新一次。此公式向下取整，所以 20/8 也得到 2，不能直接说任何目标批大小都能被精确实现。
> **补充解释** 两个小批都做 `backward()` 后，梯度才交给优化器更新一次。当前实现使用 `int` 向下取整，例如 20 除以 8 得到的间隔也是 2。

### 7.3 估算整个实验有多少次更新

- **输入** `len(dataloaders['train'])`、累积次数和 `cfg.trainer.epochs`。
- **动作** 每轮预计更新 `ceil(批次数 / 累积次数)`，再乘计划轮数。
- **产物** `num_training_steps`。每轮 5 批、每 2 批更新、共 3 轮时，估计为 `3 × 3 = 9` 步。
- **源码** `train_plm.py`（计算更新步数） · `explainable_medical_coding/data/batch_sampler.py`（分桶采样器报告长度）

- **代码位置** `train_plm.py`，`main()`，第 7 部分的 `num_training_steps` 计算。

```python
num_training_steps = (
    math.ceil(len(dataloaders["train"]) / accumulate_grad_batches)
    * cfg.trainer.epochs
)
```

- **读法** len(DataLoader) 是它报告的一轮批次数，ceil 向上取整。比如一轮 5 批、每 2 批更新，计划 3 次更新；跑 3 轮就是 9 次。这里主要供学习率计划使用，长度分桶时报告批数与实际产出可能有差别。
> **补充解释** `batch` 是一次处理的数据量，`step` 在这里指一次计划中的参数更新，`epoch` 是过一遍训练集。分桶时批次数是 DataLoader 报告的估计。

### 7.4 建立学习率变化计划

- **输入** 优化器、计划更新数和 `cfg.lr_scheduler`。
- **动作** 工厂把配置里的热身比例换成计划步数，创建调度器。基础实验前约 10% 更新步热身，之后线性降低学习率。
- **产物** `lr_scheduler`，在训练循环的更新时机推进学习率。
- **源码** `explainable_medical_coding/config/factories.py`（学习率调度工厂） · `explainable_medical_coding/config/lr_scheduler/warmup_linear_decay.yaml`（线性热身配置）

- **代码位置** `train_plm.py`，`main()`，第 7 部分的 `factories.get_lr_scheduler(...)`。

```python
lr_scheduler = factories.get_lr_scheduler(
    config=cfg.lr_scheduler, optimizer=optimizer,
    num_training_steps=num_training_steps,
)
```

- **读法** 基础实验用线性热身和衰减：前一小段逐渐提高学习率，后面再降低。调度器决定每次更新用多大的学习率；优化器使用当时的学习率修改参数。创建调度器也没有在这里更新模型。
> **补充解释** 优化器根据梯度改参数，调度器控制之后的更新用多大的学习率。

### 7.5 准备日志、保存与早停回调

- **输入** `cfg.callbacks` 中的回调名称及其配置。
- **动作** 按名称创建日志、保存最佳模型和早停对象，交给 Trainer 在相应事件触发时调用。
- **产物** 回调列表。基础实验的保存和早停配置都监控验证集 mAP。
- **源码** `explainable_medical_coding/config/factories.py`（创建回调） · `explainable_medical_coding/config/callbacks/mean_average_precision.yaml`（基础实验回调）

- **代码位置** `train_plm.py`，`main()`，第 7 部分的 `factories.get_callbacks(...)`。

```python
callbacks = factories.get_callbacks(config=cfg.callbacks)
```

- **读法** 回调是预先登记的动作，例如每轮结束检查验证指标、进步时保存模型、长期没进步时停止。去 explainable_medical_coding/trainer/callbacks.py 看具体实现。debug 控制日志相关行为，不能当成少跑数据的开关。
> **补充解释** `debug=true` 在这个项目里控制 W&B 相关行为。训练跑多少数据、多少轮，要另看 DataLoader 和 Trainer 的配置。

## 08 训练、验证、保存与测试

**起点** 可运行模型、批次、损失、梯度更新规则、指标与回调。

**交接** 训练产物、最终验证和测试结果。需要解释时可以复用保存的模型。

**流程**

1. `trainer.fit()` 开始。先取一批病历，拿到正文的 `input_ids` 和 ICD 答案 `targets`。病历甲的正文用 `[41, 98]` 示意，答案是 `[1, 0, 1]`。
2. **编号查向量。** 假设向量表第 41 行是 `[0.12, -0.30]`，第 98 行是 `[-0.24, 0.41]`。输入 `[41, 98]` 就按顺序拿出这两行，得到 `[[0.12, -0.30], [-0.24, 0.41]]`。这里每个 token 用两个数字示意，真实向量有更多数字。
3. **看上下文。** RoBERTa 读同一块里的 token，再加工每一行向量。例如 `fever` 和 `no fever` 即使查到同一个 `fever` 编号，编码后的向量也会受周围文字影响。
4. **给 ICD 打分。** 分类头用这些向量算出病历甲的三个分数，例如 `[2.0, -3.0, 1.0]`。三列依次是 `250.00`、`272.4`、`39.61`。
5. **和答案对列。** 分数 `[2.0, -3.0, 1.0]` 对上 `[1, 0, 1]`，损失函数算出一个 `loss`。第 1 列答案是 0，这一类就应该给低分。
6. **先算怎么改，再真的改。** `backward()` 算出梯度。打个只有一个参数的例子，`w=0`、梯度 `-1`、学习率 `0.1`，用 SGD 手算是 `0 - 0.1 × (-1) = 0.1`。仓库用 AdamW，真正修改参数的是优化器那一步。
7. **跑完这轮再看验证。** 一轮结束后用 `validation` 看表现，根据配置保存最佳模型。训练结束加载最佳权重，再评估 `test`。

### 8.1 组装 Trainer，调用 `fit()`

- **输入** 配置、模型、DataLoader、损失函数、优化器、调度器、回调和 Lookups。
- **动作** 根据 `cfg.trainer.name` 找到训练器类，构造后设置设备，调用 `trainer.fit()`。训练开始时保存配置和 ICD 编号表。
- **产物** 训练循环开始，训练器进入第一轮的 `train_one_epoch()`。
- **源码** `train_plm.py`（构造并运行 Trainer） · `explainable_medical_coding/trainer/trainer.py`（fit）

- **代码位置** `train_plm.py`，`main()`，末尾的训练入口。

```python
# train_plm.py：组件组装完成后的训练入口
trainer.fit()

```

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.fit()`，每轮训练与验证的节选。

```python
# Trainer.fit() 中，每轮的主线节选
self.train_one_epoch(self.epoch)
if self.validate_on_training_data:
    self.train_val(self.epoch, "train_val")
self.val(self.epoch, "validation")
```

- **读法** fit() 安排整个实验：保存配置，逐轮训练和验证，触发回调，结束后最终评估。在主脚本创建模型、优化器都属于准备；走进训练循环并执行更新步骤，参数才开始改变。
> **补充解释** 从主脚本跟源码时，`trainer.fit()` 是从准备组件进入正式训练的位置。真正更新某一次参数发生在后面的优化器 step。

### 8.2 取一批病历，把输入和答案备齐

- **输入** `dataloaders['train']` 中的下一批记录。
- **动作** DataLoader 调用 6.3、6.4 的组批逻辑，`batch.to(self.device)` 将需要的张量移动到模型所用设备。
- **产物** `input_ids` 和 `attention_masks` 形状 `[B, T]`，真实标签 `targets` 形状 `[B, C]`。
- **源码** `explainable_medical_coding/trainer/trainer.py`（训练循环取 batch）

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.train_one_epoch()`，批次迁移与损失函数调用。

```python
# Trainer.train_one_epoch() 中，省略进度条和其他部分
batch = batch.to(self.device)
y_probs, targets, loss = self.loss_function(
    batch, model=self.model,
    scale=self.gradient_scaler.get_scale(), epoch=epoch,
)
```

- **读法** batch.input_ids 是正文编号，batch.attention_masks 标记有效位置，batch.targets 是 ICD 的 01 答案。这里调用损失函数，由它在内部调用模型。假设一批 2 条病历、最长 3 token、共 3 类，那么输入是 [2,3]，答案也是 [2,3]，但两张表每一列的含义完全不同。
> **补充解释** 断点可以放在 `batch.to(self.device)` 后，先看 `input_ids[0]`、`attention_masks[0]` 和 `targets[0]`，确认看的是同一份病历。

### 8.3 模型前向：编号查向量并编码文本

- **输入** `model(input_ids, attention_masks)`，基础版走常规编码路径。
- **动作** 将长序列切成 128-token 块。RoBERTa 的 embedding 层按整数 ID 查浮点向量，编码器融合块内上下文，再把各块的向量拼回同一份病历。
- **产物** token 表示 `[B, T′, H]`，其中 `T′` 是切块补齐后的长度，`H` 是隐藏维数。
- **源码** `explainable_medical_coding/models/models.py`（前向入口） · `explainable_medical_coding/models/models.py`（切块编码）

- **代码位置** `explainable_medical_coding/models/models.py`，`PLMICD.encoder()`，切块、编码与形状还原的节选。

```python
# PLMICD.encoder()：节选，省略切块掩码处理
input_ids = self.split_input_into_chunks(input_ids, self.pad_token_id)
if attention_masks is not None:
    attention_masks = self.get_chunked_attention_masks(attention_masks)
batch_size, num_chunks, chunk_size = input_ids.size()
outputs = self.roberta_encoder(
    input_ids=input_ids.view(-1, chunk_size),
    attention_mask=attention_masks.view(-1, chunk_size)
        if attention_masks is not None else None,
    return_dict=False,
)
return outputs[0].view(batch_size, num_chunks * chunk_size, -1)
```

- **读法** 先把每份病历切成块，再用 view 暂时把所有块排成一批交给 RoBERTa，最后按原病历拼回。RoBERTa 内部先查 token 向量表，再叠加位置等信息并用 Transformer 加工。假设两份病历各补到 3 块，每块 128 token，向量有 H 个数，流程就是 [2,3,128]→[6,128]→[6,128,H]→[2,384,H]。源码补齐公式在长度正好整除时还会多补一整块，读 shape 时要留意。
> **补充解释** `input_ids` 类似 `[124, 38, 912]` 这串整数。查 embedding 后，每个整数位置才对应一组浮点数。随后同一个 token 会根据块内上下文获得不同的表示。

### 8.4 模型前向：给各个 ICD 代码打分

- **输入** 拼回的 token 向量、有效位置掩码、每个 ICD 的可训练表示。
- **动作** `LabelCrossAttention` 计算每个 ICD 对各 token 的相关分数，除以 `scale` 后做 softmax，对 token 向量加权汇总并输出该 ICD 的分数。
- **产物** `logits` 形状 `[B, C]`。示例病历的输出可以是 `[2.0, -3.0, 1.0]`。
- **源码** `explainable_medical_coding/models/modules/attention.py`（标签注意力）

- **代码位置** `explainable_medical_coding/models/modules/attention.py`，`LabelCrossAttention.forward()`，省略掩码和归一化处理的节选。

```python
# LabelCrossAttention.forward()：省略 padding 掩码与归一化部分
V = self.weights_v(x)
K = self.weights_k(x)
Q = self.label_representations
att_weights = Q.matmul(K.transpose(1, 2))
attention = torch.softmax(att_weights / self.scale, dim=2)
y = attention @ V
# 后面将每个 ICD 汇总出来的 y 转成一个分数
```

- **读法** 每个 ICD 有一组可训练的查询参数 Q，用它与各 token 的 K 比较，决定该类别更侧重哪些位置。softmax 在同一类别对应的 token 位置上分配总和为 1 的权重，@ 按权重汇总 V。比如 A 更侧重前半段、C 更侧重后半段，最后分别输出一个分数；这些关注方式也是训练学出来的。
> **补充解释** 分类头里的 softmax 在 token 位置上分配权重。正数 `scale` 越小，权重越集中到高分 token 上。最终 logits 的 sigmoid 逐个 ICD 算概率，三项示例约为 `[0.88, 0.05, 0.73]`，多个 ICD 可以同时有高概率。

### 8.5 让模型输出和答案汇合，计算损失

- **输入** 模型的 `logits` 例如 `[2.0, -3.0, 1.0]`，`targets` 例如 `[1, 0, 1]`。
- **动作** `binary_cross_entropy_with_logits(logits, targets)` 按同一列对照分数和答案，汇总成一个标量。
- **产物** 用于反向传播的 `loss`，以及供评估使用的概率和真实标签。
- **源码** `explainable_medical_coding/utils/loss_functions.py`（BCE 的输入与返回值）

- **代码位置** `explainable_medical_coding/utils/loss_functions.py`，`binary_cross_entropy_loss()`。

```python
# binary_cross_entropy_loss() 中
logits = model(input_ids, attention_masks)
loss = torch.nn.functional.binary_cross_entropy_with_logits(logits, targets)
return torch.sigmoid(logits), targets, loss
```

- **读法** logits 是原始分数，可以小于 0 或大于 1；sigmoid 把各列分别变成 0 到 1 的预测概率。示例 [2,-3,1]→约 [0.88,0.05,0.73]，对照答案 [1,0,1]。BCEWithLogits 直接接收原始分数，内部处理所需计算；不要先 sigmoid 再把概率传给这个 API。标签是 1 希望对应分数升高，是 0 希望降低。
> **补充解释** 分数和标签的索引 2 都指 C。标签是 1，就鼓励这一列的分数升高；标签是 0，就鼓励该分数降低。这个 BCE API 接收原始 logits。

### 8.6 反向传播，得到参数梯度

- **输入** 这一批的 `loss` 和本次配置的梯度累积间隔。
- **动作** 先按累积间隔缩放损失，再调用 `.backward()`，沿计算图求损失对各训练参数的导数。
- **产物** 参数的 `.grad`，可能含前几个小 batch 累积的梯度。
- **源码** `explainable_medical_coding/trainer/trainer.py`（计算梯度）

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.train_one_epoch()`，损失缩放与反向传播。

```python
loss = loss / self.accumulate_grad_batches
self.gradient_scaler.scale(loss).backward()
```

- **读法** 反向传播沿刚才的计算过程，算出损失对每个可训练参数的梯度，放进 .grad。它回答的是参数调大一点会让损失往哪边变。这里还没有修改参数值。gradient_scaler 是仓库为混合精度准备的工具；先把核心过程理解成 loss.backward() 即可。
> **补充解释** 梯度回答「把这个参数调大一点，损失往哪个方向变」。例如 `w=0`、梯度 `-1`、SGD 学习率 `0.1`，实际更新时得到 `w=0.1`。训练使用的参数梯度在这里形成。`CODE_WALKTHROUGH.md`（可运行小例子）

### 8.7 到更新时机才改参数

- **输入** 已累积的梯度、优化器、调度器，以及当前 batch 序号。
- **动作** 累积满或到 DataLoader 报告的轮末时，按配置裁剪梯度，调用 `gradient_scaler.step(optimizer)`，按调度器规则推进学习率，最后 `zero_grad()`。
- **产物** 更新后的模型参数和下一次更新使用的梯度状态。
- **源码** `explainable_medical_coding/trainer/trainer.py`（参数更新）

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.train_one_epoch()`，满足更新条件时执行的语句节选。

```python
# 达到累积次数，或到代码判断的轮末时，执行更新
self.gradient_scaler.step(self.optimizer)
self.gradient_scaler.update()
# 若配置了调度器，按相应分支调用 self.lr_scheduler.step()
self.optimizer.zero_grad()
```

- **读法** step(optimizer) 交给优化器执行参数更新；scaler 必要时会因非有限梯度跳过更新。调度器调整后续学习率，zero_grad() 清掉已用过的梯度，准备下一次累积。先算梯度、再改参数、再清梯度，这是训练时需要抓住的顺序。
> **补充解释** 想亲眼验证哪一行改了参数，可以在 `backward()` 后观察同一个参数的 `.grad`，再在 `step()` 后观察该参数的值。

### 8.8 每轮结束评估并检查保存、早停

- **输入** 当前轮训练后的模型、可选的 `train_val` 和独立的 `validation`。
- **动作** 计算各份数据的评估指标。按配置在 `validation` 上调阈值，基础实验的回调根据验证 mAP 判断保存最佳权重和早停。
- **产物** 当前轮的指标、可能更新的 `best_model.pt`，以及继续训练或停止的状态。
- **源码** `explainable_medical_coding/trainer/trainer.py`（每轮评估顺序） · `explainable_medical_coding/trainer/trainer.py`（阈值选择） · `explainable_medical_coding/trainer/callbacks.py`（保存最佳模型）

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.val()` 的装饰器、函数定义与模式设置；其余用注释概括。

```python
# Trainer.val() 使用以下两类设置
@torch.no_grad()
def val(self, epoch, split_name="validation", evaluating_best_model=False):
    self.model.eval()
    # 后面遍历该 split，算预测、损失和指标
```

- **读法** 验证仍然会运行模型并计算损失，但没有用于训练的 backward 和 optimizer.step。eval() 控制 dropout 等行为，no_grad() 让这段计算不记录梯度。看验证集能判断模型对没拿来更新参数的病历是否也有效。基础实验用验证 mAP 保存最佳模型，阈值另用于把概率转成选中或不选中。
> **补充解释** 阈值把某个 ICD 的概率变成「选中或未选中」。比如示例概率按 0.5 阈值会选 A 和 C。训练损失用 logits，分类指标用概率及阈值。

### 8.9 训练结束，复用最佳权重完成测试

- **输入** 已完成的训练轮次与最佳 checkpoint。
- **动作** 基础实验的回调恢复最佳 checkpoint。之后对 `validation` 和 `test` 做最终评估。
- **产物** 最终验证与测试结果，以及可供后续加载的 `config.yaml`、`target_tokenizer.json`、`best_model.pt`。
- **源码** `explainable_medical_coding/trainer/trainer.py`（最终评估） · `explainable_medical_coding/trainer/trainer.py`（写入训练产物）

- **代码位置** `explainable_medical_coding/trainer/trainer.py`，`Trainer.save_checkpoint()`。

```python
# Trainer.save_checkpoint() 保存内容的节选
checkpoint = {
    "model": self.model.state_dict(),
    "optimizer": self.optimizer.state_dict(),
    "scaler": self.gradient_scaler.state_dict(),
    "epoch": self.epoch,
    "db": self.best_db,
    "num_classes": self.lookups.data_info["num_classes"],
}
torch.save(checkpoint, self.experiment_path / file_name)
```

- **读法** state_dict() 是参数和状态的字典。这个存档里确实还保存了优化器等状态，但 main() 的 load_model 分支只用 load_trained_model() 恢复模型和阈值，并没有自动恢复全部训练进度。训练结束的回调会先加载最佳 checkpoint，再最终评估 validation、test。
> **补充解释** 最佳权重对应验证指标表现最好的轮次。以旧权重开始新训练时，`load_model` 读取的就是保存好的 checkpoint。
