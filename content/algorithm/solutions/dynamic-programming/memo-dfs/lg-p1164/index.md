---
title: "P1164 小 A 点菜"
date: 2026-07-21
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1164"
weight: 10
pinned: false
draft: false
---

## P1164 小 A 点菜

[P1164 小 A 点菜](https://www.luogu.com.cn/problem/P1164)

**题意：**

有 $n$ 道菜，每道菜价格已知，要求从中选择若干道，使总价恰好为 $m$，求选择方案数。

**核心观察：**

1. 对于第 $u$ 道菜，只有“点”和“不点”两种选择，因此可以用搜索枚举所有选择方案。
2. 搜索过程中只需要记录当前考虑到的菜品编号 $u$ 和已经花掉的钱数 $sum$。相同的 $(u,sum)$ 之后面对的选择完全一致，可以直接记忆化。
3. 当 $sum=m$ 时已经恰好用完所有钱，得到一种合法方案；当金额超过 $m$ 或所有菜都已考虑完时，本次选择无效。

**算法步骤：**

1. 定义 `memo(u,sum)` 表示从第 $u$ 道菜开始选择、当前总价为 $sum$ 时的方案数。
2. 分别递归计算不选第 $u$ 道菜和选择第 $u$ 道菜的方案数。
3. 将两部分答案相加并保存到 `dp[u][sum]` 中。

**时间复杂度：**$O(NM)$

**代码：**

```c++
#define int long long

const int N=110;
int a[N];
int n,m;
vector<vector<int>> dp;

int memo(int u,int sum){// 在前u个物品总和为sum获得的方案数
    if(sum==m) return 1;
    if(sum>m || u>n) return 0;

    if(dp[u][sum]!=-1) return dp[u][sum];

    int res=memo(u+1,sum);
    if(sum+a[u]<=m){
        res+=memo(u+1,sum+a[u]);
    }
    return dp[u][sum]=res;
}

void solve(){
    cin>>n>>m;
    dp.resize(n+1,vector<int>(m+1,-1));
    for(int i=1;i<=n;i++) cin>>a[i];

    int ans=memo(1,0);
    cout<<ans<<endl;
}
```
