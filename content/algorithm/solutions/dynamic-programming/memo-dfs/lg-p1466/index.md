---
title: "P1466 集合 Subset Sums"
date: 2026-07-23
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1466"
weight: 10
pinned: false
draft: false
---

## P1466 [USACO2.2] 集合 Subset Sums

[P1466 集合 Subset Sums](https://www.luogu.com.cn/problem/P1466)

**核心观察：**

1. 两个集合的元素和相等，当且仅当其中一个集合的元素和等于总和的一半。若总和为奇数，显然无解。
2. 因此问题可以转化为：从 $1\sim n$ 中选出若干个数，使它们的和恰好为 $tar=\frac{n(n+1)}4$。
3. 每一种划分会被计算两次，因为任意一组合法子集及其补集对应同一种划分，所以最后要将方案数除以 $2$。

**算法步骤：**

1. 定义 `memo(i,rem)` 表示只考虑 $1\sim i$，凑出剩余和 $rem$ 的方案数。
2. 对数字 $i$ 分别考虑不选和选择两种情况，得到转移：`memo(i-1,rem)+memo(i-1,rem-i)`。
3. 记忆化所有状态，求出目标子集数量后除以 $2$。

**时间复杂度：**$O(N\cdot tar)$

**代码：**

```c++
#define int long long

const int N=40;
const int M=N*N;
int dp[N][M];
int n,tar;

// 当前考虑到第i个数，还需要凑齐rem的方案数
int memo(int i,int rem){
    if(rem==0) return 1;
    if(i<=0 || rem<0) return 0;
    if(dp[i][rem]!=-1) return dp[i][rem];

    int res=memo(i-1,rem);// 不选i
    if(rem-i>=0) res+=memo(i-1,rem-i);// 选择i

    return dp[i][rem]=res;
}

void solve(){
    cin>>n;
    memset(dp,-1,sizeof dp);
    int sum=(1+n)*n/2;
    if(sum&1){
        cout<<0<<endl;
        return;
    }
    tar=sum/2;
    int ans=memo(n,tar);
    cout<<ans/2<<endl;
}
```
