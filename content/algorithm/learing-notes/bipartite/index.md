---
title: "二分图"
date: 2026-07-27
lastmod: 2026-08-26
categories:
  - "算法 | Algorithm"
tags:
  - "二分图 | Bipartite Graph"
  - "二分图匹配 | Bipartite Matching"
  
weight: 10
pinned: false
draft: false
---



### 二分图判定：染色法

* **二分图定义：** 无向图的 n 个节点可以分成 AB 两个不相交的非空集合，同一个集合内没有边相连为二分图

* **定理：** 二分图不存在奇环

* **染色法判定二分图：** 用两种颜色标记图中节点，一个被标记后，所有与他相邻的都被标记为相反的颜色，如果标记过程中有冲突，说明图中存在奇环，不是二分图

* 可以用DFS和BFS实现

  ```c++
  const int N=2e5+10;
  vector<int> g[N];
  int color[N];// 0表示未染色 1和-1表示两种不同颜色
  
  bool dfs(int u,int c){
      color[u]=c;
      for(int v:g[u]){
          if(color[v]==0){
              if(!dfs(v,-c)) return false;
          }
          else if(color[v]==c){
              return false;
          }
      }
      return true;
  }
  void solve(){
      int n,m;
      cin>>n>>m;
  
      for(int i=1;i<=m;i++){
          int u,v;
          cin>>u>>v;
          g[u].push_back(v);
          g[v].push_back(u);
      }
      bool flag=true;
      for(int i=1;i<=n;i++){
          if(color[i]==0){// 处理非连通图
              if(!dfs(i,1)){
                  flag=false;
                  break;
              }
          }
      }
      if(flag) cout<<"YES"<<endl;
      else cout<<"NO"<<endl;
  }
  ```

  * 非连通图是二分图，当且仅当每一个连通分量都是二分图

    
  
  ---



### 二分图最大匹配：匈牙利算法

**匹配：** “任意两条边都没有公共端点”的边的集合被称为图的一组匹配

**最大匹配：** 二分图中，包含边数最多的一组匹配被称为二分图的最大匹配

**增广路：** 对于任意组匹配 $S$（$S$ 是一个边集合），属于 $S$ 的边称为**匹配边**，不属于 $S$ 的边称为**非匹配边**。匹配边的端点称为**匹配点**，其他节点称为**非匹配点**。如果在二分图中存在一条连接**两个非匹配点**的路径 $\text{path}$，使得**非匹配边**与**匹配边**在 $\text{path}$ 上**交替出现**，那么称 $\text{path}$ 是匹配 $S$ 的**增广路**（也称交错路）。

**增广路性质：**

1. 长度 len 是奇数
2. 路径上第 1、3、5…… len 奇数条边是非匹配边，第 2、4、6…… len-1 偶数条边是匹配边。

> [!NOTE]
>
> 二分图的一组匹配 $S$ 是最大匹配，**当且仅当**该图中不存在 $S$ 的增广路。



**匈牙利算法**

可以采用深搜实现：

对于二分图的每一轮查找，我们的目标是：**尝试给左边的一个未匹配点 $u$ 找一个配偶。**

1. 从左边的未匹配点 $u$ 出发，随便找一条连出去的边，到达右边的一个邻居节点 $v$。
2. 这里会出现两种情况：
   - **情况 A：$v$ 还没有被匹配过。**
     - 直接连上，$u$ 和 $v$ 结成伴侣。这条路径（$u \to v$）就是一个长度为 1 的增广路（起点 $u$ 是非匹配点，终点 $v$ 也是非匹配点）。
   - **情况 B：$v$ 已经被别人（比如 $w$）匹配了。**
     - 此时不能放弃，我们要施展“腾位子”**策略：看看现在的占用者 $v$ 的原伴侣 $w$，能不能换一个人匹配**？
     - 于是我们递归地去为 $w$ 寻找新伴侣。如果 $w$ 成功找到了新去处，那么 $v$ 就可以空出来让给 $u$。
     - 如果成功了，就相当于找到了一条长一点的增广路，并且顺便完成了“状态取反”（也就是重新分配伴侣）。

时间复杂度为 $O(N_1\times M)$

```c++
vector<int> match;// 记录右顶点v匹配的是哪个左顶点
vector<int> vis;// 当前轮dfs右顶点是否被访问过
vector<vector<int>> g;

bool dfs(int u){
    for(int v:g[u]){
        if(!vis[v]){
            vis[v]=1;

            // v还没有匹配对象，或v的原对象可以腾地方
            if(match[v]==0 || dfs(match[v])){
                match[v]=u;// 匹配成功
                return true;
            }
        }
    }
    return false;
}

void solve(){
    int n,m,e;
    cin>>n>>m>>e;
    g.assign(n+1,vector<int>());
    
    for(int i=0;i<e;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
    }

    match.assign(m+1,0);
    int ans=0;

    for(int i=1;i<=n;i++){
        vis.assign(m+1,0);// 每次换新起点前清空访问标记
        if(dfs(i)){
            ans++;
        }
    }
    cout<<ans<<endl;
}
```



