---
title: "CF 891div3 G"
date: 2026-09-14
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "图论 | Graph Theory"
  - "最小生成树 | MST"
  - "并查集 | DSU"
  - "数学 | Math"

difficulty: ""
platform:
  - "Codeforces"
problem_id: "CF1857G"
weight: 10
pinned: false
draft: false
---

## G. Counting Graphs

[Problem - G - Codeforces](https://codeforces.com/contest/1857/problem/G)

### 题意

给定一棵 \(n\) 个节点的树，每条边有边权 \(w\)，再给一个整数 \(S\)。  
问：有多少个图满足：

1. 图中所有边的边权都在 \([1, S]\) 之间；
2. 给定的这棵树是这个图的**唯一最小生成树**。

答案对 \(998244353\) 取模。

### 思路

Kruskal 算法求最小生成树时，会按边权从小到大依次考虑每条边。 
对于给定的树边 \((u, v, w)\)，当 Kruskal 处理到它时，它连接了两个已经形成的连通块。 
为了保证这棵树是唯一最小生成树，**任何连接这两个连通块的非树边，其边权都必须严格大于 \(w\)**。 
否则，如果存在一条边权 \(\le w\) 的非树边连接这两个连通块，Kruskal 可能会先选它，从而破坏唯一性。

因此，对于每条树边，我们都可以在它连接的两个连通块之间添加若干条非树边，只要这些边的边权 \(> w\) 且 \(\le S\)。

1. **将所有树边按边权 \(w\) 从小到大排序。**

2. **用并查集维护连通块，同时记录每个连通块的大小。**

3. **依次处理每条树边 \((u, v, w)\)：**

   - 找到 \(u\) 和 \(v\) 所在的连通块，大小分别为 \(sz_u\) 和 \(sz_v\)。

   - 这两个连通块之间总共有 \(sz_u \times sz_v\) 个点对。

   - 其中已经有一条树边 \((u, v)\)，所以剩下 \(sz_u \times sz_v - 1\) 个点对可以添加非树边。

   - 对于每一个点对，非树边的边权可以取 \(w+1, w+2, \dots, S\)，共有 \(S - w\) 种选择。

   - 此外，还可以选择**不添加**这条非树边，所以每个点对共有 \((S - w) + 1 = S - w + 1\) 种选择。

   - 因此，这条树边对答案的贡献为：
     $$
     (S - w + 1)^{sz_u \times sz_v - 1}
     $$

   - 将贡献乘入总答案，然后合并这两个连通块。

4. **输出总答案对 \(998244353\) 取模的结果。**

### AC代码

```c++
const int MOD=998244353;
struct Edge{
    int u,v,w;
    bool operator<(const Edge& o) const{
        return w<o.w;
    }
};

int qpow(int a,int b){
	...
}
struct DSU{
	...
};

void solve(){
    int n,s;
    cin>>n>>s;

    vector<Edge> e;
    for(int i=0;i<n-1;i++){
        int u,v,w;
        cin>>u>>v>>w;
        e.push_back({u,v,w});
    }

    sort(e.begin(),e.end());

    DSU dsu(n);
    
    int ans=1;
    for(int i=0;i<n-1;i++){
        int u=e[i].u;
        int v=e[i].v;
        int w=e[i].w;
        
        int fu=dsu.find(u);
        int fv=dsu.find(v);
        int cnt=dsu.sz[fu]*dsu.sz[fv]-1;
        int base=s-w+1;
        ans=(ans*qpow(base,cnt))%MOD;
        dsu.merge(u,v);
    }
    cout<<ans<<endl;
}
```



