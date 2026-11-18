---
title: "CF 698A Vacations"
date: 2026-11-09
knowledge_id: "solution-cf-698a"
url: "/algorithm/solutions/dynamic-programming/memo-dfs/cf-698a/"
tags:
  - "动态规划 | DP"
  - "线性动态规划 | Linear DP"
  - "记忆化搜索 | Memoized DFS"
platform:
  - "Codeforces"
problem_id: "CF698A"
draft: false
---

## CF 698A Vacations

[Vacations](https://codeforces.com/contest/698/problem/A)

### 题意

有 $n$ 天假期，每天可以休息、参加比赛或健身。$a_i=0$ 表示两项活动都没有，$1$ 表示只有比赛，$2$ 表示只能健身，$3$ 表示两项都可以选。

每天最多参加一项活动，不能连续两天比赛，也不能连续两天健身，可以连续休息。求最少休息多少天。$1\le n\le100$。

### 思路

**今天能做什么，只和昨天做了什么有关。** 不用记住前面每一天的安排，记录上一天的状态就够了。

设 `dfs(i,last)` 表示从第 $i$ 天到第 $n$ 天，上一天状态为 `last` 时，最少还要休息多少天。用 $0,1,2$ 分别表示休息、比赛、健身。

1. 休息始终可选，答案先设为 `dfs(i+1,0)+1`。
2. 如果今天有比赛，且昨天没有比赛，可以转移到 `dfs(i+1,1)`，不增加休息天数。
3. 如果今天能健身，且昨天没有健身，可以转移到 `dfs(i+1,2)`。

三种选择取最小值。同一个 `(i,last)` 后面面对的限制完全相同，用 `dp[i][last]` 记忆化。走到 `i>n` 时返回 $0$，初始调用 `dfs(1,0)`。

这里的 `last` 表示上一天的活动，`dp[i][last]` 存的是后面最少的休息天数，两者不要混淆。

**时间复杂度：**$O(n)$。

### AC代码

```c++
const int N=110;
int dp[N][3];
int a[N];
int n;

// 第i天到第n天，上一天状态为last时，最少休息多少天
int dfs(int i,int last){
    if(i>n) return 0;
    if(dp[i][last]!=-1) return dp[i][last];

    int res=dfs(i+1,0)+1;
    if((a[i]==1 || a[i]==3) && last!=1){
        res=min(res,dfs(i+1,1));
    }
    if((a[i]==2 || a[i]==3) && last!=2){
        res=min(res,dfs(i+1,2));
    }
    return dp[i][last]=res;
}

void solve(){
    cin>>n;
    memset(dp,-1,sizeof dp);
    for(int i=1;i<=n;i++) cin>>a[i];
    cout<<dfs(1,0)<<endl;
}
```
