---
knowledge_id: "solution-cf-2266g"
url: "/algorithm/solutions/graph-theory/tree/cf-2266g/"
title: "CF 2266G Modular Tree"
date: 2026-10-24
lastmod: 2026-10-24
tags:
  - "树 | Tree"
  - "动态规划 | DP"
  - "数论 | Number Theory"
platform:
  - "Codeforces"
problem_id: "CF2266G"
draft: false
---

## G - Modular Tree

[G - Modular Tree](https://codeforces.com/contest/2266/problem/G)

### 题意

给定一棵以 \(1\) 为根、包含 \(n\) 个点的树。点 \(i\) 的初始值为 \(a_i\)，模数为 \(b_i\)，满足 $0\le a_i<b_i$。用 \(x_i\) 表示当前值，初始时 \(x_i=a_i\)。

每次选择一个点 \(u\)，设它所有直接儿子的当前值之和为 \(s\)，执行：

\[
x_u\leftarrow(x_u+s)\bmod b_u.
\]

可以执行任意次操作，也可以不操作。求所有点当前值之和的最大值。

\(1\le t\le10^4\)，\(1\le n\le2\times10^5\)，\(1\le b_i\le10^9\)，所有测试的 \(n\) 之和不超过 \(2\times10^5\)。

### 思路

固定儿子不动，对点 \(u\) 的操作就是不断加上同一个数 \(s\)，再模 \(b_u\)。此时能取到的值，是所有与 \(a_u\) 模 \(\gcd(b_u,s)\) 同余的数。

如果儿子可以变化，\(u\) 就有多种可选增量。把这些增量与 \(b_u\) 一起求 gcd，同样可以确定 \(u\) 的全部可达值。因此，需要从叶子往上，先求儿子能取哪些值，再求父亲能取哪些值。

对于每个点 \(u\)，用 \(g_u\) 表示它的可达值之间的间隔，即可达值恰好为

\[
(a_u+kg_u)\bmod b_u,\qquad k\in\mathbb Z.
\]

其中 \(g_u\mid b_u\)。例如 \(a_u=1,b_u=12,g_u=4\)，可达值就是 \(\{1,5,9\}\)。

**1. 利用儿子的可达值，计算 \(g_u\)。**

假设儿子 \(v\) 的 \(g_v\) 已经求出：

- 若 \(g_v=b_v\)，它只能取初始值 \(a_v\)，是一个固定的儿子。
- 若 \(g_v<b_v\)，它可以取多个值，相邻可达值相差 \(g_v\)。

先让所有儿子都保持初始值，记它们的和为

\[
S_u=\sum_{v\text{ 是 }u\text{ 的儿子}}a_v.
\]

父亲一定可以加上 \(S_u\)。如果只改变一个非固定儿子 \(v\)，就能找到两个相差 \(g_v\) 的儿子和。由于求 gcd 时可以用两数之差替换其中一个数，这个变化间隔 \(g_v\) 也要参与计算。

例如，一个儿子初始为 \(0\)，可以取 \(\{0,2,4\}\)，另一个儿子固定为 \(3\)。父亲可以加 \(3,5,7\)，而

\[
\gcd(b_u,3,5,7)=\gcd(b_u,3,2).
\]

也就是保留初始和 \(3\)，以及可变儿子的间隔 \(2\)。一般情况下，任何儿子和与 \(S_u\) 的差，都是这些间隔的整数倍，因此不必枚举所有的和，只需要计算

\[
g_u=\gcd\left(b_u,S_u,\ g_v\text{，其中 }v\text{ 是非固定儿子}\right).
\]

固定儿子只通过 \(a_v\) 计入 \(S_u\)，不额外加入它的 \(g_v\)，因为它不能提供两种不同取值之间的变化。

对于叶子，儿子和为 \(0\)，也没有可变儿子，所以 \(g_u=\gcd(b_u,0)=b_u\)，恰好表示它只能取初始值。

**2. 根据 \(g_u\)，求每个点的最大值。**

与 \(a_u\) 模 \(g_u\) 同余、且不超过 \(b_u-1\) 的最大值，就是从 \(a_u\) 开始，尽量多加几个 \(g_u\)：

\[
M_u=a_u+\left\lfloor\frac{b_u-1-a_u}{g_u}\right\rfloor g_u.
\]

这些最大值可以同时取得：先把根调到最大值，再停止操作根，继续处理各个儿子的子树。子树中的操作不会改变父亲已经确定的值。

之前调整父亲时改变过的子树，也可以恢复后重新调整。因为固定儿子时，同一个点连续操作 \(b_u\) 次会回到原值，所以每次操作都能撤销，一串操作也能按相反顺序撤销。这样就可以从根往下，依次让每个点达到最大值。

因此，答案为

\[
\sum_{u=1}^{n}M_u.
\]

实现时，先建立父子关系和一个父亲在儿子前面的遍历序列，再倒序计算 \(g_u\)，保证处理父亲时儿子都已求出。儿子初始值之和与答案使用 `long long`。

**时间复杂度：**\(O(n\log 10^9)\)；**空间复杂度：**\(O(n)\)。

### AC代码

```c++
int n,ans;
vector<int> a,b,d;
vector<vector<int>> g;

void dfs(int u,int fa){
    int sum=0;
    d[u]=b[u];
    for(int v:g[u]){
        if(v==fa) continue;
        dfs(v,u);
        sum += a[v];
        // 只有可变儿子才提供变化间隔
        if(d[v]<b[v]) d[u]=__gcd(d[u],d[v]);
    }
    d[u]=__gcd(d[u],sum);
    ans += b[u]-d[u]+a[u]%d[u];
}

void solve(){
    cin>>n;
    a.resize(n+1);
    b.resize(n+1);
    d.resize(n+1);
    g.assign(n+1,vector<int>());
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=n;i++) cin>>b[i];

    for(int i=0;i<n-1;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    ans=0;
    dfs(1,0);
    cout<<ans<<endl;
}
```
