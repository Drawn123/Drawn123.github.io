---
title: "CF 1779C Least Prefix Sum"
date: 2026-11-06
knowledge_id: "solution-cf-1779c"
url: "/algorithm/solutions/greedy/cf-1779c/"
tags:
  - "贪心 | Greedy"
  - "堆 | Heap"
  - "前缀和 | Prefix Sum"
platform:
  - "Codeforces"
problem_id: "CF1779C"
draft: false
---

## CF 1779C Least Prefix Sum

[CF 1779C Least Prefix Sum](https://codeforces.com/contest/1779/problem/C)

### 题意

一次操作可以把任意 $a_i$ 变成 $-a_i$。求最少操作次数，使第 $m$ 个非空前缀和不大于其他所有非空前缀和，允许并列最小。多组测试，$\sum n\le2\times10^5$。

### 思路

设前缀和为 $pre$，将条件 $pre_m\le pre_k$ 移项，左右两侧可以分别处理。

1. 当 $k<m$，要求 $a_{k+1}+\cdots+a_m\le0$。从 $m$ 向左扫到 $2$，维护这段和 `cur`。一旦 `cur>0`，就从大根堆中取出最大的数翻成负数，让和减少 $2t$。
2. 当 $k>m$，要求 $a_{m+1}+\cdots+a_k\ge0$。从 $m+1$ 向右扫，一旦和为负，就从小根堆中取最小的数翻成正数。
3. 每次违规都必须增加一次操作，选择能让当前和改善最多的数，也给后续留下最多余量。两边涉及的位置互不相交，操作次数相加即可。

左侧不处理 $a_1$，因为题目只比较非空前缀和。

**时间复杂度：**$O(n\log n)$。

### AC代码

```c++
void solve(){
    int n,m;
    cin>>n>>m;
    vector<int> a(n+1);
    for(int i=1;i<=n;i++) cin>>a[i];

    int cur=0;
    int ans=0;
    priority_queue<int> q;

    for(int i=m;i>=2;i--){
        cur += a[i];
        q.push(a[i]);
        while(cur>0){
            int t=q.top();
            q.pop();
            cur -= 2*t;
            ans++;
        }
    }

    cur=0;
    priority_queue<int,vector<int>,greater<int>> p;
    for(int i=m+1;i<=n;i++){
        cur += a[i];
        p.push(a[i]);
        while(cur<0){
            int t=p.top();
            p.pop();
            cur -= 2*t;
            ans++;
        }
    }
    cout<<ans<<endl;
}
```
