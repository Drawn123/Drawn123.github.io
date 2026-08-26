---
title: "最近公共祖先（LCA）"
date: 2026-02-26
lastmod: 2026-02-26
categories:
  - "算法 | Algorithm"
tags:
  - "最近公共祖先 | LCA"
  
weight: 10
pinned: false
draft: false
---

### 倍增法求最近公共祖先

* 把不同深度的节点先移动到同一个深度，让两个点一起往上跳，相遇的点就是最近公共祖先（每一次向上移动的路径都是唯一的，一个点只能有一个父节点）
* 预处理 fa 数组，`fa[u][k]` 表示节点 u 向上跳 $2^k$ 步到达的祖先节点
    * `fa[u][0]` 是 `u` 的父节点，记得初始化
    * `fa[u][1]` 是 `u` 向上跳 2 步的祖先
    * `fa[u][k]` 可以通过递推得到：`fa[u][k]=fa[fa[u][k-1]][k-1]` ，相当于从中间节点向上再跳 $2^{k-1}$ 步 
* 第二维开多大合适？可以取 `⌊log₂(N)⌋ + 1` ，精确的应该是 `⌊log₂(最大深度)⌋ + 1` ，估算一下或者让内置函数 `__lg(N)` 算， 20 就够
* LCA 查询步骤：
    * **调整至同一深度**：先让两个点在同一层，这里也使用倍增向上跳转。
    * 两个点父亲节点不相等，就按照步数从大到小跳转，找到最后一个不相同的祖先
        * 因为要跳到某个点有精确的步数限制，从大到小跳转可以逐步逼近。如果跳过大的步数后两点相等，说明该位置已经达到或超越了最近公共祖先，此时不应该执行这一步大的跳转；反之，若跳之后两点依然不相等，才可以真正跳转。
        * 这类似于多重背包的二进制优化思想，按 2 的幂次从大到小尝试，不够了就用更小的数来凑，从而精确定位。由于这里是先判断“跳之后是否不相等”再跳转的，如果相等点就会停在原来的位置，因此循环结束时得到的恰好是最后一个不相同的位置。

      * 因为上一步求的是最后一个不相同的节点，所以这个点的上一个点才是答案，最后 $fa[u][0]$ 即为 LCA
* 时间复杂度
    * 预处理 fa 数组和深度： $O(n\log n)$ （取大头）
    * 单次查询： $O(\log n)$ 

```c++
const int N=5e5+10;
int n,m,s,ans;
vector<int> g[N];
int dep[N];
int fa[N][21];// .开大一点
// 预处理深度和fa
// fa[u][k]=fa[fa[u][k-1]][k-1]
void dfs(int u,int fat){
    dep[u]=dep[fat]+1;
    fa[u][0]=fat;
    for(int i=1;i<=20;i++){
        fa[u][i]=fa[fa[u][i-1]][i-1];
    }
    for(int v:g[u]){
        if(v==fat) continue;
        dfs(v,u);
    }
}
int lca(int u,int v){
    // 让u是深的
    if(dep[u]<dep[v]) swap(u,v);
    // 提升u的深度
    for(int i=20;i>=0;i--){
        if(dep[fa[u][i]]>=dep[v]){
            u=fa[u][i];
        }
    }
    if(u==v) return u;
    for(int i=20;i>=0;i--){
        if(fa[u][i]!=fa[v][i]){
            u=fa[u][i];
            v=fa[v][i];
        }
    }
    // 父节点即为lca
    return fa[u][0];
}
void solve(){
    cin>>n>>m>>s;
    for(int i=0;i<n-1;i++){
        int a,b;
        cin>>a>>b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    dep[0]=-1;// 根节点的父节点设为0，避免数组越界
    dfs(s,0);
    while(m--){
        int a,b;
        cin>>a>>b;
        cout<<lca(a,b)<<endl;
    }
}
```













