---
title: "Less is More：ICD 编码推理、代码调用链与训练复现"
description: "整理 Less is More 的环境、模型下载、NER 与 AC 调用、ICD 推理、训练输入构建和评估口径。"
date: 2026-10-28
lastmod: 2026-10-28
knowledge_id: "research-experiment-less-is-more"
url: "/p/research-experiment-less-is-more/"
tags:
  - "ICD 编码"
  - "多标签分类"
  - "命名实体识别"
math: true
related_ids:
  - "research-paper-less-is-more"
  - "research-experiment-metrics-laat"
draft: true
---

## 一、运行目标与复现范围

Less is More 要把一份出院小结转换成诊断和操作编码，并返回各编码的预测分数及支持证据。完整推理先识别医学实体、判断实体状态，再把保留的信息整理成短文本，交给编码模型预测。

从文件看，输入是带病历编号和正文的表格，中间得到实体表，最后得到编码与证据表。后续命令分别负责准备模型、执行这条处理链，以及检查或重新训练模型。方法的设计理由见[论文精读篇的方法概览](knowledge:research-paper-less-is-more#method-overview)。

Less is More 的仓库可以跑样例推理、重算发布模型的指标，也可以从 MIMIC-IV 重建输入并训练模型。这三件事需要的数据、时间和验证范围不同。

### 1.1 运行目标与所需材料

| 目标 | 所需材料 | 能检查什么 |
| --- | --- | --- |
| 阅读仓库参考输出 | 自带的三份合成病历和 `sample_results` | 输入、实体、编码与证据的数据格式 |
| 重新执行样例推理 | NER、AC、实体编码模型及配套 tokenizer、基础编码器 | 当前环境下整条推理流程能否完成 |
| 重算论文表 7 | 发布的预测 feather 文件 | 同一份预测在既定口径下得到的指标 |
| 重新训练编码模型 | 授权的 MIMIC-IV、MIMIC-IV-Note、预训练模型和 NER/AC 权重 | 从数据处理到模型训练能否复现 |
| 重新训练 NER/AC | 对应实体标注及 AC 多源语料 | 前置模型的训练与评估 |

以下样例取自仓库已提交的参考输出。本地核对时，`data/models/` 和 `external/plm_ca/models/` 尚未下载，因此没有新增推理或训练结果。论文的设计与结果分析见[Less is More 精读](knowledge:research-paper-less-is-more)。

### 1.2 固定版本与结果来源

命令和源码对应版本 `fdf610ca1bee62be7b75d499c1d34eecfc4dada2`。仓库建议严格对照论文时使用 `v1.0.0`。切换版本后需要核对参数、输出格式和默认设置；版本信息应与实验记录一起保存。

## 二、目录和数据接口

```text
entity-coding/
├── run_pipeline.py                 整条推理流程入口
├── data_download.py                下载模型
├── environment.yml                Conda 依赖
├── config/download_config.yaml     下载地址与目标路径
├── ner/
│   ├── extract_entities.py         清洗、NER、AC 与过滤
│   ├── document_cleaning.py        清洗和分句工具
│   ├── create_train_input.py       构建实体版训练表格
│   └── ner_model_training.ipynb    NER 训练
├── ac/                            AC 数据准备与训练
├── external/plm_ca/
│   ├── train_plm_entities.py       实体输入训练
│   ├── train_plm_fulltext.py       全文输入训练
│   ├── infer_with_explanations.py  实体编码与归因
│   ├── eval_metrics.py             重算编码指标
│   └── explainable_medical_coding/ 模型、数据加载、训练器
├── code_evidence/                 证据评估与 HTML 展示
├── data/sample_data/              合成病历
├── results/sample_results/        已提交的参考输出
└── docs/                          训练、推理、复现说明
```

`ac/` 负责断言分类（AC）的训练，推理调用位于 `ner/extract_entities.py`。编码模型位于 `external/plm_ca/`，由总入口启动。沿着处理顺序看，三个主要接口分别是病历表、实体表、编码与证据表。

### 2.1 输入病历

总入口接受 CSV 或 Parquet，至少包含：

| 字段 | 含义 |
| --- | --- |
| `note_id` | 病历编号，用于分组、结果关联与断点跳过 |
| `text` | 病历正文 |

三份合成病历位于 `data/sample_data/sample_notes.csv`。完整重训需要[授权的 MIMIC-IV-Note 2.2](https://physionet.org/content/mimic-iv-note/2.2/)和[MIMIC-IV 2.2](https://physionet.org/content/mimiciv/2.2/)，仅有仓库中的合成病历不能重现测试集性能。

### 2.2 实体输出

`results/sample_results/sample_notes_entities.csv` 的表头为：

```text
note_id,start_index,end_index,text
```

其中一段参考内容是：

```csv
synthetic-2,0,15,chief_complaint
synthetic-2,17,22,<abnormal_finding> Fever
synthetic-2,27,46,<abnormal_finding> shortness of breath
```

`start_index`、`end_index` 对应清洗后正文的位置，通常按左闭右开范围使用。`text` 是送给编码模型的重写文本，可能带有类型 token、状态前缀；因此不能用它的字符串长度直接推算正文范围。

输出中既有实体，也有章节行。当前参考 CSV 共 94 行，覆盖 3 份病历；94 不能直接称为 NER 识别出的实体数量。

### 2.3 编码和证据输出

`sample_notes_results.csv` 包含：

| 字段 | 含义 |
| --- | --- |
| `note_id` | 病历编号 |
| `predicted_code` | 预测编码 |
| `predicted_code_probability` | sigmoid 后的预测分数 |
| `evidence_line_numbers` | 拼接后的实体文本中，对应证据行号 |
| `evidence_spans` | 清洗后病历中的证据位置 |
| `evidence_texts` | 证据文本 |
| `evidence_attributions` | 各证据行聚合的贡献分数 |

当前参考结果共有 8 行编码预测，覆盖 3 份病历。例如 `synthetic-1` 的 `I10` 分数约为 0.9783。样例没有提供相应的人工金标准，这个分数只能说明模型赋予了较高概率；判断正确性需要参考标注，判断概率是否可靠还需要校准评估。

## 三、安装环境和下载模型

以下命令使用 PowerShell。除明确切换目录的步骤外，从仓库根目录执行；多行命令使用参数数组或单行写法，不使用 Bash 的反斜杠续行。

### 3.1 创建环境并检查计算设备

```powershell
conda env create -f environment.yml --solver libmamba
conda activate entitycoding
python -c "import torch, transformers; print(torch.__version__); print(transformers.__version__); print(torch.cuda.is_available())"
```

`environment.yml` 指定 Python 3.11.5、PyTorch 2.1.1、Transformers 4.38.1 和 CUDA 12.1 相关依赖。最后一条命令检查实际导入的版本与 CUDA 可用性；环境成功创建，不等于 GPU 已经可用。

### 3.2 下载推理权重与配套 tokenizer

下载样例推理需要的模型：

```powershell
python data_download.py --models ner,ac,entity-only --cleanup
```

| 选择项 | 存放位置 | 用途 |
| --- | --- | --- |
| `ner` | `data/models/ner_model/` | 识别实体 |
| `ac` | `data/models/ac_model/` | 判断实体状态 |
| `entity-only` | `external/plm_ca/models/entityonly/` 与 `tokenizer_latest/` | 编码预测和实体类型 token |
| `fulltext` | `external/plm_ca/models/fulltext/` | 全文基线及其发布预测 |
| `roberta` | `data/models/RoBERTa-base-PM-M3-Voc-distill-align-hf/` | NER/AC 重新训练的初始化 |

### 3.3 单独准备编码器的 base 权重

编码模型还需要 **base RoBERTa-PM**，目标目录为 `external/plm_ca/models/roberta-base-pm-m3-voc-hf/`。在支持 GNU Make、wget 和 tar 的 Shell 中，可执行仓库目标：

```bash
cd external/plm_ca
make download_roberta
```

在 PowerShell 中也可以单独下载并解包。以下从仓库根目录开始，保留压缩包和解包目录，便于检查：

```powershell
$robertaArchive = "external/plm_ca/models/RoBERTa-base-PM-M3-Voc-hf.tar.gz"
New-Item -ItemType Directory -Path "external/plm_ca/models" -Force | Out-Null
Invoke-WebRequest -Uri "https://dl.fbaipublicfiles.com/biolm/RoBERTa-base-PM-M3-Voc-hf.tar.gz" -OutFile $robertaArchive
tar -xzf $robertaArchive -C "external/plm_ca/models"
Move-Item -LiteralPath "external/plm_ca/models/RoBERTa-base-PM-M3-Voc/RoBERTa-base-PM-M3-Voc-hf" -Destination "external/plm_ca/models/roberta-base-pm-m3-voc-hf"
```

最后一行沿用仓库 Makefile 的压缩包目录结构，适用于目标目录尚不存在的首次安装。若文件已存在，先检查路径和内容，不直接覆盖已有模型。

`--models roberta` 下载的是 **distill-align** 变体，不能替代上面的 **base** 变体。实体编码模型的 tokenizer 也必须与权重配套，其中新增了五个实体类型 token。

## 四、合成病历推理与结果检查

### 4.1 执行总入口

先用一个工作进程，减少同一块 GPU 上的模型副本：

```powershell
$sampleArgs = @(
    "data/sample_data/sample_notes.csv",
    "--max_workers", "1",
    "--visualize-entities",
    "--visualize-evidence"
)
python run_pipeline.py @sampleArgs
```

| 参数 | 作用 |
| --- | --- |
| `--max_workers 1` | 限制实体提取工作进程数 |
| `--visualize-entities` | 输出实体类型和断言状态页面 |
| `--visualize-evidence` | 输出编码及证据页面，并提前保存清洗正文 |
| `--force` | 忽略已有实体输出中的已处理编号，重新提取 |
| `--log-level DEBUG` | 增加调试日志 |

默认生成：

```text
results/
├── ner/
│   ├── sample_notes_entities.csv
│   └── docs_with_ner/NER_synthetic-1.html
├── coded/
│   ├── sample_notes_results.csv
│   └── sample_notes_results.parquet
├── formatted_texts/formatted_synthetic-1.txt
└── visualised_notes/synthetic-1.html
```

这里只列一份病历对应的 HTML 和正文文件，其余样例同理。可以用 `Invoke-Item "results/visualised_notes/synthetic-1.html"` 打开证据页面。

如果先前运行没有保存正文，后来才增加可视化开关，建议同时加 `--force`。否则已处理病历会被跳过，所需正文可能没有重新生成。

直接输入一段文字也可以：

```powershell
python run_pipeline.py --text "Patient presents with chest pain." --max_workers 1 --visualize-evidence
```

文字会写入固定的 `results/ner/freeform.csv`，编号为 `freeform`，并强制重新提取。这种方式适合检查数据流，单句输出不代表模型在完整出院小结上的表现。

### 4.2 分阶段输出核对

先查看实体 CSV，确认病历编号、章节行和实体文本；再查看编码 CSV，检查预测分数与证据列；最后在 HTML 中选中一个编码，看高亮位置是否与清洗后正文一致。

输出可能来自旧运行，改变输入或参数后应使用独立前缀，并核对生成时间。例如从根目录执行下面的命令，将这次结果与默认样例结果分开：

```powershell
python run_pipeline.py data/sample_data/sample_notes.csv results/first-check --max_workers 1 --force
```

对应实体表为 `results/first-check_entities.csv`，编码结果前缀为 `results/first-check_icd_results`。可视化正文与 HTML 仍使用固定目录；需要归档时应把这些文件与本次结果一起保存。

总入口检查的是子进程退出状态和预期文件是否存在，结果质量仍要结合字段与正文核对。

## 五、主流程调度与模型调用

### 5.1 子进程命令的构造与执行

`run_entity_extraction()` 先构造一个列表。下面按实际参数顺序简化路径变量，省略日志和输出检查：

```python
cmd = [
    sys.executable,
    str(REPO_ROOT / "ner" / "extract_entities.py"),
    str(input_file),
    "--output_file", str(entities_file),
    "--max_workers", str(max_workers),
    "--log-level", log_level,
]
```

`cmd` 是 command，命令；`sys.executable` 是当前 Python 解释器的路径。创建列表时还没有执行模型，它只是准备好“用哪个 Python、执行哪个文件、传入哪些参数”。

随后 `run_step()` 执行：

```python
subprocess.run(cmd, cwd=cwd, check=True)
```

`subprocess` 表示子进程，`cwd` 是子进程的工作目录。它启动新的 Python 进程执行实体脚本，并等待结束；子进程以非零状态退出时，`check=True` 会触发异常。

调用链为：

```text
run_pipeline.py → main()
  → run_entity_extraction()
  → run_step()
  → subprocess.run(...)
      → extract_entities.py → main()
      → process_documents_from_csv_parallel()
      → 工作进程中的 process_single_document()
```

`process_documents_from_csv_parallel()` 又通过 `ProcessPoolExecutor` 分配病历。每个工作进程首次使用时加载自己的 NER 和 AC，后续处理复用已加载对象。工作进程增加，显存占用也可能增加。

总入口会等实体脚本结束，成功后才启动编码脚本。实体提取或编码预测失败会中止流程；最终证据页面生成失败时只记录警告，已经生成的主要结果仍可保留。

### 5.2 模型加载与前向计算

`extract_entities.py` 的 `get_models()` 加载 NER tokenizer、配置和权重，再加载 AC 分类模型。NER 的主要步骤是：

```python
model = RobertaForTokenClassification(config)
model.load_state_dict(torch.load(str(model_weights_path), map_location=device))
model.to(device)
model.eval()
```

分别是创建模型结构、读入权重、移动到计算设备、设置评估模式。`model.eval()` 本身不执行预测，也不自动关闭梯度。

真正的 NER 计算在 `infer_sentences()`：

```python
with torch.no_grad():
    outputs = model(**inputs)
predictions = outputs.logits.argmax(dim=-1).cpu().numpy()[0]
```

`inputs` 来自 tokenizer；`**inputs` 把字典展开成模型参数；`logits` 是未归一化分类分数；`argmax` 取每个 token 分数最高的类别。`no_grad()` 关闭这段计算的梯度记录。

AC 则封装进 `TextClassificationPipeline`，真正执行的位置是：

```python
classification = classifier(text)
```

为什么提取实体后还要判断断言，以及不同状态的过滤规则，见[精读篇的 AC 过滤规则](knowledge:research-paper-less-is-more#assertion-filtering)。

### 5.3 ICD 预测与证据聚合 {#coding-and-evidence}

总入口接着切换子进程工作目录到 `external/plm_ca/`，启动 `infer_with_explanations.py`。该脚本读取实体 CSV，按 `note_id` 分组、按 `start_index` 排序，逐行拼成实体文本，再执行编码模型。

```python
with torch.no_grad():
    logits = model(input_ids, attention_mask)
probs = torch.sigmoid(logits)
predicted_labels = (probs > decision_boundary).nonzero(as_tuple=False)
```

之后调用 `get_grad_attention_callable(model)` 返回的解释器，单独计算梯度归因。编码预测阶段关闭梯度，不妨碍后续解释阶段重新进行需要梯度的计算。

脚本按 tokenizer 的 offset mapping 将 token 归到实体行，将通过筛选的 token 贡献求和，再用实体 CSV 中的位置关联清洗后的正文。当前推理的最大输入长度为 6,000 token；NER 的 512 token 限制和编码器内部的分块是另外两层设置，不应混为一个参数。

源代码入口可按以下顺序继续读：

| 文件或函数 | 阅读目标 |
| --- | --- |
| `process_single_document()` | 清洗、NER、AC、章节与实体过滤 |
| `infer_with_explanations.py/main()` | 拼接输入、筛选编码、聚合证据 |
| `models/models.py/PLMICD` | RoBERTa 编码与长输入分块 |
| `models/modules/attention.py/LabelCrossAttention` | 编码专属注意力与输出分数 |
| `explanation_methods.py/get_grad_attention_callable()` | 注意力与 Input×Gradient 的组合 |

交叉注意力的维度与计算方向见[PLM-CA 的标签交叉注意力](knowledge:research-paper-less-is-more#label-cross-attention)，归因量的计算见[AttnInGrad 与实体级证据](knowledge:research-paper-less-is-more#entity-attribution)。

## 六、重算发布模型的指标

### 6.1 评估输入与指标计算

样例推理输出每行一个预测编码及其证据。`eval_metrics.py` 接受的 feather 则是每行一份病历，包含 `_id`、真实编码 `target`，以及各编码的预测概率列。不能把样例 CSV 改个扩展名就交给评估脚本。

下载两组发布模型及其预测文件，再从 PLM-CA 目录计算：

```powershell
python data_download.py --models entity-only,fulltext --cleanup
Push-Location external/plm_ca
python eval_metrics.py --model entityonly --split test
python eval_metrics.py --model fulltext --split test
Pop-Location
```

脚本读取 `models/<model>/predictions_test.feather`，输出 micro/macro-F1、P@8、P@15、EMR、MAP、micro/macro-AUC。打印的是 0—1 值，论文表格常写成百分制，比较前要统一尺度。

这一步重算的是发布模型的固定预测，验证范围止于指标计算。指标的定义、分母和 micro/macro 区别见[多标签指标笔记](knowledge:research-experiment-metrics-laat)。

### 6.2 编码决策阈值与证据评分阈值 {#coding-and-evidence-thresholds}

| 设置 | 实体模型 | 全文模型 | 控制对象 |
| --- | --- | --- | --- |
| 编码概率阈值 | 0.4040403962135315 | 0.4141414165496826 | 哪些 ICD 编码判为正 |
| MDACE 证据评分阈值 | 0.0021632653061224487 | 0.0013877551020408164 | 哪些归因证据进入评分 |

来源为仓库 `docs/reproduce.md`。概率阈值来自 MIMIC-IV 决策边界，沿用于 MDACE；证据评分阈值在 MDACE 验证集上按部分匹配 F2 选择。F2 比 F1 更重视召回。

实体推理脚本 `--attr-threshold` 的默认值是 `0.0001`，用于生成候选证据时筛选 token。表 8 的评分还要经过 notebook 中的聚合和匹配流程，使用验证集选出的评分阈值。

更换模型或训练设置后，需要在验证集重新选择阈值，并固定后再评价测试集。不同任务的阈值也不能只因数值接近就互换。

### 6.3 置换检验与逐编码分析

从 `external/plm_ca/` 执行：

```powershell
python permutation_testing.py --num-permutations 5
```

5 轮只用于检查流程。论文采用 1,000 轮，对应命令是：

```powershell
python permutation_testing.py --num-permutations 1000
```

仓库保留了 `results/paper_permutation_test_results.txt`。逐编码表现则可先看 `results/per_code_metrics_entityonly.csv` 和 `results/per_code_metrics_fulltext.csv`，按编码频率和错误类型查差异。重新生成逐编码表还需要相应的训练 parquet，用于统计训练频次。

上游稀有编码过滤作用于划分前的合并数据，`min_count=10` 不等于每个编码在训练集里至少出现 10 次。解释逐编码表中的 `train_frequency` 时，需要分清统计范围。

## 七、从 MIMIC-IV 重建训练输入

前面的样例推理和指标重算可以使用发布权重。重新训练则要先重建病历与编码标签的对应关系，再为同一组划分生成实体文本。全文和实体输入应分别留存，后续对照才能追溯到实际训练数据。

### 7.1 生成全文划分

按 `docs/inference.md` 放好授权数据，路径需要匹配 `external/plm_ca/data/raw/physionet.org/files/` 下的版本目录。MIMIC-IV 的编码表与 MIMIC-IV-Note 的病历文本都需要准备。

从仓库根目录执行：

```powershell
Push-Location external/plm_ca
python -m explainable_medical_coding.data.prepare_mimiciv data/raw data/processed
python -m explainable_medical_coding.data.make_mimiciv_icd10
Pop-Location
```

生成 `external/plm_ca/data/processed/mimiciv_icd10/{train,val,test}.parquet`。先保留三份全文备份，再构建实体输入：

```powershell
$datasetDir = "external/plm_ca/data/processed/mimiciv_icd10"
New-Item -ItemType Directory -Path "$datasetDir/fulltext" -Force | Out-Null
New-Item -ItemType Directory -Path "$datasetDir/entity-only" -Force | Out-Null
foreach ($split in @("train", "val", "test")) {
    if (Test-Path "$datasetDir/fulltext/$split.parquet") {
        throw "Full-text backup already exists: $split. Check it before continuing."
    }
    Copy-Item -LiteralPath "$datasetDir/$split.parquet" -Destination "$datasetDir/fulltext/$split.parquet"
}
```

这是首次准备时的备份步骤。已有备份就先检查，不能把后来换上的实体表误覆盖到全文备份里。

### 7.2 三个划分分别抽取实体

仍在根目录、沿用 7.1 的 `$datasetDir` 变量执行。先用单工作进程确认显存占用，再决定是否增加：

```powershell
foreach ($split in @("train", "val", "test")) {
    $extractArgs = @(
        "ner/extract_entities.py",
        "$datasetDir/fulltext/$split.parquet",
        "--output-file", "results/ner/mimiciv-$split.csv",
        "--max_workers", "1"
    )
    python @extractArgs
    if ($LASTEXITCODE -ne 0) { throw "Extraction failed: $split" }
}
```

默认会跳过输出 CSV 中已经存在的 `note_id`。如果更换模型、输入或过滤规则，需要重新生成对应输出，不能继续沿用旧结果。

### 7.3 实体文本替换与编码标签保留

```powershell
foreach ($split in @("train", "val", "test")) {
    $buildArgs = @(
        "ner/create_train_input.py",
        "--entities", "results/ner/mimiciv-$split.csv",
        "--mimic_file", "$datasetDir/fulltext/$split.parquet",
        "--output", "$datasetDir/entity-only/$split.parquet"
    )
    python @buildArgs
    if ($LASTEXITCODE -ne 0) { throw "Input preparation failed: $split" }
}
```

该步骤按病历聚合实体，用换行拼接后的内容替换 `text`，保留原表的编码标签等字段。论文方法仍依赖病历级编码监督；实体抽取并没有直接生成训练标签。

没有实体行的病历会被剔除，不会退回全文。仓库训练说明记录原数据中因此少了一条训练记录；自行重建时也应记录各划分的输入数、保留数和剔除原因。

### 7.4 切换实际训练读取的数据

数据加载器固定读取：

```text
data/processed/mimiciv_icd10/train.parquet
data/processed/mimiciv_icd10/val.parquet
data/processed/mimiciv_icd10/test.parquet
```

它不会因为启动的是 `train_plm_entities.py`，就自动选择 `entity-only/`。备份确认后，将实体表复制到顶层：

```powershell
foreach ($split in @("train", "val", "test")) {
    Copy-Item -LiteralPath "$datasetDir/entity-only/$split.parquet" -Destination "$datasetDir/$split.parquet"
}
```

切换输入后，还要处理 Hugging Face 数据集缓存，否则可能复用上一次的全文或实体版本。默认缓存目录中，把该数据集的缓存改名留存：

```powershell
$mimicCache = Join-Path $env:USERPROFILE ".cache/huggingface/datasets/mimiciv_icd10"
if (Test-Path -LiteralPath $mimicCache) {
    $cacheBackup = "${mimicCache}.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Move-Item -LiteralPath $mimicCache -Destination $cacheBackup
}
```

若配置了 `HF_DATASETS_CACHE` 或 `HF_HOME`，应先确认实际缓存路径，再处理对应的 `mimiciv_icd10` 目录。

## 八、启动训练并设置对照

### 8.1 备份发布 tokenizer

`train_plm_entities.py` 启动后会向词表加入五种实体类型 token，并保存到固定目录 `models/tokenizer_latest/`。这会覆盖推理时使用的发布 tokenizer。

从根目录在第一次重训前备份：

```powershell
$tokenizerPath = "external/plm_ca/models/tokenizer_latest"
$tokenizerBackup = "external/plm_ca/models/tokenizer_released"
if (Test-Path -LiteralPath $tokenizerPath) {
    if (Test-Path -LiteralPath $tokenizerBackup) {
        throw "Tokenizer backup already exists. Check it before training."
    }
    Copy-Item -LiteralPath $tokenizerPath -Destination $tokenizerBackup -Recurse
}
```

后续推理要使用与新模型对应的 tokenizer；恢复发布模型时再恢复发布 tokenizer，不能只看目录名相同就混用。

### 8.2 实体模型训练

```powershell
Push-Location external/plm_ca
python train_plm_entities.py experiment=mdace_icd9_code/plm_icd gpu=0 dataloader.max_batch_size=1 data=mimiciv_icd10 callbacks=no_wandb
Pop-Location
```

这些是 Hydra 的配置覆盖：

| 参数 | 含义 |
| --- | --- |
| `experiment=mdace_icd9_code/plm_icd` | 选择实验预设 |
| `data=mimiciv_icd10` | 把预设中的 ICD-9 数据组覆盖成 MIMIC-IV ICD-10 |
| `gpu=0` | 使用编号为 0 的 GPU |
| `dataloader.max_batch_size=1` | 单次放入显存的最大样本数 |
| `callbacks=no_wandb` | 关闭 wandb 回调，保留该预设中的必要训练回调 |

`data=mimiciv_icd10` 不能遗漏。实验预设名虽然带 ICD-9，数据选择仍由覆盖后的配置决定。

期望 batch size 为 16，最大单次 batch size 为 1 时，训练器通过梯度累积实现目标批量。配置中的最大轮数是上限，论文记录的实体 8 轮、全文 9 轮是收敛结果，不应直接作为新的固定训练轮数。

当前配置合并后，还需要核对以下值；它们是仓库配置，不是本地训练记录：

| 设置 | 值 |
| --- | --- |
| 随机种子 | 1337 |
| 优化器 | AdamW |
| 学习率 | `5e-5` |
| weight decay | 0 |
| 最大训练轮数 | 20 |
| 编码输入最大长度 | 6,000 token |
| RoBERTa 内部分块长度 | 128 token |
| `no_wandb` 的选模与早停依据 | 验证集 MAP，早停 patience 为 3 |

如需改变这些值，应保存实际覆盖后的配置。种子相同也不能直接保证跨设备结果逐位相同，当前 `deterministic` 默认关闭。

默认 checkpoint 输出到 `external/plm_ca/models/` 下的运行目录。需要自定义时，检查 `.env.example` 中的 `EXPERIMENT_PATH`。新模型与旧模型的结果目录应分开保存。

### 8.3 全文对照与消融

全文对照需要把 `fulltext/` 下的三份表复制回顶层，再处理对应数据集缓存，然后运行：

```powershell
Push-Location external/plm_ca
python train_plm_fulltext.py experiment=mdace_icd9_code/plm_icd gpu=0 dataloader.max_batch_size=1 data=mimiciv_icd10 callbacks=no_wandb
Pop-Location
```

两组应沿用相同的数据划分与标签集合，明确采用哪一份预训练权重，并保持选模口径一致。实体模型增加了类型 token 及对应嵌入，参数初始化并非每一项都相同，这部分差异也应记录。每次至少保留代码版本、最终配置、随机种子、输入记录数、设备、最佳 checkpoint、验证阈值和测试指标。

消融输入可以通过 `create_train_input.py` 的选项生成：

| 选项或改动 | 对应对照 |
| --- | --- |
| `--remove_tokens` | 去掉实体类型 token |
| `--replace_tokens` | 类型 token 改成普通文字 |
| `--shuffle` | 打乱实体及章节行顺序 |
| 预先按类别筛选实体行 | 实体类别子集 |
| 修改 `extract_entities.py` 的断言过滤逻辑 | 不做 AC 过滤 |

不做 AC 过滤需要修改抽取脚本，仓库没有对应的 `--no-ac` 参数。以上消融改变了训练输入，需要重新训练并按同一口径评估；只改变测试文本，检验的是输入分布扰动。消融结果的解释见[精读篇的组件对照](knowledge:research-paper-less-is-more#ablation-evidence)。

## 九、证据评估与常见问题

### 9.1 MDACE 的候选生成与评分

MDACE 复现需要额外准备授权的 MIMIC-III 文本和 MDACE 标注，按 `docs/evidence.md` 从仓库根目录启动 notebook。`code_evidence/code_evidence_eval.ipynb` 负责抽取出院小结、验证集阈值选择和证据匹配；实体与全文使用不同的候选生成、聚合流程。

全文流程还需要 `infer_with_explanations_fulltext.py` 生成宽松阈值下的候选，再由 `merge_contiguous_spans.py` 按验证阈值合并连续片段。三份合成病历只用于检查推理接口，表 8 则依赖这套人工证据评分流程。

评分前对证据文本作小写、标点和空白规范化，并采用位置无关匹配。论文在 MDACE 验证集选择归因阈值，合并未用于模型训练的 MDACE 训练、测试部分做最终分析；表 8 只统计真阳性编码的证据。复现时应保留这些条件，避免改变分母后仍直接对照原表。

匹配更完整说明证据范围与参考文本的关系，归因是否忠实还需要另外检验，相关区别见[精读篇的证据分析](knowledge:research-paper-less-is-more#evidence-evaluation)。

### 9.2 按现象定位问题

| 现象 | 优先检查 |
| --- | --- |
| 实体提取 CUDA 显存不足 | 降低 `--max_workers`，每个工作进程加载一套 NER/AC |
| 缺少 base RoBERTa | 检查 `roberta-base-pm-m3-voc-hf/`，不要用 distill-align 目录替代 |
| 缺少 `tokenizer_latest` | 检查 `entity-only` 下载和模型 tokenizer 配对 |
| 传入 Parquet 后编码推理报错 | 总入口可以读 Parquet，编码子脚本只读实体 CSV |
| 新增可视化后缺少正文 | 加 `--force` 重新提取并保存 formatted text |
| 输入已换，但训练结果像上一组 | 检查顶层 parquet 和 Hugging Face 缓存 |
| 运行时要求 wandb 登录 | 检查 `callbacks=no_wandb` 或自行配置日志服务 |
| 指标与论文相差约 100 倍 | 检查 0—1 与百分制的显示尺度 |

Windows 下还要区分 PowerShell 的 `wget` 别名与 GNU wget，以及 Bash 和 PowerShell 的续行语法。不要在子目录执行面向整个上游项目的 `make setup` 或 `make prepare_everything`，作者为本仓库提供的是统一 Conda 环境。

## 十、复现结果的解释边界

### 10.1 固定预测重算与重新训练的区别

固定预测文件已经包含模型输出，重算只经过评估代码。重新训练还涉及数据准备、实体抽取、输入替换、初始化、优化和验证集选模，这些环节都没有被重算覆盖。记录结果时，应分别说明完成的是样例推理、固定预测评估，还是从输入到新 checkpoint 的训练。

### 10.2 编码训练与全流程的计时范围

比较编码训练效率时，可固定设备和计时范围，报告每轮时间、收敛轮数与总训练时间。比较整条流程时，还要记录实体预处理和所需的归因计算。实体文本可以缓存复用，因此单次训练、重复调参和在线推理的成本口径不同，不能共用一个“加速比例”。

### 10.3 论文结果差异的排查顺序

先核对实际训练输入、数据划分和标签集合，再核对权重与 tokenizer、最佳 checkpoint、阈值和指标实现。尤其要确认顶层 parquet 与缓存指向同一组数据，结果是新生成的，显示尺度一致。协议对齐后，再通过多次运行检查随机波动；一次分数高低不足以判断方法改进或复现失败。

## 参考资料

- [论文正式版本](https://aclanthology.org/2025.acl-long.1489/)。
- [作者仓库 README](https://github.com/jd4501/entity-coding/blob/fdf610ca1bee62be7b75d499c1d34eecfc4dada2/README.md)。
- 同版本的 [inference.md](https://github.com/jd4501/entity-coding/blob/fdf610ca1bee62be7b75d499c1d34eecfc4dada2/docs/inference.md)、[training.md](https://github.com/jd4501/entity-coding/blob/fdf610ca1bee62be7b75d499c1d34eecfc4dada2/docs/training.md)、[reproduce.md](https://github.com/jd4501/entity-coding/blob/fdf610ca1bee62be7b75d499c1d34eecfc4dada2/docs/reproduce.md) 和 [evidence.md](https://github.com/jd4501/entity-coding/blob/fdf610ca1bee62be7b75d499c1d34eecfc4dada2/docs/evidence.md)。
- [Less is More 精读](knowledge:research-paper-less-is-more)与[分类模型评价指标](knowledge:research-experiment-metrics-laat)。
