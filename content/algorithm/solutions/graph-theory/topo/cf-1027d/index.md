---
title: "CF 1027D Mouse Hunt"
date: 2026-09-20
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "图论 | Graph Theory"
  - "拓扑排序 | Topological Sort"
  - "基环树 | Functional Graph"

difficulty: ""
platform:
  - "Codeforces"
problem_id: "1027D"
weight: 10
pinned: false
draft: false
---

## D. Mouse Hunt

[D. Mouse Hunt](https://codeforces.com/contest/1027/problem/D)

### 思路

1. 老鼠如果想要一直跑下去，最终一定会进入某个环中无限循环。因此，只需要在**每个连通分量的环上**放置一个捕鼠夹，就能覆盖该连通分量的所有点。
2. 每个点恰好有一条出边，所以整个图是一个**基环树森林**——每个连通分量有且仅有一个环，环上挂着若干条链。
3. 对于链上的点，老鼠最终会走到环上，因此不需要在链上放陷阱。为了使总代价最小，只需要在每个环上选择代价最小的房间放置陷阱即可。

### 步骤

1. 拓扑排序删除非环节点
4. 遍历所有未被移除且未访问的点 `i`：
   - 从 `i` 出发沿着 `a` 不断走，直到遇到已访问的点。
   - 沿途标记 `vis`，并记录环上最小的代价 `mn`。
   - 将 `mn` 累加到答案 `ans` 中。

**时间复杂度：** `O(n)`

### AC代码

```cpp
void solve(){
    int n;
    cin>>n;
    vector<int> c(n);
    vector<int> a(n);
    for(int i=0;i<n;i++) cin>>c[i];
    for(int i=0;i<n;i++){
        cin>>a[i];
        a[i]--;// .
    }

    vector<vector<int>> g(n);
    vector<int> d(n,0);
    for(int i=0;i<n;i++){
        g[i].push_back(a[i]);
        d[a[i]]++;
    }

    queue<int> q;
    for(int i=0;i<n;i++){
        if(d[i]==0){
            q.push(i);
        }
    }

    vector<int> vis(n,0);
    vector<int> rem(n,0);
    while(!q.empty()){
        int u=q.front();
        q.pop();
        rem[u]=1;

        for(int v:g[u]){
            d[v]--;
            if(d[v]==0){
                q.push(v);
            }
        }
    }

    int ans=0;
    for(int i=0;i<n;i++){
        
        if(!rem[i] && !vis[i]){
            int mn=1e18;
            int u=i;

            while(!vis[u]){
                vis[u]=1;// .
                mn=min(mn,c[u]);
                u=a[u];
            }
            ans += mn;
        }
    }
    cout<<ans<<endl;
}
```

**代码要点：**

- `rem[u] = 1` 表示点 `u` 不在任何环上（被拓扑排序删除），后续找环时直接跳过。
- `vis[u]` 用于标记已经遍历过的环节点，避免同一个环被重复统计。
- 由于每个连通分量只有一个环，从任意未被移除且未访问的点出发，沿着出边一定能走到该环，并在环上绕一圈后回到已访问的点，此时 `mn` 就是环上的最小代价。
- 自环（`a[i] == i`）同样适用：该点入度至少为 1，不会被拓扑排序删除，找环时只有它自己，取 `c[i]` 即可。