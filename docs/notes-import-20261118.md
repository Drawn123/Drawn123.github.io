# 算法笔记筛选记录（2026-11-18）

来源：`D:/00Algorithm_Notes`。遍历 108 份 Markdown，其中 `01_Problem_Solution` 下有 87 份；另外检查了排列 LCS 笔记和 ABC 461、463 合集。只收录已有完整推导与实现、且本轮有保留价值的内容。原笔记不修改、不删除。

本次新增 5 篇独立题解、20 道模板例题。已在博客或模板中出现的题目不重复发布。

## 独立文章与日期

文章首次日期按源文件最后修改时间填写，保留北京时间与具体时分秒。

| 文章 | 源文件最后修改时间 | 文件 |
| --- | --- | --- |
| P16236 LQ 聚合 | 2026-05-16T11:54:58+08:00 | [content/algorithm/solutions/greedy/contribution/lg-p16236/index.md](../content/algorithm/solutions/greedy/contribution/lg-p16236/index.md) |
| 牛客 120562F x?y?n! | 2026-05-19T16:01:16+08:00 | [content/algorithm/solutions/math/number-theory/nc-120562f/index.md](../content/algorithm/solutions/math/number-theory/nc-120562f/index.md) |
| CF 2114F Small Operations | 2026-05-16T12:23:51+08:00 | [content/algorithm/solutions/math/number-theory/cf-2114f/index.md](../content/algorithm/solutions/math/number-theory/cf-2114f/index.md) |
| 牛客 120562J 终于再见 | 2026-05-19T16:01:11+08:00 | [content/algorithm/solutions/graph-theory/shortest-path/multi-source-bfs/nc-120562j/index.md](../content/algorithm/solutions/graph-theory/shortest-path/multi-source-bfs/nc-120562j/index.md) |
| CF 2239B Decidophobia | 2026-07-21T16:04:41+08:00 | [content/algorithm/solutions/greedy/contribution/cf-2239b/index.md](../content/algorithm/solutions/greedy/contribution/cf-2239b/index.md) |

## 进入模板的题目

均写入 [ICPC 算法模板](../content/algorithm/template/template/index.md)，不另发同题文章。

| 题目 | 放入内容 |
| --- | --- |
| [ABC 444D Many Repunit Sum](../content/algorithm/template/template/index.md#example-abc-444d) | 差分与十进制进位 |
| [ABC 461D Count Subgrid Sum = K](../content/algorithm/template/template/index.md#example-abc-461d) | 仅选 D：矩阵枚举行边界，降成一维计数 |
| [ABC 455E Unbalanced ABC Substrings](../content/algorithm/template/template/index.md#example-abc-455e) | 前缀计数差与容斥 |
| [ABC 444E Sparse Range](../content/algorithm/template/template/index.md#example-abc-444e) | 滑动窗口与有序集合前驱后继 |
| [P2296 寻找道路](../content/algorithm/template/template/index.md#example-lg-p2296) | 反向建图与可达性筛点 |
| [ABC 463E Roads and Gates](../content/algorithm/template/template/index.md#example-abc-463e) | 仅选 E：虚拟点压缩稠密边 |
| [ABC 176D Wizard in Maze](../content/algorithm/template/template/index.md#example-abc-176d) | 01BFS 的零费用与一次传送 |
| [P2802 回家](../content/algorithm/template/template/index.md#example-lg-p2802) | 带血量状态的 BFS |
| [P1137 旅行计划](../content/algorithm/template/template/index.md#example-lg-p1137) | 拓扑序与 DAG 最长路 |
| [CF 1873H Mad City](../content/algorithm/template/template/index.md#example-cf-1873h) | 无向基环树剥叶与追逃 |
| [ABC 465D X to Y](../content/algorithm/template/template/index.md#example-abc-465d) | 隐式树与 LCA |
| [P1020 导弹拦截](../content/algorithm/template/template/index.md#example-lg-p1020) | 最长不上升子序列、LIS 与最少链覆盖 |
| [P1439 两个排列的最长公共子序列](../content/algorithm/template/template/index.md#example-lg-p1439) | 排列 LCS 转 LIS |
| [ABC 418D XNOR Operation](../content/algorithm/template/template/index.md#example-abc-418d) | 按子串结尾与零的奇偶性计数 |
| [ABC 456D Not Adjacent 2](../content/algorithm/template/template/index.md#example-abc-456d) | 按子序列末尾字符计数 |
| [P16238 理想温度](../content/algorithm/template/template/index.md#example-lg-p16238) | 按修改值分组的最大子段和 |
| [CF 1926G Vlad and Trouble at MIT](../content/algorithm/template/template/index.md#example-cf-1926g) | 树形 DP 中保留边与切断边 |
| [P2657 windy 数](../content/algorithm/template/template/index.md#example-lg-p2657) | 数位 DP：上界、前导零与记忆化 |
| [P1842 奶牛玩杂技](../content/algorithm/template/template/index.md#example-lg-p1842) | 相邻交换确定排序 |
| [2024 山东省赛 F Divide the Sequence](../content/algorithm/template/template/index.md#example-2024shandong-f) | 分段权重转切点后缀贡献 |

## 模板结构与修正

- 统一为“方法 → 例题 → 各道题”，同组题目平级；原有 42 道例题的锚点全部保留。
- LIS 与排列 LCS 复用原有两个小节，没有再设一组重复目录。
- ABC 455E 修正笔记中的容斥符号，使用总数减三种两两相等，再加两倍三者相等。
- ABC 461D 修正零前缀重复出现时的计数清理，避免 `cnt[0]` 变负；正式代码只运行计数做法。
- CF 1926G 按父亲编号小于儿子的输入性质倒序 DP，避免长链递归栈问题。
- CF 2114F 保留因数记忆化思路，改为记录本次用过的状态再清理，补足 gcd 消去的最优性理由。
- P1842 补上文字版交换论证，复杂度修正为排序主导的 $O(n\log n)$。
- 增加细分标签，更新题解 skill 中的模板层级、文件夹筛选与交付清单要求。

## 文件筛选明细

“本轮不选”只记录本次取舍，不意味着该题不存在其他有价值的做法。合集按题筛选，没有整场搬入。

| 源文件（相对笔记目录） | 本次处理 |
| --- | --- |
| `00_Template/动态规划/Linear_DP/LG_LCS_P1439.md` | 进入模板：排列 LCS 转 LIS |
| `01_Problem_Solution/01_基础算法/01_模拟/2025online1_A.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/02_排序/2024_SD_C.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/02_排序/ABC_444_C.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/2023_SD_D.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/2024_SD_A.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/2025_SD_A.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/CF_1062_div4_E.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/CF_1101_div2_C.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/03_二分三分查找/LG_P1314.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/01_基础算法/04_前缀和差分/ABC_444_D.md` | 进入模板：差分与十进制进位 |
| `01_Problem_Solution/01_基础算法/04_前缀和差分/LG_P16236.md` | 独立文章：P16236 LQ 聚合 |
| `01_Problem_Solution/01_基础算法/04_前缀和差分/LG_P16238.md` | 进入模板：按修改值分组的最大子段和 |
| `01_Problem_Solution/01_基础算法/05_双指针/ABC_444_E.md` | 进入模板：滑动窗口与有序集合前驱后继 |
| `01_Problem_Solution/01_基础算法/05_双指针/CF_1096_div3_D.md` | mex 回文的局部构造较特殊，本轮不选 |
| `01_Problem_Solution/01_基础算法/05_双指针/CF_edu192_C.md` | 块状规律与生长过程较特殊，本轮不选 |
| `01_Problem_Solution/02_动态规划/01_线性DP/ABC_418_D.md` | 进入模板：按子串结尾与零的奇偶性计数 |
| `01_Problem_Solution/02_动态规划/01_线性DP/ABC_456_D.md` | 进入模板：按子序列末尾字符计数 |
| `01_Problem_Solution/02_动态规划/01_线性DP/ABC_466_E.md` | 后半部分留有空实现，按未完成材料跳过 |
| `01_Problem_Solution/02_动态规划/01_线性DP/LG_P1020.md` | 进入模板：最长不上升子序列、LIS 与最少链覆盖 |
| `01_Problem_Solution/02_动态规划/01_线性DP/QLU_2026SpringRank1_E.md` | 三串交错的多下标 DP 完整，但本轮优先保留更常用的状态设计材料 |
| `01_Problem_Solution/02_动态规划/01_线性DP/QLU_2026SpringRank2_D.md` | 明确标注没写完，且有空代码块 |
| `01_Problem_Solution/02_动态规划/06_树形DP/CF_928_div3_G.md` | 进入模板：树形 DP 中保留边与切断边 |
| `01_Problem_Solution/02_动态规划/07_其他DP/ABC_451_D.md` | 拼接数与快速幂的题目限制较特殊，本轮不选 |
| `01_Problem_Solution/03_图论/01_Basic_Graph/ABC_445_C.md` | 笔记混入不适用于本题约束的函数图推广，不直接收录 |
| `01_Problem_Solution/03_图论/01_Basic_Graph/CF_1027_D.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/03_图论/01_Basic_Graph/CF_898_div4_H.md` | 进入模板：无向基环树剥叶与追逃 |
| `01_Problem_Solution/03_图论/01_Basic_Graph/LG_P2296.md` | 进入模板：反向建图与可达性筛点 |
| `01_Problem_Solution/03_图论/02_Short_Path/01_Dijkstra/ABC_477_E.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/03_图论/02_Short_Path/02_Floyd/LG_P1529.md` | 只有常规 Floyd 套用，新增解释较少 |
| `01_Problem_Solution/03_图论/02_Short_Path/2025online1_M.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/03_图论/02_Short_Path/CF_1063_B.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/03_图论/03_Union_find_MST/2024_SD_J.md` | 并查集实现留有省略占位 |
| `01_Problem_Solution/03_图论/03_Union_find_MST/2025_SD_H.md` | 推导中保留未厘清的反例讨论，本轮不直接收录 |
| `01_Problem_Solution/03_图论/03_Union_find_MST/CF_891_div3_G.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/03_图论/03_Union_find_MST/LG_P1111.md` | 排序加并查集的基本流程已在模板中覆盖 |
| `01_Problem_Solution/03_图论/03_Union_find_MST/LG_P1621.md` | 并查集实现留有省略占位 |
| `01_Problem_Solution/03_图论/04_01BFS/ABC_176_D.md` | 进入模板：01BFS 的零费用与一次传送 |
| `01_Problem_Solution/03_图论/2026online1_C.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/04_字符串/01_Basic/MT_MC0563.md` | 按列拆分汉明距离完整，方法较直接，本轮不扩充例题 |
| `01_Problem_Solution/05_数学/01_Basic/ABC_445_E.md` | 明确标注没写完，代码块为空 |
| `01_Problem_Solution/05_数学/01_Basic/ABC_455_E.md` | 进入模板：前缀计数差与容斥 |
| `01_Problem_Solution/05_数学/01_Basic/ABC_465_D.md` | 进入模板：隐式树与 LCA |
| `01_Problem_Solution/05_数学/01_Basic/CF_1043_div3_D.md` | 题号与原题链接不明确，无法稳定对应题目 |
| `01_Problem_Solution/05_数学/01_Basic/CF_928_div4_E.md` | 题意缺失，说明较少，本轮不选 |
| `01_Problem_Solution/05_数学/01_Basic/HDU_2026_Spring_J.md` | 第 k 个序列的计数搜索与本题约束结合较深，本轮不选 |
| `01_Problem_Solution/05_数学/01_Basic/NC_2026Winter3_B.md` | 依赖随机数据性质，笔记中的复杂度与成功率说明不充分 |
| `01_Problem_Solution/05_数学/05_Bitwise/CF_928_div4_D.md` | 31 位互补数配对较直接，本轮不选 |
| `01_Problem_Solution/05_数学/05_Bitwise/NC_2026Winter2_F.md` | 独立文章：牛客 120562F x?y?n! |
| `01_Problem_Solution/05_数学/CF_edu194_B.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/01_Linear/ABC_455_D.md` | 实际操作规则没有完整交代，主体较多是链表基础笔记 |
| `01_Problem_Solution/06_数据结构/02_UnionFind/MT_MC0562.md` | 边定向的奇偶构造较特殊，本轮不选 |
| `01_Problem_Solution/06_数据结构/04_SegTree/ABC_473_F.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/04_SegTree/CF_1181_D.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/04_SegTree/CF_52_C.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/06_Tree/CF_1109_div3_F.md` | 对子节点循环平移的特定构造，本轮不选 |
| `01_Problem_Solution/06_数据结构/06_Tree/LG_P1827.md` | 前中序还原后序较基础，本轮优先选其他树题 |
| `01_Problem_Solution/06_数据结构/2026online1-A.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/字典树/2026online1_L.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/字典树/ABC_287_E.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/06_数据结构/字典树/P2580.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/07_搜索算法/01_DFS/CF_1027_div3_F.md` | 独立文章：CF 2114F Small Operations |
| `01_Problem_Solution/07_搜索算法/02_BFS/2025_HN_F.md` | 一次用药的搜索依赖题目特定场景，本轮不选 |
| `01_Problem_Solution/07_搜索算法/02_BFS/2025_SD_I.md` | 九宫格置换与图示结合较强，本轮不选 |
| `01_Problem_Solution/07_搜索算法/02_BFS/LG_P1588.md` | 只留搜索辅助函数，缺少完整求解入口 |
| `01_Problem_Solution/07_搜索算法/02_BFS/LG_P2730.md` | 只留搜索辅助函数，状态映射说明也未整理完整 |
| `01_Problem_Solution/07_搜索算法/02_BFS/LG_P2802.md` | 进入模板：带血量状态的 BFS |
| `01_Problem_Solution/07_搜索算法/02_BFS/NC_2026Winter2_J.md` | 独立文章：牛客 120562J 终于再见 |
| `01_Problem_Solution/07_搜索算法/05_Memoization/LG_P1137.md` | 进入模板：拓扑序与 DAG 最长路 |
| `01_Problem_Solution/07_搜索算法/05_Memoization/LG_P2657.md` | 进入模板：数位 DP：上界、前导零与记忆化 |
| `01_Problem_Solution/07_搜索算法/06_Prune/LG_P1025.md` | 整数划分 DP 完整，本轮不继续增加相近基础计数题 |
| `01_Problem_Solution/07_搜索算法/06_Prune/Prune_Hints.md` | 只有极短占位内容 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/2024_SD_F.md` | 进入模板：分段权重转切点后缀贡献 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/LC_55.md` | 混有草稿方法与伪代码，且常规跳跃贪心已较直接 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/MT_MC0553.md` | 三元乘积的堆扩展有价值，但当前材料对数值范围交代不足，本轮不选 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/NC_2026Winter1_G.md` | 十进制翻转的局部构造较特殊，本轮不选 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/NC_2026Winter2_B.md` | 冠军选择的奇偶分类较特殊，本轮不选 |
| `01_Problem_Solution/08_贪心算法/01_Basic_Greedy/NC_week125_D.md` | 异或分段的特定贪心条件未充分说明，本轮不选 |
| `01_Problem_Solution/08_贪心算法/04_Sorting_Greedy/MT_MC0565.md` | 候选集合贪心完整，本轮优先保留有交换证明的排序贪心 |
| `01_Problem_Solution/08_贪心算法/05_Other/2024_SD_D.md` | 保留待梳理标记，边界情况尚未整理 |
| `01_Problem_Solution/08_贪心算法/05_Other/ABC_474_E.md` | 博客或模板已有同题，跳过重复内容 |
| `01_Problem_Solution/08_贪心算法/05_Other/LG_P1842.md` | 进入模板：相邻交换确定排序 |
| `01_Problem_Solution/09_思维题/2023_SD_G.md` | 分组后二元配对较直接，本轮不选 |
| `01_Problem_Solution/09_思维题/NC_2026Winter2_E.md` | 矩阵的层状构造较特殊，本轮不选 |
| `01_Problem_Solution/09_思维题/NC_2026Winter2_I.md` | 原说明中的回文路径理由未说明充分，本轮不直接收录 |
| `01_Problem_Solution/10_技巧/01_贡献法/CF_1105_div1_B.md` | 独立文章：CF 2239B Decidophobia |
| `01_Problem_Solution/10_技巧/01_贡献法/NC_2026Winter2_H.md` | 二次贡献统计完整，本轮已有多道贡献转化，不继续扩展相近例题 |
| `01_Problem_Solution/12_构造题/CF_1078div2_D.md` | 二进制网格路径的局部构造较特殊，本轮不选 |
| `ABC_461.md` | 进入模板：仅选 D：矩阵枚举行边界，降成一维计数 |
| `ABC_463.md` | 进入模板：仅选 E：虚拟点压缩稠密边 |

## 验证

- 从最终 Markdown 提取 25 份实现，补公共外壳后按 C++20 编译通过。
- 15641 组小数据验证通过，覆盖暴力枚举、独立最短路、割边枚举、位运算构造合法性，以及基环树追逃的有限状态博弈校验。

## 验证结果

- 从最终 Markdown 提取 25 份实现，补公共外壳后以 C++20 编译通过。
- 可读取原题样例及笔记保留样例共 32 组输入通过；构造题按合法性与最优值校验。
- 小规模穷举、随机对拍与边界校验共 21,091 组通过，覆盖 25 份实现；基环树追逃额外用有限状态博弈求解器交叉验证。
- Hugo 干净发布构建通过，7 项检查器回归测试通过。站内检查 469 个 HTML 页面、71 个保护路由、65 个文章 ID，0 错误。
- 核对原笔记的最后修改时间与首次清单一致，没有写回原目录。
- 仅本地验证，未向评测平台提交；未创建 Git commit 或推送。
