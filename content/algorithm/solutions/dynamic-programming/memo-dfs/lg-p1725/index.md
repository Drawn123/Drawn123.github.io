---
title: "P1725 琪露诺"
date: 2026-07-26
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "动态规划 | DP"
  - "单调队列 | Monotonic Queue"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1725"
weight: 10
pinned: false
draft: false
---

## P1725 琪露诺

[P1725 琪露诺](https://www.luogu.com.cn/problem/P1725)

**核心观察：**

1. 定义 $dp[i]$ 表示到达第 $i$ 个格子时能够获得的最大冰冻指数。若从格子 $j$ 跳到 $i$，必须满足 $l\le i-j\le r$，即 $j\in[i-r,i-l]$。
2. 因此转移为
   $$dp[i]=a[i]+\max_{j\in[i-r,i-l]}dp[j]。$$
3. 转移所需的是一个随 $i$ 向右滑动的区间最大值，可以用单调队列维护，使每个位置至多入队、出队各一次。
4. 当所在格子再跳一步就会越过终点时可以结束，因此最后在 $[n-r+1,n]$ 中选取答案。

**算法步骤：**

1. 初始化 `dp[0]=0`，其他状态设为负无穷，表示暂时不可达。
2. 枚举落点 $i$，先删除队首已经不在区间 $[i-r,i-l]$ 中的位置。
3. 将新进入窗口的位置 $i-l$ 加入队列，并保持队列中的 `dp` 单调递减。
4. 用队首状态更新 `dp[i]`，最后统计所有能够直接跳出终点的位置。

**时间复杂度：**$O(N)$

**代码：**

```c++
#define int long long

vector<int> a;
int n,l,r;

void solve(){
    cin>>n>>l>>r;
    a.resize(n+1);
    for(int i=0;i<=n;i++) cin>>a[i];

    deque<int> q;
    vector<int> dp(n+1,-1e18);// 到i号格子能获得的最大冰冻指数
    dp[0]=0;
    for(int i=l;i<=n;i++){
        int in=i-l;
        // 当前可转移的起点范围为[i-r,i-l]
        while(!q.empty() && q.front()<i-r){
            q.pop_front();
        }
        while(!q.empty() && dp[q.back()]<dp[in]){
            q.pop_back();
        }
        q.push_back(in);
        if(dp[q.front()]!=-1e18){
            dp[i]=dp[q.front()]+a[i];
        }
    }

    int ans=-1e18;
    for(int i=max(0ll,n-r+1);i<=n;i++){
        ans=max(ans,dp[i]);
    }
    cout<<ans<<endl;
}
```
