---
title: "ABC 477 E"
date: 2026-09-26
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
  - "Dijkstra"
  
difficulty: ""
platform:
  - "AtCoder"
problem_id: "477E"
weight: 10
pinned: false
draft: false
---

## **E - Wheel Distance**

[E - Wheel Distance](https://atcoder.jp/contests/abc477/tasks/abc477_e)

### 题意

给你一个有边权无向图，图中有 $N+1$ 个顶点，编号 $1 \sim N+1$。

- 对于 $1 \le i \le N$，有一条权值为 $A_i$ 的边连接顶点 $i$ 和顶点 $(i \bmod N)+1$（即 $1\sim N$ 构成一个环）
- 对于 $1 \le i \le N$，有一条权值为 $B_i$ 的边连接顶点 $i$ 和顶点 $N+1$（中心点）

	处理 $Q$ 条查询，每次给出 $S,T$，求从 $S$ 到 $T$ 的最短路径长度。

### 思路

图的结构是 环 + 中心点 ，任意两点 $S,T$ 之间的路径只有两种可能：

1. **不经过中心点**：只在环上走，长度为环上 $S$ 到 $T$ 的最短距离
2. **经过中心点**：路径形如 $S \to C \to T$，长度为 $dist[S] + dist[T]$

	于是：

$$
\text{ans} = \min(\text{环上 }S,T\text{ 最短距离},\ dist[S] + dist[T])
$$

其中 $dist[i]$ 是从中心点 $C = N+1$ 出发，在整个图上跑一次 Dijkstra 得到的最短路。

### 实现要点

1. **Dijkstra**：
   * 从 $C = N+1$ 出发，得到 $dist[1 \sim N]$

2. **环上前缀和**：

   * `pos[i]` = 从点 $1$ 沿环走到点 $i$ 的距离，`pos[1] = 0`，`pos[i+1] = pos[i] + a[i]`

   * `sum = pos[n+1]` 为环的总长度

   * 数组要开 $n+2$，否则 `pos[n+1]` 越界

   * 环上两点距离：`min(abs(pos[s]-pos[t]), sum - abs(pos[s]-pos[t]))`

3. **查询**：

   * 若 $S$ 或 $T$ 是中心点，答案就是 $dist[S] + dist[T]$

   * 否则取环上距离和绕中心距离的较小值

### AC代码

```c++
int n,Q;
vector<int> a,b;
vector<vector<pii>> g;

void solve(){
    cin>>n>>Q;
    a.resize(n+1);
    b.resize(n+1);
    g.resize(n+2);
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=n;i++) cin>>b[i];

    for(int i=1;i<=n;i++){
        int j=i%n+1;
        g[i].push_back({j,a[i]});
        g[j].push_back({i,a[i]});
    }
    for(int i=1;i<=n;i++){
        g[i].push_back({n+1,b[i]});
        g[n+1].push_back({i,b[i]});
    }

    priority_queue<pii,vector<pii>,greater<pii>> q;
    vector<int> dis(n+2,1e18);
    int c=n+1;
    dis[c]=0;
    q.push({0,c});

    while(!q.empty()){
        auto [d,u]=q.top();
        q.pop();

        if(d!=dis[u]) continue;

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                q.push({dis[v],v});
            }
        }
    }

    vector<int> pos(n+2,0);
    pos[1]=0;
    for(int i=1;i<=n;i++){
        pos[i+1]=pos[i]+a[i];
    }
    int sum=pos[n+1];

    while(Q--){
        int s,t;
        cin>>s>>t;
        int ans;
        if(s==c || t==c){
            ans=dis[s]+dis[t];
        }
        else{
            int d=abs(pos[s]-pos[t]);
            int mn=min(d,sum-d);
            ans=min(dis[s]+dis[t],mn);
        }
        cout<<ans<<endl;
    }
}