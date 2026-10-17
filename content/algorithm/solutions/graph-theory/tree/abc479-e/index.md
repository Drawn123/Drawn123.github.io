---
related_ids:
  - "algorithm-template"
knowledge_id: "solution-abc479-e"
url: "/algorithm/solutions/graph-theory/tree/abc479-e/"
title: "ABC 479E Cut and Add"
date: 2026-10-16
lastmod: 2026-10-17
tags:
  - "树 | Tree"
  - "树上差分 | Tree Difference"

difficulty: ""
platform:
  - "AtCoder"
problem_id: "ABC479E"
weight: 10
pinned: false
draft: false
---

## E - Cut and Add

[E - Cut and Add](https://atcoder.jp/contests/abc479/tasks/abc479_e)

### 题意

给定一棵有 $N$ 个点的树，$N$ 为奇数，边按输入顺序编号为 $1\sim N-1$，每个点的初值均为 $0$。

依次处理每条边 $i$：

1. 暂时删除边 $i$，树被分成两个连通块。
2. 给点数较多的连通块中的每个点都加上 $i$。
3. 恢复这条边，再进行下一次操作。

因为 $N$ 是奇数，两侧点数不会相等。输出所有操作结束后每个点的值。

$3\le N\le2\times10^5-1$，答案可能超过 32 位整数范围。

### 思路

1. 每次操作后都会恢复边，因此各条边的操作互不影响。以 $1$ 为根，设边 $i$ 连接父节点 $u$ 和子节点 $v$，删除后两个连通块的大小分别为 $sz[v]$ 和 $N-sz[v]$。由于 $N$ 是奇数，比较 $sz[v]$ 与 $\lfloor N/2\rfloor$ 就能确定较大的一侧。
2. 如果每次都遍历较大的连通块逐点累加，最坏需要 $O(N^2)$。可以用树上差分：令 `diff[v] += i` 表示给 $v$ 的整棵子树加 $i$，暂时只在子树根处记录，最后统一向下累加。
3. 如果需要修改子树外的所有点，可以转化为「所有点加 $i$，再给这棵子树减 $i$」。用 `all` 记录全体增加的数，执行 `all += i`、`diff[v] -= i` 即可。

**算法步骤：**

1. 建立邻接表，同时保存邻点和边的编号。第一次 DFS 求出每个节点的子树大小 $sz[v]$，回溯时处理对应的父子边。
2. 对于连接父节点与子节点 $v$ 的边 $i$：
   - 若 $sz[v]>N/2$，子树一侧更大，执行 `diff[v] += i`。
   - 否则子树外更大，执行 `all += i`、`diff[v] -= i`。
3. 第二次 DFS，维护根到当前节点路径上的差分标记之和 `sum`。进入节点 $u$ 时令 `sum += diff[u]`，则答案为 `ans[u] = all + sum`。因为一个子树标记恰好会影响这棵子树中的所有节点，所以这样累加就能还原每个节点的最终值。

**时间复杂度：**$O(N)$

### AC代码

```c++
const int N=2e5+10;
int n;
vector<vector<pii>> g;
int sz[N];
int ans[N],diff[N];
int all;

void dfs(int u,int fa){
    sz[u]=1;
    for(auto [v,w]:g[u]){
        if(v==fa) continue;
        dfs(v,u);
        sz[u] += sz[v];
        if(sz[v]>n/2){
            diff[v] += w;
        }
        else{
            all += w;
            diff[v] -= w;
        }
    }
}

void dfs_sum(int u,int fa,int sum){
    sum += diff[u];
    ans[u]=all+sum;
    for(auto [v,w]:g[u]){
        if(v==fa) continue;
        dfs_sum(v,u,sum);
    }
}

void solve(){
    cin>>n;
    g.resize(n+1,vector<pii>());

    for(int i=1;i<n;i++){
        int a,b;
        cin>>a>>b;
        g[a].push_back({b,i});
        g[b].push_back({a,i});
    }
    dfs(1,0);
    dfs_sum(1,0,0);
    
    for(int i=1;i<=n;i++){
        cout<<ans[i]<<" ";
    }
    cout<<endl;
}
```