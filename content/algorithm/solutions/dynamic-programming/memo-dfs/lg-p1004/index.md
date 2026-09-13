---
title: "P1004 方格取数"
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
problem_id: "P1004"
weight: 10
pinned: false
draft: false
---

## P1004 [NOIP 2000 提高组] 方格取数

[P1004 方格取数](https://www.luogu.com.cn/problem/P1004)

**题意：**

在棋盘中从左上角到右下角走两次，每次只能向右或向下，同一个格子的数字最多计算一次，求两条路线取得的数字总和最大值。

**核心观察：**

1. 两次从左上角到右下角的路线可以看成两个人同时行走。每一步两个人都只能向右或向下，因此共有四种移动组合。
2. 状态 `memo(x1,y1,x2,y2)` 表示两个人分别位于 $(x_1,y_1)$、$(x_2,y_2)$ 时，从当前状态到终点最多还能取得多少数。
3. 若两个人处在同一个格子，这个格子的数只能计算一次；否则将两个格子的数相加。
4. 采用“从当前状态走向终点”的搜索方向，已经取过的格子不会影响后续状态，保证状态具有无后效性。

**算法步骤：**

1. 读入所有非零格子，未给出的格子权值默认为 $0$。
2. 从四种下一步组合中选择能取得最大值的一种。
3. 将当前格子的贡献加到后继状态的最优值上，并记忆化保存。
4. 从 `memo(1,1,1,1)` 开始搜索得到答案。

**时间复杂度：**$O(N^4)$

**代码：**

```c++
#define int long long

const int N=10;
int dp[N][N][N][N];
int g[N][N];
int n;

// 两个人从当前两个位置走到终点还能获得的最大和
int memo(int x1,int y1,int x2,int y2){
    if(x1>n || y1>n || x2>n || y2>n) return 0;
    if(dp[x1][y1][x2][y2]!=-1) return dp[x1][y1][x2][y2];

    int cur=0;
    if(x1==x2 && y1==y2) cur=g[x1][y1];
    else cur=g[x1][y1]+g[x2][y2];

    int res1=memo(x1+1,y1,x2+1,y2);
    int res2=memo(x1,y1+1,x2,y2+1);
    int res3=memo(x1+1,y1,x2,y2+1);
    int res4=memo(x1,y1+1,x2+1,y2);

    int next=max({res1,res2,res3,res4});
    return dp[x1][y1][x2][y2]=cur+next;
}

void solve(){
    cin>>n;
    memset(dp,-1,sizeof dp);
    int x,y,v;
    while(cin>>x>>y>>v && !(x==0 && y==0 && v==0)){
        g[x][y]=v;
    }
    int ans=memo(1,1,1,1);
    cout<<ans<<endl;
}
```
