---
title: "ABC 473D Coefficient Stair"
date: 2026-08-29
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "搜索 | Search"
  - "枚举 | Enumeration"

difficulty: ""
platform:
  - "AtCoder"
problem_id: "ABC473D"
weight: 10
pinned: false
draft: false
---

## D - Coefficient Stair

[D - Coefficient Stair](https://atcoder.jp/contests/abc473/tasks/abc473_d)

**题意：**

给定正整数 $n,k$，输出所有满足 $a_1+2a_2+\cdots+na_n=k$ 的非负整数序列。

**核心观察：**

1. 需要输出所有满足
   $$a_1+2a_2+\cdots+na_n=k$$
   的非负整数序列 $(a_1,a_2,\ldots,a_n)$。
2. 按下标从小到大确定系数。确定 $a_u$ 时，若当前还剩 `rem`，则 $a_u$ 只能在 $[0,\lfloor rem/u\rfloor]$ 中取值。
3. 当枚举到最后一个位置 $n$ 时，剩余值必须能被 $n$ 整除，此时 $a_n=rem/n$ 唯一确定，可以直接输出方案。

**算法步骤：**

1. 从 `dfs(1,k)` 开始搜索，`u` 表示当前确定第 $u$ 个数，`rem` 表示尚未凑出的值。
2. 枚举当前系数 $a_u$，递归处理 `dfs(u+1,rem-u*a[u])`。
3. 到达 $u=n$ 时检查整除条件，成立就输出完整序列。

**时间复杂度：**与合法的搜索状态数成正比；若记访问的状态数为 $S$、输出方案数为 $K$，则复杂度为 $O(S+NK)$。

**代码：**

```c++
#define int long long

int n,k;
vector<int> a;

void dfs(int u,int rem){
    if(u==n){
        if(rem%u==0){
            a[u]=rem/u;
            for(int i=1;i<=n;i++){
                cout<<a[i]<<" ";
            }
            cout<<endl;
        }
        return;
    }

    int mx=rem/u;
    for(int i=0;i<=mx;i++){
        a[u]=i;
        dfs(u+1,rem-i*u);
    }
}

void solve(){
    cin>>n>>k;
    a.resize(n+1);
    dfs(1,k);
}
```
