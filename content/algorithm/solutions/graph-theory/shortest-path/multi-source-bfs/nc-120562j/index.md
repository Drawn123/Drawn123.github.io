---
title: "牛客 120562J 终于再见"
date: 2026-05-19T16:01:11+08:00
knowledge_id: "solution-nc-120562j"
url: "/algorithm/solutions/graph-theory/shortest-path/multi-source-bfs/nc-120562j/"
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
  - "多源 BFS | Multi-source BFS"
  - "根号分治 | Square Root Decomposition"
  - "度数分析 | Degree Analysis"
platform:
  - "牛客"
problem_id: "NC120562J"
draft: false
---

## 牛客 120562J 终于再见

[题目链接](https://ac.nowcoder.com/acm/contest/120562/J)

### 题意

给定 $n$ 个点、$m$ 条边的简单无向图，边权都是 $1$，城市等级只由度数决定。对每个点，求到任意一个度数严格更大的点的最短距离，不存在则输出 $-1$。

$n,m\le2\times10^5$，图不一定连通，没有重边和自环。

### 思路

对每个点单独 BFS 会重复很多次。换个方向：把所有比当前等级高的点作为起点做多源 BFS，得到的就是当前等级要的答案。

按度数从大到小分组。处理一组时，`dis` 已经表示到更高度数点的最短距离，先把这一组的答案记下来，再把它们全部作为距离为零的新起点，向外更新。

同组必须先查询、再加入，否则会错误地把同级城市作为目的地。原来的起点继续保留，新一轮只有得到更短距离时才入队，不必重置全部距离。

代码中只向度数更低的点扩展。高等级点早已是距离为零的源点，不可能被当前层改善；同组点也已经全部设为零，绕过它们不会比直接从它们出发更优。

剩下要估算组数。若不同度数有 $r$ 种，最小可能的度数和为 $0+1+\cdots+(r-1)$；而图的总度数是 $2m$，所以 $r=O(\sqrt m)$。每轮新源点都以距离零同时入队，按 BFS 层次扩展；若某点没有改善，继续沿它走也不会改善后面的点。因此每轮至多扫描 $O(n+m)$，总时间复杂度 $O(\sqrt m(n+m))$。

### AC代码

```c++
void solve(){
    int n,m;
    cin>>n>>m;
    vector<vector<int>> g(n+1);
    vector<int> d(n+1);
    while(m--){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
        d[u]++,d[v]++;
    }
    map<int,vector<int>> mp;
    for(int i=1;i<=n;i++) mp[d[i]].push_back(i);
    const int inf=1e18;
    vector<int> dis(n+1,inf),ans(n+1,-1);
    for(auto it=mp.rbegin();it!=mp.rend();it++){
        int cd=it->first;
        auto &city=it->second;
        for(int u:city) if(dis[u]!=inf) ans[u]=dis[u];
        queue<int> q;
        for(int u:city){
            dis[u]=0;
            q.push(u);
        }
        while(!q.empty()){
            int u=q.front();q.pop();
            for(int v:g[u]){
                if(d[v]>=cd) continue;
                if(dis[v]>dis[u]+1){
                    dis[v]=dis[u]+1;
                    q.push(v);
                }
            }
        }
    }
    for(int i=1;i<=n;i++) cout<<ans[i]<<" ";
    cout<<endl;
}
```
