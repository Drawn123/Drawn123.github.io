# Drawn123 的博客

我在这里放平时写的算法题解、竞赛模板和课程笔记，也记一些读论文和做项目时碰到的问题。[博客首页](https://drawn123.github.io/)

博客用 Hugo 搭建，主题是 Hugo Stack v4.0.3，部署在 GitHub Pages。

## 本地预览

安装 Hugo Extended 和 Go，再到仓库根目录运行 `hugo server`，打开终端给出的地址。要看草稿就加上 `-D`。

部署用的是 Hugo Extended 0.165.0 和 Go 1.25.5。下面的检查脚本需要 Python 3。

## 文章放哪

文章都在 [`content/`](content/) 里。

| 目录 | 内容 |
| --- | --- |
| `algorithm/solutions/` | 按知识点归档的题解 |
| `algorithm/learning-notes/`、`algorithm/template/` | 算法笔记和竞赛模板 |
| `notes/` | 数据结构、Linux 等课程和工具笔记 |
| `machine-learning/` | 机器学习、深度学习和 NLP 笔记 |
| `projects/`、`research/` | 项目记录、论文阅读和实验 |
| `post/`、`topics/` | 随笔、问答和串联已有文章的专题 |

每篇文章单独建个目录，正文写在 `index.md`，配图也放在一起。目录的标题和简介写在 `_index.md`。

分类会从栏目继承，知识点写在 `tags` 里。题解还可以用 `platform` 和 `problem_id` 记录平台和题号。文章发布后，改标题或挪目录时记得保留原来的 `knowledge_id` 和 `url`。字段示例和系列文章的写法见 [维护说明](docs/maintenance.md)。

## 发布

准备发的文章把 `draft` 改成 `false`。改过文章链接或站点模板，可以先在本地构建并检查一遍。

```powershell
hugo --gc --minify --destination work/check --cleanDestinationDir --panicOnWarning
python -m unittest discover -s scripts -p "test_*.py"
python scripts/check_site.py --site work/check
```

推送到 `main` 或 `master` 后，GitHub Actions 会构建站点，检查站内链接和旧网址，检查通过后部署。[部署配置](.github/workflows/deploy.yml)
