---
title: "CF 2266E Prime Destruction"
date: 2026-10-03
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"
  - "数论 | Number Theory"
  
difficulty: 
platform:
  - "Codeforces"
problem_id: "2266E"
weight: 10
pinned: false
draft: false
---

## CF 2266E Prime Destruction

[Problem - E - Codeforces](https://codeforces.com/contest/2266/problem/E)

### 题意

给你一个多重集 \(a\) 和整数 \(k\)。每次可把一个 \(x>1\) 换成它的 \(p\) 个 \(\frac{x}{p}\)（\(p\) 是 \(x\) 的素因子）。求让所有数都 \(\le k\) 的最少操作次数。

### 思路

​	每个数产生的操作相互独立，因此可以分别计算将每个 $a_i$ 变成不超过 $k$ 的数所需的最小操作次数，最后将答案相加。

1. 定义 `dfs(x)` 表示把一个 $x$ 及其之后产生的所有数都变成不超过 $k$ 的数，最少需要多少次操作

2. 如果 $x\le k$，当前数已经满足要求，直接返回 $0$

3. 枚举 $x$ 的一个质因子 $p$：
   * 执行一次操作后，一个 $x$ 会变成 $p$ 个 $x/p$
   * 这 $p$ 个数都需要继续操作，每一个的最小代价都是 `dfs(x/p)`
   * 因此转移为：

   $$
   dfs(x)=\min_{p\mid x,\ p\text{ 为质数}}\{1+p\times dfs(x/p)\}
   $$

4. 使用记忆化搜索保存已经计算过的 `dfs(x)`。因为题目保证 $a_i\le n$，所以只需要开大小为 $n$ 的数组

5. 试除法分解质因数时只需要枚举不同的质因子：
   * `t` 用来分解并去除重复质因子
   * 状态转移仍然使用原来的 `x/p`
   * 循环结束后如果 `t>1`，说明 `t` 是剩下的一个质因子

时间复杂度最坏为 $O(n\sqrt n)$，空间复杂度为 $O(n)$。

### AC代码

```c++
const int N=2e5+10;
int n,k;
int dp[N];

int dfs(int x){// x变成<=k的最小操作次数
    if(x<=k) return 0;
    if(dp[x]!=-1) return dp[x];

    int res=1e18;
    int t=x;
    // 试除法枚举不同质因子
    for(int i=2;i*i<=t;i++){
        if(t%i==0){
            res=min(res,i*dfs(x/i)+1);
            while(t%i==0) t/=i;
        }
    }
    if(t>1){
        res=min(res,t*dfs(x/t)+1);
    }
    return dp[x]=res;
}

void solve(){
    cin>>n>>k;
    for(int i=0;i<=n;i++) dp[i]=-1;

    vector<int> a(n);
    for(int i=0;i<n;i++) cin>>a[i];

    int ans=0;
    for(int i=0;i<n;i++) ans+=dfs(a[i]);
    cout<<ans<<endl;
}
```
