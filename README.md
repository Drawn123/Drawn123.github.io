# Drawn123 的博客

使用 Hugo Extended **0.165.0** 与 Hugo Stack **v4.0.3**，通过 GitHub Actions 部署到 GitHub Pages。

## 内容放在哪里

| 目录 | 内容 |
| --- | --- |
| `content/algorithm/solutions/` | 算法题解，按主要知识点归档 |
| `content/algorithm/learning-notes/` | 算法原理笔记 |
| `content/algorithm/template/` | 竞赛模板与速查 |
| `content/notes/<科目或主题>/` | Linux、数据结构等课程与工具笔记 |
| `content/machine-learning/` | 机器学习基础、深度学习、NLP |
| `content/projects/<项目>/` | 项目介绍、设计与复盘 |
| `content/research/` | 论文阅读、复现与实验 |
| `content/post/` | 随笔与通用问答 |
| `content/topics/` | 跨模块学习路线，只引用已有文章 |

每个可浏览的目录放 `_index.md`；每篇文章使用 `<文章名>/index.md`，图片就近保存在同一个目录。新方向已有目录时直接添加文章；首页自动显示有文章的模块。

## 本地预览与检查

安装上述版本的 Hugo Extended 和 Go，然后运行：

```powershell
hugo server
```

在浏览器中打开终端显示的本机地址。构建与检查：

```powershell
hugo --destination work/check --cleanDestinationDir --panicOnWarning
python scripts/check_site.py --site work/check
```

`work/`、`public/`、`resources/` 都是忽略的生成目录。检查会验证站内链接、锚点、文章标识，以及 `docs/url-baseline.json` 记录的旧路径。

## 新文章

一个最小示例：

```yaml
---
title: "梯度下降"
date: 2026-10-16T20:00:00+08:00
knowledge_id: "ml-gradient-descent"
url: "/p/ml-gradient-descent/"
tags:
  - "梯度下降"
draft: true
---
```

- 分类由所属模块自动继承，不需要填写 `categories`。标签表达具体知识点，系列负责章节顺序。
- `knowledge_id` 全站唯一，只用小写字母、数字和连字符，确定后不随文章改名。
- `url` 是公开地址，发布后保持稳定。已有文章保留本次重构前的路径。
- `date` 是首次发布日期；有实质修订时手动更新 `lastmod`，不要用文件移动时间替代。
- 标题、文件位置、网址是不同的概念；更换分类目录不应顺便修改已发布网址。
- 草稿确认后再设为 `draft: false`。没有真实内容时只建栏目，不编造文章。

完整规范见 [维护说明](docs/maintenance.md)。

## 常改的位置

- 模块入口：`data/modules.toml`；新增顶层文章栏目时同时更新 `config/_default/params.toml` 的 `mainSections`。
- 首页常用入口：`data/featured.toml`。
- 系列介绍：各科目 `_index.md`；文章顺序使用 `series_id` 与 `series_order`。
- 样式：`assets/scss/custom.scss` 只负责按顺序引入 `drawn/` 下的分层文件。
- 内容筛选与标签交互：`assets/js/drawn-discovery.js`；阅读辅助：`assets/js/drawn-site.js`；星空、鲸鱼与光标动效：`assets/js/drawn-atmosphere.js`。

## 发布与主题升级

提交并推送到 `master` 或 `main` 会触发部署。构建版本已固定，站内检查失败会阻止上传部署产物。

构建依赖 Hugo Extended 与 Go，样式和脚本由 Hugo 内置工具处理，无需安装 Node 或额外的 Dart Sass。`work/` 中的旧测试构建与截图可以删除；本机仍在使用的主题依赖缓存不属于博客源码，不提交到 Git。

主题检查工作流改为手动运行，只报告可用版本，不再每日自动修改依赖。升级时单独更新 `go.mod` / `go.sum`，构建并检查桌面、手机、公式与代码展示后再发布。
