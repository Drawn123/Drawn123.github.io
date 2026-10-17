---
title: "CF 2275G Copper Squander"
date: 2026-10-17
knowledge_id: "solution-cf-2275g"
url: "/algorithm/solutions/graph-theory/mst/cf-2275g/"
tags:
  - "图论 | Graph Theory"
  - "最小生成树 | MST"
  - "并查集 | DSU"
  - "二分 | Binary Search"
  - "前缀和 | Prefix Sum"
platform:
  - "Codeforces"
problem_id: "CF2275G"
draft: true
---

## G. Copper Squander

[CF 2275G Copper Squander](https://codeforces.com/contest/2275/problem/G)

### 题意

给定一个 $n$ 个点、$m$ 条边的无向简单图，初始可能不连通。第 $i$ 条旧边的价值为 $d_i$。

按以下顺序改造图：

1. 删除任意一些旧边，每删除一条边就获得它的价值。
2. 在任意两个不同的点之间添加新边，第 $1,2,3,\ldots$ 条新边的费用依次为 $x,2x,3x,\ldots$。

最终必须使整个图连通。收益为**卖掉旧边得到的钱减去添加新边的费用**，可以是负数。

给定 $q$ 个独立询问，每次给出不同的 $x$，求最大收益。每个询问都从原图出发。

多组测试，$2\le n\le10^5$，$0\le m\le2\times10^5$，$1\le q\le2\times10^5$，$1\le d_i,x\le5\times10^8$。所有测试的 $n,m,q$ 之和分别不超过 $10^5,2\times10^5,2\times10^5$。

### 思路

先用 Kruskal 去掉不必要的旧边，再看剩下的边卖出重建是否划算。

#### 1. Kruskal 求最小生成森林

如果旧边形成了环，就可以卖掉环上的一条边，连通情况不变，还能多获得一些钱。因此，保留的旧边只需要是一片森林。

为了让卖掉的边总价值最大，就应该让留下来的边尽量便宜。先跑一遍 Kruskal，得到最小生成森林，其他边全部卖掉。

记所有旧边的价值之和为 $s$，森林的价值之和为 $w$，原图的连通块数量为 `cnt`。这样先获得 $s-w$ 的收益，同时至少还要添加 `cnt-1` 条边，才能连接不同的连通块。

接下来，森林里的边也可以卖。**如果要再卖掉 $k$ 条，就卖其中最贵的 $k$ 条。** 因为 Kruskal 选中的前 $t$ 条边，本身就是保留 $t$ 条边时总价值最小的森林；删去最贵的若干条，剩下的正好是这个前缀。

#### 2. 看卖出重建是否划算，二分卖掉的数量

把森林中的边权从大到小排序，存入 `rem[1...len]`，其中 `len=n-cnt`。

森林每删一条边，连通块就多一个，也就需要额外添加一条新边。

考虑是否卖掉第 $k$ 条边：前面已经卖了 $k-1$ 条，此时再卖一条，能获得 `rem[k]`，但需要多修的这条边是第 `cnt-1+k` 条新边，费用为

$$
x(cnt-1+k).
$$

因此，只有满足

$$
rem_k>x(cnt-1+k)
$$

时，这次卖出重建才会增加收益。

随着 $k$ 增大，`rem[k]` 不增，而重建费用不断增加，所以满足条件的位置一定是一段前缀。**二分最后一个满足条件的位置，就是应该额外卖掉的边数 $k$。** 如果收益恰好不变，卖与不卖都可以，代码选择不卖。

二分范围是 $[1,len]$，初始答案设为 `k=0`，表示不额外卖边。`rem[0]` 只是占位，不能拿它检查条件，否则可能出现位置 $0$ 不满足、位置 $1$ 却满足，破坏单调性。

#### 3. 计算答案

预处理降序边权的前缀和 `pre[k]`，表示卖掉最贵的 $k$ 条森林边得到的钱。

最终一共需要添加

$$
p=cnt-1+k
$$

条新边，总费用为

$$
x+2x+\cdots+px=\frac{p(p+1)x}{2}.
$$

所以答案就是

$$
\boxed{s-w+pre_k-\frac{p(p+1)x}{2}}.
$$

其中，$s-w$ 是一开始卖掉非森林边的收入，$pre_k$ 是额外卖掉森林边的收入，最后减去全部新边的费用。

每个询问独立二分并代入公式即可。原图不连通时，也要算上必须添加的 `cnt-1` 条边；收益可能为负数，全程使用 `long long`。

**时间复杂度：**预处理 $O(m\log m+n\log n)$，每个询问 $O(\log n)$。

### AC代码

保留原代码的并查集、Kruskal、降序前缀和和二分结构，用 `p` 简写添加边数。下面给出完整程序，入口读取测试组数。

```cpp
struct DSU{
    vector<int> fa,sz;
    int cnt;

    DSU(int n):fa(n+1),sz(n+1,1),cnt(n){
        for(int i=1;i<=n;i++) fa[i]=i;
    }

    int find(int x){
        if(fa[x]==x) return x;
        return fa[x]=find(fa[x]);
    }

    void merge(int x,int y){
        int fx=find(x),fy=find(y);
        if(fx==fy) return;
        if(sz[fx]<sz[fy]) swap(fx,fy);
        fa[fy]=fx;
        sz[fx] += sz[fy];
        cnt--;
    }
};

struct Edge{
    int u,v,w;
};

void solve(){
    int n,m,q;
    cin>>n>>m>>q;
    vector<Edge> e(m+1);
    int s=0;
    for(int i=1;i<=m;i++){
        cin>>e[i].u>>e[i].v>>e[i].w;
        s += e[i].w;
    }
    sort(e.begin()+1,e.end(),[](Edge x,Edge y){
        return x.w<y.w;
    });

    DSU dsu(n);
    vector<int> rem(1,0);
    int w=0;
    for(int i=1;i<=m;i++){
        int u=e[i].u,v=e[i].v,d=e[i].w;
        if(dsu.find(u)!=dsu.find(v)){
            dsu.merge(u,v);
            rem.push_back(d);
            w += d;
        }
    }
    sort(rem.begin()+1,rem.end(),greater<int>());

    int len=rem.size()-1,cnt=dsu.cnt;
    vector<int> pre(len+1,0);
    for(int i=1;i<=len;i++) pre[i]=pre[i-1]+rem[i];

    while(q--){
        int x;
        cin>>x;
        int l=1,r=len;
        int k=0;
        while(l<=r){
            int mid=l+(r-l)/2;
            if(rem[mid]>x*(cnt-1+mid)){
                k=mid;
                l=mid+1;
            }
            else{
                r=mid-1;
            }
        }

        int p=cnt-1+k;
        int ans=s-w+pre[k]-p*(p+1)*x/2;
        cout<<ans<<" ";
    }
    cout<<endl;
}
```
