---
title: "CF 144D Missile Silos"
date: 2026-08-20
knowledge_id: "solution-cf-144d"
url: "/algorithm/solutions/graph-theory/shortest-path/cf-144d/"
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
platform:
  - "Codeforces"
problem_id: "CF144D"
draft: false
---

## CF 144D Missile Silos

[CF 144D Missile Silos](https://codeforces.com/contest/144/problem/D)

### 题意

给定连通无向正权图和起点 $s$，统计到 $s$ 的最短距离恰好为 $l$ 的位置数量，位置可以是顶点，也可以在边的内部。$n\le10^5$，$m\le10^5$。

### 思路

1. 先跑 Dijkstra，统计 `dis[i]==l` 的顶点。
2. 对边 $(u,v,w)$，从 $u$ 端出发的候选点距 $u$ 为 $need_1=l-dis_u$。它必须严格在边内，即 $0<need_1<w$，还要保证从 $v$ 绕过来不会更短：

   $$
   dis_v+w-need_1\ge l
   \iff need_1+need_2\le w,
   $$

   其中 $need_2=l-dis_v$。从 $v$ 端同理判断。
3. 若两端候选都合法，且 $need_1+need_2=w$，它们是同一个点，只计一次；小于 $w$ 时是两个不同点。

端点已在第一步统计，所以边内的判断必须用严格不等号。

**时间复杂度：**$O((n+m)\log n)$。

### AC代码

```c++
int n,m,s;
struct Edge{
    int u,v,w;
};
vector<Edge> edge;
vector<vector<pii>> g;

void solve(){
    cin>>n>>m>>s;
    g.assign(n+1,vector<pii>());
    edge.resize(m);
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        edge[i].u=u,edge[i].v=v,edge[i].w=w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }
    int l;
    cin>>l;
    priority_queue<pii,vector<pii>,greater<pii>> q;
    vector<int> dis(n+1,1e18),vis(n+1,0);
    dis[s]=0;
    q.push({0,s});

    while(!q.empty()){
        auto [d,u]=q.top();
        q.pop();
        if(vis[u]) continue;
        vis[u]=1;

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                q.push({dis[v],v});
            }
        }
    }

    int ans=0;
    for(int i=1;i<=n;i++){
        if(dis[i]==l){
            ans++;
        }
    }

    for(auto e:edge){
        int u=e.u,v=e.v,w=e.w;
        if(dis[v]==l && dis[u]==l) continue;
        int need1=l-dis[u];
        int need2=l-dis[v];

        int p1=(need1>0 && need1<w && need1+need2<=w);
        int p2=(need2>0 && need2<w && need1+need2<=w);
        if(p1 && p2 && need1+need2==w){
            ans++;
        }
        else{
            if(p1) ans++;
            if(p2) ans++;
        }

    }
    cout<<ans<<endl;

}
```
