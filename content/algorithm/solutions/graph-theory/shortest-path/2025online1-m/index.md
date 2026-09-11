---
title: "2025 ICPC网络赛第一场 M"
date: 2026-09-11
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "分层图最短路 | Layered Shortest Path"
  - "ICPC"

difficulty: 
platform:
problem_id: 
weight: 10
pinned: false
draft: false
---

## M. Teleporter

[Teleporter - Problem - QOJ.ac](https://qoj.ac/contest/2513/problem/14313)

### 题意

给定一棵包含 $n$ 个节点的树（边有边权 $w$），以及 $m$ 条无向传送通道（边权为 $0$）。

规定从城市 $1$ 出发，且在整趟行程中**最多使用 $k$ 次传送门**。

要求对 $k = 0, 1, 2, \dots, n$，分别输出从 $1$ 号点到达所有城市 $u \in [1, n]$ 的最短距离之和 $\sum_{u=1}^n d(u, k)$。

### 思路

#### 暴力分层图最短路

将“使用了多少次传送门”拆分为图的层数。最直接的想法是显式构建一张巨大的分层图：

- **状态：** 节点记为 $(u, k)$，表示当前位于城市 $u$，且**恰好**使用了 $k$ 次传送门（$0 \le k \le n$）。总节点数为 $O(n^2)$。

- **建边：**

  1. **层内树边（同层）：** 连接 $(u, k) \leftrightarrow (v, k)$，权值为 $w$。
  2. **跨层传送边（下跳一层）：** 若存在传送门 $(u, v)$，连接 $(u, k) \leftrightarrow (v, k+1)$，权值为 $0$。

- **求解：**

  以 $(1, 0)$ 为起点跑全局 Dijkstra。对于固定的 $k$，到达 $u$ 的“最多使用 $k$ 次”最短路为 $\min_{0 \le i \le k} \text{dist}[(u, i)]$。

```c++
const int inf=1e18;

struct Edge{
    int v,w;
};
struct node{
    int u,k;
    int d;
    bool operator>(const node& o) const{
        return d>o.d;
    }// .
};

void solve(){
    int n,m;
    cin>>n>>m;
    vector<vector<Edge>> g(n+1);
    for(int i=0;i<n-1;i++){
        int u,v;
        int w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }

    vector<vector<int>> tel(n+1);
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        tel[u].push_back(v);
        tel[v].push_back(u);
    }

    // dis[u][k] 到了u并且使用了k次传送门的最短距离
    vector<vector<int>> dis(n+1,vector<int>(n+1,inf));

    priority_queue<node,vector<node>,greater<node>> q;
    dis[1][0]=0;
    q.push({1,0,0});// 顺序赋值

    while(!q.empty()){
        auto t=q.top();
        q.pop();
        int u=t.u;
        int k=t.k;
        int d=t.d;

        if(d>dis[u][k]) continue;// .

        // 不使用传送门 在本层
        for(auto [v,w]:g[u]){
            if(dis[v][k]>dis[u][k]+w){
                dis[v][k]=dis[u][k]+w;
                q.push({v,k,dis[v][k]});
            }
        }

        // 使用传送门 到下一层
        if(k+1<=n){
            for(int v:tel[u]){
                if(dis[v][k+1]>dis[u][k]){
                    dis[v][k+1]=dis[u][k];
                    q.push({v,k+1,dis[v][k+1]});
                }
            }
        }
    }
    
    vector<int> mn(n+1,inf);
    for(int k=0;k<=n;k++){
        int sum=0;
        for(int u=1;u<=n;u++){// dis[u][k] 是恰好使用k次 
            mn[u]=min(mn[u],dis[u][k]);
            sum += mn[u];
        }
        cout<<sum<<endl;
    }

}
```

##### 复杂度瓶颈分析

- **时间复杂度：** $O(N(N+M) \log(N^2))$。入堆节点数达到 $O(N^2)$，在 $N=5000, M=10000$ 下约为 $10^9$ 次堆操作，会 TLE。
- **空间复杂度：** $O(N^2)$，需要存下整个二维 `dis` 状态数组。

#### 正解

##### 核心优化

传送门有一个至关重要的性质：**只能从 $k$ 层单向跳跃到 $k+1$ 层（不可逆，拓扑序递增）**。

这意味着，第 $k+1$ 层的所有初始起点和状态，**完全取决于第 $k$ 层的最终求解结果**。我们根本不需要把所有层混在一个 `priority_queue` 里，可以像动态规划一样，一层层单独求解，手动松弛：

1. **第 $0$ 层初始化：** 以 $1$ 号点为起点，在树上跑一次单源 Dijkstra，求出全图在不依靠传送门时的最短路 `dis`。

2. **跨层拉取（传送门跳跃）：**

   继承上一层结果 `nxt = dis`（代表放弃使用第 $k$ 次传送门）。遍历所有传送门通道 $(u, v)$，尝试用上一层 $k-1$ 的 `dis[u]` 来松弛当前层 $k$ 的 `nxt[v]`。

3. **同层扩展（多源 Dijkstra）：**

   将当前层所有**真正被传送门更新了的节点**标记为起点入堆，在树上跑一轮**多源 Dijkstra** 松弛。

4. **滚动更新与空间压缩：**

   将 `nxt` 赋给 `dis` 进入下一轮，空间复杂度瞬间降为 $O(N + M)$。

时间复杂度降到 $O(N \cdot N \log N)$

##### AC代码

```c++
const int inf=1e18;

struct Edge{
    int v,w;
};
struct tel{
    int u,v;
};
struct node{
    int u,d;
    bool operator>(const node& o) const{
        return d>o.d;
    }
};

void solve(){
    int n,m;
    cin>>n>>m;
    vector<vector<Edge>> g(n+1);
    for(int i=0;i<n-1;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }  

    vector<tel> t;// .
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        t.push_back({u,v});
    }

    vector<int> dis(n+1,inf);
    priority_queue<node,vector<node>,greater<node>> q;
    dis[1]=0;
    q.push({1,0});

    while(!q.empty()){
        auto [u,d]=q.top();
        q.pop();
        if(d>dis[u]) continue;

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                q.push({v,dis[v]});
            }
        }
    }

    int sum0=0;
    for(int i=1;i<=n;i++){
        sum0 += dis[i];
    }
    cout<<sum0<<endl;

    for(int k=1;k<=n;k++){
        vector<int> nxt=dis;

        // 使用 跨层转移
        for(int i=0;i<m;i++){
            int u=t[i].u;
            int v=t[i].v;

            if(nxt[u]>dis[v]) nxt[u]=dis[v];
            if(nxt[v]>dis[u]) nxt[v]=dis[u];
        }

        // 同层松弛
        for(int i=1;i<=n;i++){
            if(nxt[i]!=inf){
                q.push({i,nxt[i]});
            }
        }

        while(!q.empty()){
            auto [u,d]=q.top();
            q.pop();
            if(d>nxt[u]) continue;

            for(auto [v,w]:g[u]){
                if(nxt[v]>nxt[u]+w){
                    nxt[v]=nxt[u]+w;
                    q.push({v,nxt[v]});
                }
            }
        }
        
        dis=nxt;

        int sum=0;
        for(int i=1;i<=n;i++){
            sum += dis[i];
        }
        cout<<sum<<endl;
    }
}
```

