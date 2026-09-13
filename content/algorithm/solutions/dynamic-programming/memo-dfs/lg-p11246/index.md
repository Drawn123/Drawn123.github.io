---
title: "P11246 小杨和整数拆分"
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
problem_id: "P11246"
weight: 10
pinned: false
draft: false
---

## P11246 [GESP202409 六级] 小杨和整数拆分

[P11246 小杨和整数拆分](https://www.luogu.com.cn/problem/P11246)

**题意：**

将整数 $n$ 拆分成若干个完全平方数之和，求所需平方数的最少个数。

**核心观察：**

1. 若拆分出的最后一个完全平方数是 $i^2$，剩余部分就是一个规模更小的同类问题 $x-i^2$。
2. 定义 `memo(x)` 表示凑出整数 $x$ 最少需要多少个完全平方数，转移为
   $$memo(x)=\min_{i^2\le x}\{memo(x-i^2)+1\}。$$
3. 最坏情况下可以全部使用 $1^2$，因此答案初值可以设为 $x$。

**算法步骤：**

1. 令 `memo(0)=0`，表示凑出 $0$ 不需要任何数。
2. 枚举所有不超过 $x$ 的完全平方数 $i^2$，递归计算剩余部分的最优答案。
3. 用 `dp[x]` 保存结果，避免重复计算相同的 $x$。

**时间复杂度：**$O(N\sqrt N)$

**代码：**

```c++
#define int long long

vector<int> dp;

int memo(int x){// 凑出x需要的完全平方数的个数
    if(x==0) return 0;
    if(dp[x]!=-1) return dp[x];

    int ans=x;// 最坏全部使用1
    for(int i=1;i*i<=x;i++){
        ans=min(ans,memo(x-i*i)+1);
    }
    return dp[x]=ans;
}

void solve(){
    int n;
    cin>>n;
    dp.assign(n+1,-1);
    int ans=memo(n);
    cout<<ans<<endl;
}
```
