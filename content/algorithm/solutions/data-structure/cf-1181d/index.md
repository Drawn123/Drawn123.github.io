---
title: "CF 1181D Irrigation"
date: 2026-09-02
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "数据结构 | Data Structure"
  - "线段树 | Segment Tree"
  - "树状数组 | BIT"
  - "二分查找 | Binary Search"

difficulty: ""
platform:
  - "Codeforces"
problem_id: "1181D"
weight: 10
pinned: false
draft: false
---

## CF 1181D Irrigation

[Problem - 1181D - Codeforces](https://codeforces.com/problemset/problem/1181/D)

### 题意

有 $n$ 个城市和 $m$ 个创客节（编号为 $1 \sim m$）。

在过去的 $n$ 年里，每年举办了一次创客节，第 $i$ 年在城市 $a_i$ 举办。

从第 $n+1$ 年开始，创客节组委会遵循以下**举办规则**来决定每年的举办城市：

1. **优先选择举办次数最少的城市**。
2. 如果有多个城市的举办次数**并列最少**，则**选择城市编号最小的那个**。

现在给你过去的举办历史，以及 $q$ 个独立的询问。每个询问包含一个整数 $k$ ($k > n$)，请你求出在第 $k$ 年，创客节将在哪座城市举办？

**输入格式**

- 第一行输入三个整数 $n, m, q$ ($1 \le n, q \le 5 \times 10^5$, $1 \le m \le 5 \times 10^5$)，分别表示过去的年份数、城市总数以及询问数量。
- 第二行输入 $n$ 个整数 $a_1, a_2, \dots, a_n$ ($1 \le a_i \le m$)，表示第 $1$ 年到第 $n$ 年举办创客节的城市编号。
- 接下来 $q$ 行，每行输入一个整数 $k_j$ ($n < k_j \le 10^{18}$)，表示第 $j$ 个询问的年份。

**输出格式**

对于每个询问，输出一个整数，表示第 $k$ 年举办创客节的城市编号。

### 思路

#### 整体思路

- **转化**：$k \le 10^{18}$ 无法按年模拟。按城市举办次数从小到大排序，问题转化为**逐步激活城市（0/1 状态）**，问题等价于**柱状图的分层填平**：每次将当前最小频次的城市批量激活，像“水位上升”一样将它们统一抬升至下一个频次门槛，并在区间内通过取模快速消化询问。

- **周期**：若已激活 $c$ 个城市，从阶段起点经过 $\Delta k$ 年，答案为已激活城市中编号第 $\text{rank}$ 小的城市：

  $$\text{rank} = (\Delta k - 1) \bmod c + 1$$

  *( `-1` 再 `+1` 用于平移解决 0-based 模运算对齐到 1-based 排名的问题)*

- **离线**：询问按 $k$ 排序，计算当前批次能填平的年份容量 $\text{mx}$，批量消化区间内的询问，大跨步推进时间轴。

#### 数据结构

- **数组前缀和 + 二分**：单点修改 $\mathcal{O}(m)$，总时间 $\mathcal{O}(m^2)$ TLE。
- **权值线段树**：维护城市激活状态（0/1）。单点修改 $\mathcal{O}(\log m)$，**树上二分** `query_kth` 查找第 $\text{rank}$ 小激活城市 $\mathcal{O}(\log m)$。

整体时间复杂度为 $\mathcal{O}((m + q) \log m + q \log q)$

### AC 代码

```c++
/*  
离线 处理没有访问过的年份以及更新   
可以考虑一步一步把城市加进来激活 
用一个数组01表示是否激活 也就是是否可以举办比赛了
对于中间没有查询过的年份
直接取模 然后用二分和前缀和判断出余数在哪一个位置 就是哪一个城市
但是单点修改后依然要更新前缀和 
所以这里可以考虑线段树

节点的sum 表示多有个城市前面已经被激活了 也就是举办过的数量 
值就是 01 是否激活 

权值线段树 维护数值出现的频率   
*/  

int n,m,q;  
struct Q{
    int k,id;
    bool operator<(const Q& other) const{
        return k<other.k;
    }
};    

struct SegTree {
    struct Node {
        int l,r;               
        int sum;        
        int lazy_add;
    };

    int n;
    vector<int> arr;
    vector<Node> tree;

    SegTree(const vector<int>& a) {
        n=a.size()-1;
        arr=a;
        tree.resize((n+5)<<2); 
        build(1,1,n);
    }

    // 向上更新：由子节点合并出父节点信息
    void push_up(int p) {
        tree[p].sum=tree[ls(p)].sum+tree[rs(p)].sum;
    }

    // 应用“加法”修改
    void apply_add(int p,int val) {
        tree[p].sum+=val*(tree[p].r-tree[p].l+1);
        tree[p].lazy_add+=val;
    }

    // 向下传递标记（优先级：覆盖 > 乘法 > 加法）
    void push_down(int p) {
        if(tree[p].lazy_add!=0) {
            apply_add(ls(p),tree[p].lazy_add);
            apply_add(rs(p),tree[p].lazy_add);
            tree[p].lazy_add=0;
        }
    }

    // 建树
    void build(int p,int l,int r) {
        tree[p]={l,r,0,0};
        if(l==r) {
            tree[p].sum=arr[l];
            return;
        }
        int mid=(l+r)>>1;
        build(ls(p),l,mid);
        build(rs(p),mid+1,r);
        push_up(p);
    }

    // 区间/单点加法修改（单点传ql=qr=pos即可）
    void add(int p,int ql,int qr,int val) {
        if(ql<=tree[p].l && tree[p].r<=qr) {
            apply_add(p,val);
            return;
        }
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(ql<=mid) add(ls(p),ql,qr,val);
        if(qr>mid) add(rs(p),ql,qr,val);
        push_up(p);
    }

    // 代替前缀和和二分 在线段树上找rank小的已经激活的城市编号
    int query_kth(int p,int rank){
        if(tree[p].l==tree[p].r) return tree[p].l;
        int left_sum=tree[ls(p)].sum;
        if(left_sum>=rank){
            return query_kth(ls(p),rank);
        }
        else{
            return query_kth(rs(p),rank-left_sum);
        }
    }

};

void solve(){   
    cin>>n>>m>>q;   
    vector<int> cnt(m+1,0);
    for(int i=1;i<=n;i++){
        int x;
        cin>>x;
        cnt[x]++;
    }
    
    // 城市按照编号从小到大排序
    vector<pii> city;
    for(int i=1;i<=m;i++){
        city.push_back({cnt[i],i});
    }
    sort(city.begin(),city.end());

    // 离线处理询问 
    vector<Q> qu(q);
    for(int i=0;i<q;i++){
        cin>>qu[i].k;
        qu[i].id=i;
    }
    sort(qu.begin(),qu.end());

    vector<int> ini(m+1,0);
    SegTree sg(ini);
 
    vector<int> ans(q);
    int cur=n;
    int cid=0;
    int qid=0;

    // 激活城市 取模计算 树上二分 
    while(cid<m){
        int s=cid;

        // 激活同频次城市
        while(cid<m && city[cid].first==city[s].first){
            sg.add(1,city[cid].second,city[cid].second,1);
            cid++;
        }

        int cnt=cid;// 已经激活的数量
        int nxt;// 下一个频率
        if(cid<m){
            nxt=city[cid].first;
        }
        else{
            nxt=-1;
        }

        int mx;// 算一下这一个阶段最多撑多少年
        if(nxt!=-1){
            mx=(nxt-city[s].first)*cnt;
        }
        else{
            mx=1e18;
        }

        while(qid<q && qu[qid].k<=cur+mx){
            int diff=qu[qid].k-cur;
            int rank=(diff-1)%cnt+1;
            ans[qu[qid].id]=sg.query_kth(1,rank);
            qid++;
        }
        cur += mx;
    }
    for(int i=0;i<q;i++){
        cout<<ans[i]<<endl;
    }
}
```

