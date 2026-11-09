---
title: "CF 1526C1 Potions (Easy Version)"
date: 2026-11-06
knowledge_id: "solution-cf-1526c1"
url: "/algorithm/solutions/dynamic-programming/memo-dfs/cf-1526c1/"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"
platform:
  - "Codeforces"
problem_id: "CF1526C1"
draft: false
---

## CF 1526C1 Potions (Easy Version)

[CF 1526C1 Potions (Easy Version)](https://codeforces.com/contest/1526/problem/C1)

### 题意

初始血量为 $0$，按顺序选择是否喝下每瓶药水，喝下后血量增加 $a_i$。整个过程中血量不能为负，求最多能喝多少瓶。此版本 $n\le2000$。

### 思路

定义 `dfs(i,j)` 为前 $i$ 瓶恰好喝 $j$ 瓶时，能剩下的最大血量；不可行返回 $-1$，尚未计算用 $-2$ 区分。

第 $i$ 瓶不喝，继承 `dfs(i-1,j)`；若喝，必须先保证 `pre=dfs(i-1,j-1)` 可行，且 `pre+a[i]>=0`。两种情况取最大值，$j=0$ 时血量为 $0$。

从大到小枚举 $j$，第一个可行状态就是答案。相同瓶数只保留最大血量，因为它能覆盖较小血量的所有后续选择。

若将 $j$ 倒序迭代更新，可以压成一维 DP。数据更大时可用 [C2 的堆贪心](knowledge:solution-cf-1526c2)。

**时间复杂度：**$O(n^2)$。

### AC代码

```c++
const int N=2010;
int dp[N][N];
int n;
int a[N];

int dfs(int i,int j){
    if(j>i || j<0) return -1;
    if(dp[i][j]!=-2) return dp[i][j];
    if(j==0) return 0;

    // 不喝第i瓶
    int res=dfs(i-1,j);

    // 喝第i瓶
    int pre=dfs(i-1,j-1);
    if(pre>=0 && pre+a[i]>=0){
        res=max(res,pre+a[i]);
    }

    return dp[i][j]=res;
}
void solve(){
    cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=0;i<=n;i++){
        for(int j=0;j<=n;j++){
            dp[i][j]=-2;
        }
    }

    for(int j=n;j>=0;j--){
        if(dfs(n,j)>=0){
            cout<<j<<endl;
            return ;
        }
    }
}
```
