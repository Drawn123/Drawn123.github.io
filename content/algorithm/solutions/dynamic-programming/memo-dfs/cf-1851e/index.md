---
title: "CF 1851E Nastya and Potions"
date: 2026-08-03
knowledge_id: "solution-cf-1851e"
url: "/algorithm/solutions/dynamic-programming/memo-dfs/cf-1851e/"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"
  - "图论 | Graph Theory"
platform:
  - "Codeforces"
problem_id: "CF1851E"
draft: false
---

## CF 1851E Nastya and Potions

[CF 1851E Nastya and Potions](https://codeforces.com/contest/1851/problem/E)

### 题意

有 $n$ 种药水，第 $i$ 种可花 $c_i$ 购买，也可能有一种配方，通过消耗指定的其他药水各一瓶合成。已有 $k$ 种药水可以无限免费获得，配方依赖无环。分别求每种药水的最低获取成本。多组测试，$\sum n$ 与配方材料总数均不超过 $2\times10^5$。

### 思路

令 `dp[u]` 表示获取一瓶 $u$ 的最低成本。免费药水直接设为 $0$；没有配方只能购买，其余取购买和合成的较小值：

$$
dp_u=\min\left(c_u,\sum_{v\in g_u}dp_v\right).
$$

依赖关系无环，直接记忆化 DFS 即可。每个药水只计算一次，共用材料的子问题不会重复展开。

**时间复杂度：**$O(n+M)$，$M$ 为所有配方的材料数之和。

### AC代码

```c++
int n,k;
vector<int> c;
vector<int> p;
vector<vector<int>> g;
vector<int> dp;

int dfs(int u){
    if(dp[u]!=-1) return dp[u];

    if(g[u].empty()){
        return dp[u]=c[u];
    }

    int sum=0;
    for(int v:g[u]){
        sum += dfs(v);
    }

    int res=min(c[u],sum);

    return dp[u]=res;
}

void solve(){
    cin>>n>>k;
    c.resize(n+1);
    p.resize(k+1);
    g.assign(n+1,vector<int>());
    dp.assign(n+1,-1);
    for(int i=1;i<=n;i++) cin>>c[i];
    for(int i=1;i<=k;i++){
        cin>>p[i];
        dp[p[i]]=0;
    }

    for(int i=1;i<=n;i++){
        int m;
        cin>>m;
        for(int j=0;j<m;j++){
            int x;
            cin>>x;
            g[i].push_back(x);
        }
    }

    for(int i=1;i<=n;i++){
        cout<<dfs(i)<<" ";
    }
    cout<<endl;
}
```
