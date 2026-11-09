---
title: "CF 999E Reachability from the Capital"
date: 2026-10-27
knowledge_id: "solution-cf-999e"
url: "/algorithm/solutions/graph-theory/cf-999e/"
tags:
  - "图论 | Graph Theory"
  - "强连通分量 | SCC"
platform:
  - "Codeforces"
problem_id: "CF999E"
draft: false
---

## CF 999E Reachability from the Capital

[CF 999E Reachability from the Capital](https://codeforces.com/contest/999/problem/E)

### 题意

给定 $n$ 个点、$m$ 条边的有向图和起点 $s$，最少添加多少条有向边，才能从 $s$ 到达所有点？$n,m\le5000$。

### 思路

1. 先用 Tarjan 缩点。同一个强连通分量内互相可达，缩点后得到 DAG。
2. 对每个入度为 $0$、且不包含 $s$ 的分量，至少要补一条进入它的边，否则从 $s$ 无法到达。
3. 从 $s$ 所在分量分别向这些分量连边就够了：DAG 中每个点都能从某个入度为 $0$ 的点走到。因此答案就是这些分量的数量，无须再遍历判断可达性。

**时间复杂度：**$O(n+m)$。

### AC代码

```c++
const int N=1e5+10;

vector<int> g[N];
int dfn[N];     // 时间戳 dfn序
int low[N];     // 按上述规则能到达的最小dfn
stack<int> s;   // 尚未分配SCC编号的节点栈
int t=0;        // 时间戳计数器

int scnt=0;     // 强连通分量计数器
int scc[N];     // scc[u]表示u属于第几个scc


void tarjan(int u){
    dfn[u]=low[u]=++t;
    s.push(u);

    for(auto v:g[u]){
        if(!dfn[v]){// 树边
            tarjan(v);
            low[u]=min(low[u],low[v]);
        }
        else{// 指向已访问节点的边
            if(scc[v]==0){// 还在栈里 没有被分配强连通编号
                low[u]=min(low[u],dfn[v]);
            }
        }
    }
    if(dfn[u]==low[u]){
        scnt++;
        while(true){
            int v=s.top();
            s.pop();

            scc[v]=scnt;

            if(u==v) break;
        }
    }
}

void solve(){
    int n,m,s;
    cin>>n>>m>>s;
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
    }

    for(int i=1;i<=n;i++){
        if(!dfn[i]){
            tarjan(i);
        }
    }

    vector<int> in(scnt+1,0);
    for(int u=1;u<=n;u++){
        for(auto v:g[u]){
            if(scc[u]!=scc[v]){
                in[scc[v]]++;
            }
        }
    }

    int ans=0;
    for(int i=1;i<=scnt;i++){
        if(i!=scc[s] && in[i]==0){
            ans++;
        }
    }
    cout<<ans<<endl;

}
```
