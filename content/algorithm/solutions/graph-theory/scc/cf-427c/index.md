---
title: "CF 427C Checkposts"
date: 2026-08-13
knowledge_id: "solution-cf-427c"
url: "/algorithm/solutions/graph-theory/cf-427c/"
tags:
  - "图论 | Graph Theory"
  - "强连通分量 | SCC"
platform:
  - "Codeforces"
problem_id: "CF427C"
draft: false
---

## CF 427C Checkposts

[CF 427C Checkposts](https://codeforces.com/contest/427/problem/C)

### 题意

在有向图的若干顶点设置检查站。一个站只能保护能从它出发再返回的点。每个点有建站费用，求保护所有点的最小总费用，并在费用最小、站数也最少的方案中计数，方案数模 $10^9+7$。$n\le10^5$，$m\le3\times10^5$。

### 思路

互相可达的点正好构成一个强连通分量。每个分量至少建一个站，在其中选费用最小的点即可，费用为 $0$ 时也只选一个以满足站数最少。

Tarjan 弹出一个分量时，统计最小费用 `mnc` 及出现次数 `c`。各分量独立，费用相加，方案数相乘。

**时间复杂度：**$O(n+m)$。

### AC代码

```c++
int n,m;
int cst,cnt=1;
const int N=1e5+10;
const int MOD=1e9+7;
vector<int> g[N];
vector<int> cost;

int dfn[N];
int low[N];
stack<int> s;
int t=0;

int scnt=0;
int scc[N];

void tarjan(int u){
    dfn[u]=low[u]=++t;
    s.push(u);

    for(auto v:g[u]){
        if(!dfn[v]){// 树边
            tarjan(v);
            low[u]=min(low[u],low[v]);
        }
        else{// 回边
            if(scc[v]==0){// 还在栈里 没有被分配强连通编号
                low[u]=min(low[u],dfn[v]);
            }
        }
    }
    if(dfn[u]==low[u]){
        scnt++;

        int mnc=1e18;
        int c=0;
        while(true){
            int v=s.top();
            s.pop();
            scc[v]=scnt;

            if(cost[v]<mnc){
                mnc=cost[v];
                c=1;
            }
            else if(cost[v]==mnc){
                c++;
            }

            if(u==v) break;
        }
        cst += mnc;
        cnt=(cnt*c)%MOD;
    }
}

void solve(){
    cin>>n;
    cost.resize(n+1);
    for(int i=1;i<=n;i++) cin>>cost[i];
    cin>>m;
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

    cout<<cst<<" "<<cnt<<endl;

}
```
