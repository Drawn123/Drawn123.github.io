---
title: "CF 1473E Minimum Path"
date: 2026-08-08
knowledge_id: "solution-cf-1473e"
url: "/algorithm/solutions/graph-theory/shortest-path/cf-1473e/"
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
  - "分层图最短路 | Layered Shortest Path"
platform:
  - "Codeforces"
problem_id: "CF1473E"
draft: false
---

## CF 1473E Minimum Path

[CF 1473E Minimum Path](https://codeforces.com/contest/1473/problem/E)

### 题意

给定连通无向正权图，一条路径的代价为边权和减去最大边权、再加上最小边权。求从 $1$ 到每个 $i\ge2$ 的最小代价。$n,m\le2\times10^5$，边权不超过 $10^9$。

### 思路

1. 将代价看作“免费经过一条边，再把一条边费用加倍”。对固定路径，免费机会选最大边，加倍机会选最小边最优，正好得到题目代价。反过来，任意选择的费用都不低于这一最优值，所以可以直接对两种机会建状态图。
2. 用 `mask` 的低两位记录是否用过免费、加倍机会，`dis[u][mask]` 表示对应状态下到达 $u$ 的最短距离。每条边可以不用机会、仅免费、仅加倍，或同时用掉两次机会，费用分别为 $w,0,2w,w$。
3. 用 `(mask&i)==0` 排除重复使用，再转移到 `mask|i`。所有费用非负，可以跑 Dijkstra，答案取 `dis[i][3]`。

两次机会允许用在同一条边上，这样只有一条边的路径也能覆盖。

**时间复杂度：**$O((n+m)\log n)$。

### AC代码

```c++
int n,m;
struct Edge{
    int v,w;
};
struct Node{
    int u,mask,dis;
    bool operator>(const Node& other)const{
        return dis>other.dis;
    };
};

void solve(){
    cin>>n>>m;
    vector<vector<Edge>> g(n+1);
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }

    vector<vector<int>> dis(n+1,vector<int>(4,1e18));
    priority_queue<Node,vector<Node>,greater<Node>> q;

    dis[1][0]=0;
    q.push({1,0,0});

    while(!q.empty()){
        auto [u,mask,d]=q.top();
        q.pop();

        if(d>dis[u][mask]) continue;

        for(auto e:g[u]){
            int v=e.v;
            int w=e.w;
            for(int i=0;i<4;i++){
                // 用过了就不能再用了
                if((mask&i)!=0) continue;
                // 使用之后的新状态
                int nxt=mask | i;

                int cost=w;
                if(i&1) cost -= w;// 免费卡
                if(i&2) cost += w;// 加倍卡

                if(dis[u][mask]+cost<dis[v][nxt]){
                    dis[v][nxt]=dis[u][mask]+cost;
                    q.push({v,nxt,dis[v][nxt]});
                }

            }
        }

    }

    for(int i=2;i<=n;i++){
        cout<<dis[i][3]<<" ";
    }
    cout<<endl;
}
```
