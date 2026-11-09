---
title: "CF 295B Greg and Graph"
date: 2026-08-20
knowledge_id: "solution-cf-295b"
url: "/algorithm/solutions/graph-theory/shortest-path/cf-295b/"
tags:
  - "图论 | Graph Theory"
  - "Floyd"
platform:
  - "Codeforces"
problem_id: "CF295B"
draft: false
---

## CF 295B Greg and Graph

[CF 295B Greg and Graph](https://codeforces.com/contest/295/problem/B)

### 题意

给定 $n$ 个点的有向完全图及删点顺序。每次删点前，求剩余所有有序点对的最短路之和，路径只能经过未删除的点。$n\le500$。

### 思路

倒序加点。加入 $u=x_k$ 时，把它作为 Floyd 的新中转点，对所有 $i,j$ 更新

$$
d_{i,j}=\min(d_{i,j},d_{i,u}+d_{u,j}).
$$

**更新距离时要枚举所有点对，求和时才限制两端都已加入。**这样尚未加入的点也记录了经过已有中转点的最短距离，之后加入时才能直接接上。

将本轮结果记为 `ans[k]`，最后按原顺序输出。

**时间复杂度：**$O(n^3)$。

### AC代码

```c++
void solve(){
    int n;
    cin>>n;
    vector d(n+1,vector<int> (n+1,0));
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            cin>>d[i][j];
        }
    }
    vector<int> x(n+1);
    for(int i=1;i<=n;i++) cin>>x[i];

    vector<int> vis(n+1,0);
    vector<int> ans(n+1);
    // floyed
    for(int k=n;k>=1;k--){
        int u=x[k];
        vis[u]=1;

        for(int i=1;i<=n;i++){
            for(int j=1;j<=n;j++){
                d[i][j]=min(d[i][j],d[i][u]+d[u][j]);
            }
        }
        int sum=0;
        for(int i=1;i<=n;i++){
            for(int j=1;j<=n;j++){
                if(vis[i] && vis[j]) sum += d[i][j];
            }
        }
        ans[k]=sum;
    }

    for(int i=1;i<=n;i++){
        cout<<ans[i]<<" ";
    }
    cout<<endl;
}
```
