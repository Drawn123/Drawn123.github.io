---
aliases:
  - "/categories/总结--conclusion/"
knowledge_id: "algorithm-template"
url: "/algorithm/template/template/"
title: "ICPC 算法模板"
date: 2025-12-23
lastmod: 2026-11-09
tags:
  - "ICPC"

weight: 1
pinned: true
draft: false
---

[TOC]

> [!NOTE]
>
> **全局代码约定（Global Conventions）**：
>
> 1. **数据类型**：除特殊说明（如显式使用 `__int128`、`double` 或局部位运算变量）外，默认全文代码开头均包含 `#define int long long`。
> 2. **数值上限**：在默认 `long long` 语境下，无穷大 `INF` 统一采用 `1e18`。
> 3. **数组下标**：图论、树形结构及数据结构模板默认采用 **1-based** 下标。
> 4. **输入输出**：默认开启 `ios::sync_with_stdio(false); cin.tie(nullptr);`。



## 数据结构

### 二维前缀和

```c++
for(int i=1;i<=n;i++){
    for(int j=1;j<=m;j++){
        pre[i][j]=pre[i-1][j]+pre[i][j-1]-pre[i-1][j-1]+a[i][j];
    }  
} 
// 查询矩形区域内的前缀和
while(q--){
    int x1,y1,x2,y2;
    cin>>x1>>y1>>x2>>y2;
    cout<<pre[x2][y2]-pre[x2][y1-1]-pre[x1-1][y2]+pre[x1-1][y1-1]<<endl;
}
```

### 二维差分

```c++
// diff（差分矩阵）和 pre（结果前缀和矩阵）
vector<vector<int>> diff(n + 2, vector<int>(m + 2, 0));
vector<vector<int>> pre(n + 2, vector<int>(m + 2, 0)); 
// 矩阵内所有的点 +w
void add(int x1,int y1,int x2,int y2,int w){
    diff[x1][y1] += w;
    diff[x1][y2+1] -= w;
    diff[x2+1][y1] -= w;
    diff[x2+1][y2+1] += w;
}
void get(){
    for(int i = 1; i <= n; i++){
        for(int j = 1; j <= m; j++){
            pre[i][j] = pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1] + diff[i][j];
        }
    }
    // 此时的 pre[i][j] 就是差分修改后、你想要的最终原数组
}
```



### 并查集

```c++
struct DSU{
  vector<int> fa,sz;// 父节点，集合大小
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
    if(fx==fy) return ;
    if(sz[fx]<sz[fy]) swap(fx,fy);
    fa[fy]=fx;
    sz[fx] += sz[fy];
    cnt--;
  }
  bool same(int x,int y){
    return find(x)==find(y);
  }
  // x所在集合的元素个数
  int size(int x){
    return sz[find(x)];// 先找根
  }
};
```

### 扩展域并查集 



### 带权并查集



### 树状数组

- 核心用于维护**可逆的前缀和**（如加减法、异或），**不支持**动态修改下的区间最值（Max / Min）；**不支持**复杂的区间覆盖、乘法等非可逆操作。
- **常见模式、写法与复杂度**

| **使用模式**                  | **维护对象**                          | **修改方式**                                            | **查询方式**                                  | **时间复杂度**                     |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------- | --------------------------------------------- | ---------------------------------- |
| **单点修改 + 区间查询**       | 原数组 $A$                            | `add(x, k)`  位置 $x$ 增加 $k$                          | `range(L, R)`  返回区间 $[L, R]$ 的和         | 修改 $O(\log N)$  查询 $O(\log N)$ |
| **区间修改 + 单点查询**       | 差分数组 $D$  ($D_i = A_i - A_{i-1}$) | `add(L, k)`  `add(R + 1, -k)`  区间 $[L, R]$ 统一加 $k$ | `query(x)`  返回位置 $x$ 的当前真实值 $A_x$   | 修改 $O(\log N)$  查询 $O(\log N)$ |
| **权值树状数组（第 $k$ 小）** | 数值出现频次                          | `add(val, 1)`  插入数值 $val$                           | `kth(k)`  通过内部倍增返回全局第 $k$ 小的数值 | 插入 $O(\log N)$  查询 $O(\log N)$ |

```c++
// 树状数组 (Binary Indexed Tree)
// 时间复杂度：add/query/range/kth 均为 O(log n)
// 提示：下标从 1 开始，范围 [1, n]。kth 传入的 k 代表排名
struct BIT{
    int n;
    vector<int> tr;
    BIT(int n):n(n){
        tr.resize(n+10,0);
    }
    void clear(){
        fill(tr.begin(),tr.end(),0);
    }
    inline int lowbit(int x){
        return x & -x;
    }
    // 单点修改：位置 x 加上 k
    void add(int x,int k){
        if(x<=0) return; 
        while(x<=n){
            tr[x] += k;
            x += lowbit(x);
        }
    }
    // 查询 [1, x] 前缀和
    int query(int x){
        int s=0;
        while(x>0){
            s += tr[x]; 
            x -= lowbit(x);
        }
        return s;
    }
    // 查询 [x, y] 区间和
    int range(int x,int y){
        if(y<x) return 0; 
        x=max(1LL,x); 
        return query(y)-query(x-1);
    }
    // 倍增查询全局第 k 小对应的数值（即下标）
    int kth(int k){
        int s=0;
        int i=1;
        while((i<<1)<=n) i <<= 1; 

        while(i>0){
            if(s+i<=n && tr[s+i]<k){ 
                k -= tr[s+i]; // 先扣除准备跳过的这一块的贡献
                s += i;       // 再移动指针
            }
            i >>= 1;
        }
        return s+1; 
    }
};
```

### 逆序对

逆序对定义为：在序列 $a$ 中，若 $i < j$ 且 $a[i] > a[j]$，则 $(i, j)$ 构成一个逆序对。

#### 归并排序解法

```c++
int find(int l,int r){
  if(l>=r) return 0;
  int ret=0;
  int mid=(l+r)/2;
  ret += find(l,mid);
  ret += find(mid+1,r);
  int i=l,j=mid+1,k=0;
  while(i<=mid && j<=r){
    if(a[i]<=a[j]) temp[k++]=a[i++];
    else{
      temp[k++]=a[j++];
      ret += mid-(i-1);
    }
  }
  while(i<=mid) temp[k++]=a[i++];
  while(j<=r) temp[k++]=a[j++];
  for(int i=l,k=0;i<=r;k++,i++){
    a[i]=temp[k];
  }
  return ret;
}
```

#### 树状数组解法

- **倒序遍历**：从后往前（从 $n$ 到 $1$）依次扫描数组 $a$。
- **查询贡献**：对于当前的 $a[i]$，利用 `query(a[i] - 1)` 查询树状数组中**已加入且严格小于 $a[i]$ 的数字个数**。因为是从后往前扫描，这些已加入的数字下标一定比 $i$ 大，数值又比 $a[i]$ 小，所以刚好构成以 $a[i]$ 为左端点的逆序对。
- **插入状态**：查询完后，用 `add(a[i], 1)` 将 $a[i]$ 的频次加 1，加入树状数组。

*(注：如果数值较大（如 $a[i] \ge 10^9$），需要先离散化；以下代码假设数值在 $1 \sim N$ 范围内，若包含 0 或负数需统一做偏移或离散化。)*

**时间复杂度**：$O(N \log M)$，其中 $N$ 为数组长度，$M$ 为数组元素的最大值（离散化后 $M = N$）

```c++
struct BIT{
    ...
};

void solve(){
    int n=5;
    // 1-based 数组，样例数组为 {5,4,2,6,3}
    vector<int> a={0,5,4,2,6,3};

    // 树状数组的值域边界（假设最大数值为 max_val）
    int max_val=6;
    BIT bit(max_val);

    long long ans=0; // 逆序对总数可能达到 O(N^2)，必须用 long long

    // 倒序遍历数组
    for(int i=n;i>=1;i--){
        // 1. 查询当前树状数组中比 a[i] 严格小的数字个数（区间 [1, a[i]-1] 的和）
        ans += bit.query(a[i]-1);

        // 2. 将当前数值 a[i] 加入树状数组，频次 +1
        bit.add(a[i],1);
    }

    cout << "逆序对数量: " << ans << "\n"; // 共 6 对
}
```



### 线段树

基于分治思想，专用于解决**区间批量修改与区间查询**（如区间加/乘/覆盖、求和/最值/GCD）的数据结构。支持所有满足**结合律**的运算，在 $O(\log N)$ 时间内完成更新与查询。

**常见模式、写法与复杂度**

| **使用模式**           | **维护对象 / 标记**               | **修改方式**                                            | **查询方式**                                  | **时间复杂度**                     | **空间复杂度**           |
| ---------------------- | --------------------------------- | ------------------------------------------------------- | --------------------------------------------- | ---------------------------------- | ------------------------ |
| **基础与复合区间修改** | 区间和 / 最值（加法、乘法、覆盖） | `add(1, L, R, v)`  `mul(1, L, R, v)`  `set(1, L, R, v)` | `sum(1, L, R)`  `mx(1, L, R)` / `mn(1, L, R)` | 修改 $O(\log N)$  查询 $O(\log N)$ | $O(N)$  （开 $4N$ 空间） |

**基础版线段树（SegTree）：支持区间加、区间乘法、区间覆盖（Set）、区间和、区间最大值/最小值。**

```c++
// 计算左子节点与右子节点下标
#define ls(p) (p<<1)
#define rs(p) (p<<1|1)

// 支持单点/区间的加、乘、覆盖与查询
struct SegTree {
    // 节点定义
    struct Node {
        int l,r;                  // 维护的区间左右边界[l,r]
        int sum,mx,mn;           // 区间和、最大值、最小值
        int lazy_add,lazy_mul,lazy_set; // 加法、乘法、覆盖懒标记
        bool has_set;             // 是否存在覆盖标记
        int mxid,mnid;            // 最大值位置、最小值位置
    };

    int n;
    vector<int> arr;
    vector<Node> tree;

    // 构造函数：初始化并建树（a的下标需从1开始）
    SegTree(const vector<int>& a) {
        n=a.size()-1;
        arr=a;
        tree.resize((n+5)<<2); // 开4N空间
        build(1,1,n);
    }

    // 向上更新：由子节点合并出父节点信息
    void push_up(int p) {
        tree[p].sum=tree[ls(p)].sum+tree[rs(p)].sum;

        if(tree[ls(p)].mx>=tree[rs(p)].mx){
            tree[p].mx=tree[ls(p)].mx;
            tree[p].mxid=tree[ls(p)].mxid;
        }
        else{
            tree[p].mx=tree[rs(p)].mx;
            tree[p].mxid=tree[rs(p)].mxid;
        }

        if(tree[ls(p)].mn<=tree[rs(p)].mn){
            tree[p].mn=tree[ls(p)].mn;
            tree[p].mnid=tree[ls(p)].mnid;
        }
        else{
            tree[p].mn=tree[rs(p)].mn;
            tree[p].mnid=tree[rs(p)].mnid;
        }
    }

    // 应用“覆盖”修改
    void apply_set(int p,int val) {
        tree[p].sum=val*(tree[p].r-tree[p].l+1);
        tree[p].mx=tree[p].mn=val;
        tree[p].mxid=tree[p].mnid=tree[p].l; // 覆盖后区间值相同，位置取左端点即可
        tree[p].lazy_set=val;
        tree[p].has_set=true;
        tree[p].lazy_mul=1;     // 清空乘法标记
        tree[p].lazy_add=0;     // 清空加法标记
    }

    // 应用“乘法”修改（val非负情况下）
    void apply_mul(int p,int val) {
        tree[p].sum *= val;

        if(val >= 0) {
            tree[p].mx *= val;
            tree[p].mn *= val;// 若val是负值记得比较后再更新
        } else {
            swap(tree[p].mx,tree[p].mn);
            swap(tree[p].mxid,tree[p].mnid);
            tree[p].mx *= val;
            tree[p].mn *= val;
        }

        if(tree[p].has_set) {
            tree[p].lazy_set *= val;
        }
        else{
            tree[p].lazy_mul *= val;
            tree[p].lazy_add *= val; // 乘法同时影响之前的加法标记
        }
    }

    // 应用“加法”修改
    void apply_add(int p,int val) {
        tree[p].sum+=val*(tree[p].r-tree[p].l+1);
        tree[p].mx+=val;
        tree[p].mn+=val;
        // 加法不改变最大值/最小值位置
        if(tree[p].has_set) {
            tree[p].lazy_set+=val;
        }
        else{
            tree[p].lazy_add+=val;
        }
    }

    // 向下传递标记（优先级：覆盖 > 乘法 > 加法）
    void push_down(int p) {
        if(tree[p].has_set) {
            apply_set(ls(p),tree[p].lazy_set);
            apply_set(rs(p),tree[p].lazy_set);
            tree[p].has_set=false;
        }
        if(tree[p].lazy_mul!=1) {
            apply_mul(ls(p),tree[p].lazy_mul);
            apply_mul(rs(p),tree[p].lazy_mul);
            tree[p].lazy_mul=1;
        }
        if(tree[p].lazy_add!=0) {
            apply_add(ls(p),tree[p].lazy_add);
            apply_add(rs(p),tree[p].lazy_add);
            tree[p].lazy_add=0;
        }
    }

    // 建树
    void build(int p,int l,int r) {
        tree[p]={l,r,0,0,0,0,1,0,false};
        if(l==r) {
            tree[p].sum=tree[p].mx=tree[p].mn=arr[l];
            tree[p].mxid=tree[p].mnid=l;
            return;
        }
        int mid=(l+r)>>1;
        build(ls(p),l,mid);
        build(rs(p),mid+1,r);
        push_up(p);
    }

    // 区间/单点覆盖修改（单点传ql=qr=pos即可）
    void set(int p,int ql,int qr,int val) {
        if(ql<=tree[p].l && tree[p].r<=qr) {
            apply_set(p,val);
            return;
        }
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(ql<=mid) set(ls(p),ql,qr,val);
        if(qr>mid) set(rs(p),ql,qr,val);
        push_up(p);
    }

    // 区间/单点乘法修改（单点传ql=qr=pos即可）
    void mul(int p,int ql,int qr,int val) {
        if(ql<=tree[p].l && tree[p].r<=qr) {
            apply_mul(p,val);
            return;
        }
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(ql<=mid) mul(ls(p),ql,qr,val);
        if(qr>mid) mul(rs(p),ql,qr,val);
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

    // 区间/单点求和查询（单点传ql=qr=pos即可）
    int sum(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return tree[p].sum;
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        int res=0;
        if(ql<=mid) res+=sum(ls(p),ql,qr);
        if(qr>mid) res+=sum(rs(p),ql,qr);
        return res;
    }

    // 区间/单点最大值查询
    // 返回 {最大值, 最大值位置}
    pii mx(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return {tree[p].mx,tree[p].mxid};
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(qr<=mid) return mx(ls(p),ql,qr);
        if(ql>mid) return mx(rs(p),ql,qr);
        pii L=mx(ls(p),ql,qr);
        pii R=mx(rs(p),ql,qr);
        if(L.first>=R.first) return L;
        return R;
    }

    // 区间/单点最小值查询
    // 返回 {最小值, 最小值位置}
    pii mn(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return {tree[p].mn,tree[p].mnid};
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(qr<=mid) return mn(ls(p),ql,qr);
        if(ql>mid) return mn(rs(p),ql,qr);
        pii L=mn(ls(p),ql,qr);
        pii R=mn(rs(p),ql,qr);
        if(L.first<=R.first) return L;
        return R;
    }

    /*
    如果不需要求最大值和最小值的位置，可以这样简化：

    1. Node 里删掉 mxid、mnid；
    2. push_up 里直接：
       tree[p].mx=max(tree[ls(p)].mx,tree[rs(p)].mx);
       tree[p].mn=min(tree[ls(p)].mn,tree[rs(p)].mn);
    3. apply_set 里不用设置 mxid、mnid；
    4. apply_mul 里如果只考虑非负数，直接：
       tree[p].mx *= val;
       tree[p].mn *= val;
       如果考虑负数，则先 swap(mx,mn) 再乘；
    5. 查询直接返回 int：

    int mx(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return tree[p].mx;
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(qr<=mid) return mx(ls(p),ql,qr);
        if(ql>mid) return mx(rs(p),ql,qr);
        return max(mx(ls(p),ql,qr),mx(rs(p),ql,qr));
    }

    int mn(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return tree[p].mn;
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(qr<=mid) return mn(ls(p),ql,qr);
        if(ql>mid) return mn(rs(p),ql,qr);
        return min(mn(ls(p),ql,qr),mn(rs(p),ql,qr));
    }
    */
};

void solve() {
    // 初始数据[1..5]: {1,2,3,4,5}
    vector<int> a={0,1,2,3,4,5}; 
    SegTree seg(a);

    seg.add(1,1,3,2); // 区间加：[3,4,5,4,5]
    seg.add(1,2,2,1); // 单点加：[3,5,5,4,5]
    seg.mul(1,2,4,3); // 区间乘：[3,15,15,12,5]
    seg.set(1,4,5,10);// 区间覆盖：[3,15,15,10,10]

    // 查询[2,5]即{15,15,10,10}
    cout<<"Sum: "<<seg.sum(1,2,5)<<"\n"; // 50
    cout<<"Max: "<<seg.mx(1,2,5).first<<"\n";  // 15
    cout<<"Min: "<<seg.mn(1,2,5).first<<"\n";  // 10
}
```



### ST表

**ST表核心定位**：静态数组 + 频繁查询 + 满足可重叠性的区间信息。

- **静态数据**：建表后不可修改（无单点/区间修改）。
- **极速查询**：预处理 $O(N \log N)$，查询 $O(1)$。
- **可重叠性**：信息须满足重叠计算不影响结果，如 $\max$、$\min$、$\gcd$、按位与（&）、按位或（|）。

**DP 预处理（倍增）**

- 定义 $f[i][j]$ 为从 $i$ 开始长度为 $2^j$ 的区间信息 $[i, i+2^j-1]$。

- 拆分为左右两段长为 $2^{j-1}$ 的子区间：左段 $f[i][j-1]$，右段 $f[i+2^{j-1}][j-1]$。

- 转移方程：

  $$f[i][j] = \max\left(f[i][j-1], \; f[i + 2^{j-1}][j-1]\right)$$

**O(1) 区间查询**

- 查询 $[l, r]$ 时，长度 $\text{len} = r - l + 1$，取 $k = \lfloor \log_2(\text{len}) \rfloor$。

- 用两段长为 $2^k$ 的区间前后覆盖：左段 $f[l][k]$，右段 $f[r-2^k+1][k]$。

- 拼合答案：

  $$\text{Ans} = \max\left(f[l][k], \; f[r-2^k+1][k]\right)$$

**位运算查询说明**

- **`query_and(l, r)`**：求区间元素按位与（&），用于判断指定二进制位是否全为 1。
- **`query_or(l, r)`**：求区间元素按位或（|），用于合并统计区间二进制位状态。

```c++
struct ST{
    int n;
    vector<vector<int>>stmax,stmin,stgcd,stand,stor;

    ST(int n,const vector<int>&a):n(n){
        if(n<=0)return;
        int logn=__lg(n)+1;

        stmax.assign(n+1,vector<int>(logn));
        stmin.assign(n+1,vector<int>(logn));
        stgcd.assign(n+1,vector<int>(logn));
        stand.assign(n+1,vector<int>(logn));
        stor.assign(n+1,vector<int>(logn));

        for(int i=1;i<=n;i++){
            stmax[i][0]=a[i];
            stmin[i][0]=a[i];
            stgcd[i][0]=a[i];
            stand[i][0]=a[i];
            stor[i][0]=a[i];
        }

        for(int p=1;p<logn;p++){
            for(int i=1;i+(1<<p)-1<=n;i++){
                int next_idx=i+(1<<(p-1));
                stmax[i][p]=max(stmax[i][p-1],stmax[next_idx][p-1]);
                stmin[i][p]=min(stmin[i][p-1],stmin[next_idx][p-1]);
                stgcd[i][p]=std::gcd(stgcd[i][p-1],stgcd[next_idx][p-1]);
                stand[i][p]=stand[i][p-1]&stand[next_idx][p-1];
                stor[i][p]=stor[i][p-1]|stor[next_idx][p-1];
            }
        }
    }

    int query_max(int l,int r)const{
        int k=__lg(r-l+1);
        return max(stmax[l][k],stmax[r-(1<<k)+1][k]);
    }

    int query_min(int l,int r)const{
        int k=__lg(r-l+1);
        return min(stmin[l][k],stmin[r-(1<<k)+1][k]);
    }

    int query_gcd(int l,int r)const{
        int k=__lg(r-l+1);
        return std::gcd(stgcd[l][k],stgcd[r-(1<<k)+1][k]);
    }

    int query_and(int l,int r)const{
        int k=__lg(r-l+1);
        return stand[l][k]&stand[r-(1<<k)+1][k];
    }

    int query_or(int l,int r)const{
        int k=__lg(r-l+1);
        return stor[l][k]|stor[r-(1<<k)+1][k];
    }
};

void solve(){
    int n=6;
    // 1-based 数组
    vector<int>a={0,12,6,18,9,21,15};

    ST st(n,a);// nlogn

    // 查询闭区间 [2,5]
    int l=2,r=5;

    cout<<"[2, 5] 区间最大值: "<<st.query_max(l,r)<<"\n"; 
    cout<<"[2, 5] 区间最小值: "<<st.query_min(l,r)<<"\n"; 
    cout<<"[2, 5] 区间 GCD  : "<<st.query_gcd(l,r)<<"\n"; 
    cout<<"[2, 5] 区间按位与: "<<st.query_and(l,r)<<"\n"; 
    cout<<"[2, 5] 区间按位或: "<<st.query_or(l,r)<<"\n"; 
}
```



### 离散化

```c++
struct Trans{
    vector<int> F;
    void init(const vector<int>& A){
        // 可以适当调一下下标从0开始还是从1开始
        for(int i=0;i<A.size();i++) F.push_back(A[i]);
        sort(F.begin(),F.end());
        F.erase(unique(F.begin(),F.end()),F.end());
    }
    // 找到val对应离散化之后的值
    // ！！！注意val这个数必须参加过才能正确查询
    int get(int val){
        int x=lower_bound(F.begin(),F.end(),val)-F.begin()+1;
        return x;
    }
    // 找到第一个>=val的离散化后的值（也就是离散化之后的排名）
    int findhigh(int val){
        int x=lower_bound(F.begin(),F.end(),val)-F.begin()+1;
        return x;
    }
    // 找到最后一个<=val的离散化后的值
    int findlow(int val){
        int x=upper_bound(F.begin(),F.end(),val)-F.begin();
        return x;
    }
    // 把数组A里面的数都替换成离散化之后的结果
    void change(vector<int>& A,int n){
        for(int i=1;i<=n;i++) A[i]=get(A[i]);
    }
    // 取原排名为rank的原数组中的值
    int origin(int rank){
        return F[rank-1];
    }
};
```



### 单调栈

1. 左进右出，大值递增栈，小值递减栈
2. 根据题目要求判断是否加等号 

**STL版单调栈**

```c++
// 1. 右边第一个比当前元素大 (正向遍历 + 出栈记录)
// 原理：栈内维护单调递减。出现更大元素时，栈内比它小的元素依次出栈，它们的右边更大者就是 a[i]
vector<int> nextGreaterElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    stack<int> st;
    for(int i = 1; i <= n; i++){
        while(!st.empty() && a[st.top()] < a[i]){
            res[st.top()] = a[i]; // 栈顶遇到了右边第一个比它大的 a[i]
            st.pop();
        }
        st.push(i);
    }
    return res;
}

// 2. 右边第一个比当前元素小 (正向遍历 + 出栈记录)
// 原理：栈内维护单调递增。出现更小元素时，栈内比它大的元素依次出栈，它们的右边更小者就是 a[i]
vector<int> nextSmallerElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    stack<int> st;
    for(int i = 1; i <= n; i++){
        while(!st.empty() && a[st.top()] > a[i]){
            res[st.top()] = a[i]; // 栈顶遇到了右边第一个比它小的 a[i]
            st.pop();
        }
        st.push(i);
    }
    return res;
}

// 3. 左边第一个比当前元素大 (正向遍历 + 入栈前记录)
// 原理：栈内维护单调递减。弹出所有 <= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它大的
vector<int> prevGreaterElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    stack<int> st;
    for(int i = 1; i <= n; i++){
        while(!st.empty() && a[st.top()] <= a[i]){
            st.pop(); // 阻挡答案的无用较小元素全部剔除
        }
        if(!st.empty()) res[i] = a[st.top()]; // 剩下的栈顶即为左边第一个更大者
        st.push(i);
    }
    return res;
}

// 4. 左边第一个比当前元素小 (正向遍历 + 入栈前记录)
// 原理：栈内维护单调递增。弹出所有 >= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它小的
vector<int> prevSmallerElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    stack<int> st;
    for(int i = 1; i <= n; i++){
        while(!st.empty() && a[st.top()] >= a[i]){
            st.pop(); // 阻挡答案的无用较大元素全部剔除
        }
        if(!st.empty()) res[i] = a[st.top()]; // 剩下的栈顶即为左边第一个更小者
        st.push(i);
    }
    return res;
}
```

**数组模拟单调栈**

```c++
// 1. 右边第一个比当前元素严格大 (vector 模拟数组版本)
// 原理：栈内维护单调递减。出现更大元素时，栈内比它小的元素依次出栈，它们的右边更大者就是 a[i]
vector<int> nextGreaterElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    vector<int> stk(n + 1); // vector 模拟栈
    int top = 0; // top == 0 表示栈空
    
    for(int i = 1; i <= n; i++){
        while(top > 0 && a[stk[top]] < a[i]){
            res[stk[top]] = a[i]; // 栈顶遇到了右边第一个比它大的 a[i]
            top--; // 出栈
        }
        stk[++top] = i; // 进栈
    }
    return res;
}

// 2. 右边第一个比当前元素严格小 (vector 模拟数组版本)
// 原理：栈内维护单调递增。出现更小元素时，栈内比它大的元素依次出栈，它们的右边更小者就是 a[i]
vector<int> nextSmallerElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    vector<int> stk(n + 1);
    int top = 0;
    
    for(int i = 1; i <= n; i++){
        while(top > 0 && a[stk[top]] > a[i]){
            res[stk[top]] = a[i]; // 栈顶遇到了右边第一个比它小的 a[i]
            top--; // 出栈
        }
        stk[++top] = i; // 进栈
    }
    return res;
}

// 3. 左边第一个比当前元素严格大 (vector 模拟数组版本)
// 原理：栈内维护单调递减。弹出所有 <= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它大的
vector<int> prevGreaterElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    vector<int> stk(n + 1);
    int top = 0;
    
    for(int i = 1; i <= n; i++){
        while(top > 0 && a[stk[top]] <= a[i]){
            top--; // 剔除无用的较小或相等元素
        }
        if(top > 0) res[i] = a[stk[top]]; // 剩下的栈顶即为左边第一个严格更大者
        stk[++top] = i; // 进栈
    }
    return res;
}

// 4. 左边第一个比当前元素严格小 (vector 模拟数组版本)
// 原理：栈内维护单调递增。弹出所有 >= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它小的
vector<int> prevSmallerElement(const vector<int>& a, int n){
    vector<int> res(n + 1, -1);
    vector<int> stk(n + 1);
    int top = 0;
    
    for(int i = 1; i <= n; i++){
        while(top > 0 && a[stk[top]] >= a[i]){
            top--; // 剔除无用的较大或相等元素
        }
        if(top > 0) res[i] = a[stk[top]]; // 剩下的栈顶即为左边第一个严格更小者
        stk[++top] = i; // 进栈
    }
    return res;
}
```



### 单调队列

**STL版单调队列**

```c++
// 单调队列：滑动窗口最小值 (STL 版本)
// 原理：维护双端队列，队首始终是窗口内最小值，队内元素单调递增
vector<int> slidingWindowMin(const vector<int>& a, int n, int k){
    vector<int> mn;
    deque<int> q; // 存放下标

    for(int i = 1; i <= n; i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标
        while(!q.empty() && q.front() < i - k + 1){
            q.pop_front();
        }
        // 移除队尾所有大于 a[i] 的元素，保持单调递增
        while(!q.empty() && a[q.back()] > a[i]){
            q.pop_back();
        }
        q.push_back(i);
        // 窗口形成后（i >= k），队首元素对应的值就是最小值
        if(i >= k) mn.push_back(a[q.front()]);
    }
    return mn;
}

// 单调队列：滑动窗口最大值 (STL 版本)
// 原理：维护双端队列，队首始终是窗口内最大值，队内元素单调递减
vector<int> slidingWindowMax(const vector<int>& a, int n, int k){
    vector<int> mx;
    deque<int> q; // 存放下标

    for(int i = 1; i <= n; i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标
        while(!q.empty() && q.front() < i - k + 1){
            q.pop_front();
        }
        // 移除队尾所有小于 a[i] 的元素，保持单调递减
        while(!q.empty() && a[q.back()] < a[i]){
            q.pop_back();
        }
        q.push_back(i);
        // 窗口形成后（i >= k），队首元素对应的值就是最大值
        if(i >= k) mx.push_back(a[q.front()]);
    }
    return mx;
}
```

**数组模拟单调队列**

```c++
// 单调队列：滑动窗口最小值 (vector 模拟数组版本)
// 原理：用 head 和 tail 指针维护 vector 队列，队首始终是窗口内最小值
vector<int> slidingWindowMin(const vector<int>& a, int n, int k){
    vector<int> mn;
    vector<int> q(n + 1); // vector 模拟队列空间
    int head = 1, tail = 0; // 初始化：head > tail 表示队空

    for(int i = 1; i <= n; i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标 (队头出队)
        while(head <= tail && q[head] < i - k + 1){
            head++;
        }
        // 移除队尾所有大于 a[i] 的元素，保持单调递增 (队尾出队)
        while(head <= tail && a[q[tail]] > a[i]){
            tail--;
        }
        q[++tail] = i; // 进队尾
        // 窗口形成后（i >= k），队首元素对应的值就是最小值
        if(i >= k) mn.push_back(a[q[head]]);
    }
    return mn;
}

// 单调队列：滑动窗口最大值 (vector 模拟数组版本)
// 原理：用 head 和 tail 指针维护 vector 队列，队首始终是窗口内最大值
vector<int> slidingWindowMax(const vector<int>& a, int n, int k){
    vector<int> mx;
    vector<int> q(n + 1);
    int head = 1, tail = 0; // 初始化：head > tail 表示队空

    for(int i = 1; i <= n; i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标 (队头出队)
        while(head <= tail && q[head] < i - k + 1){
            head++;
        }
        // 移除队尾所有小于 a[i] 的元素，保持单调递减 (队尾出队)
        while(head <= tail && a[q[tail]] < a[i]){
            tail--;
        }
        q[++tail] = i; // 进队尾
        // 窗口形成后（i >= k），队首元素对应的值就是最大值
        if(i >= k) mx.push_back(a[q[head]]);
    }
    return mx;
}
```



### 树的前中后序遍历

**栈模拟树的前后序遍历**

* 前序遍历（根->孩子）

  **思路：**栈弹出时处理节点，然后把孩子**逆序**压入栈（保证最左边的孩子先被弹出处理）

```c++
vector<int> preorder;
vector<int> st={root};
while (!st.empty()) {
    int u = st.back();
    st.pop_back();
    preorder.push_back(u); // 处理根
    
    // 逆序压入孩子（保证正序弹出）
    for (int i=ch[u].size()-1;i>=0;--i) {
        st.push_back(ch[u][i]);
    }
}
```

* 后序遍历（孩子->根）

  **思路：**利用“根 -> 右 -> 左”的遍历，最后把结果**反转**，就变成了“左 -> 右 -> 根”（后序）

```c++
vector<int> order;
vector<int> st={root};
while (!st.empty()) {
    int u=st.back();
    st.pop_back();
    order.push_back(u); // 先记录根
    
    // 这里正序压入孩子即可（出栈顺序无所谓，反正最后要反转）
    for (int v:ch[u]){
        st.push_back(v); 
    }
}
reverse(order.begin(), order.end());
```

* 二叉树的中序遍历（左根右）

  **思路：** 必须用一个指针 `cur` 一路向左走到底，模拟递归的压栈。

```c++
vector<int> inorder;
stack<Node*> st;
Node* cur = root;

while (cur != nullptr || !st.empty()) {
    // 1. 一路向左，把所有左孩子压栈
    while (cur != nullptr) {
        st.push(cur);
        cur = cur->left;
    }
    
    // 2. 弹出最左节点，处理它
    cur = st.top(); st.pop();
    inorder.push_back(cur->val); // 处理根
    
    // 3. 转向右子树（下次循环会处理右子树的左链）
    cur = cur->right;
}
```



## 图论

### 链式前向星建图

```c++
const int N=1e5+10;// 最大节点数
const int M=2e5+10;// 最大边数（无向图开两倍）
int head[N];
int cnt;

struct edge{
    int to;
    int w;
    int next;
}e[M];

void add(int u,int v,int w){
    e[cnt].to=v;
    e[cnt].w=w;
    e[cnt].next=head[u];
    head[u]=cnt++;
}

void init(int n){
    memset(head,-1,sizeof head);
    cnt=0;
}

void print_neighbors(int u){
    cout<<"节点"<<u<<"的邻居："<<endl;;
    for(int i=head[u];i!=-1;i=e[i].next){
        int v=e[i].to;
        int w=e[i].w;
        cout<<v<<"（权："<<w<<"）"<<endl;;
    }
    cout<<endl;
}

void bfs_graph(int start,int n){
    vector<int> vis(n+1,0);
    queue<int> q;

    q.push(start);
    vis[start]=1;

    cout<<"BFS遍历图的顺序："<<endl;
    while(!q.empty()){
        int u=q.front();
        q.pop();
        cout<<u<<" ";
        for(int i=head[u];i!=-1;i=e[i].next){
            int v=e[i].to;
            if(!vis[v]){
                vis[v]=1;
                q.push(v);
            }
        }
    }
    cout<<endl;
}

void solve(){
    int n=5;
    init(n);

    add(1,2,10);
    add(1,3,5);
    add(2,4,3);
    add(3,4,8);
    add(4,5,2);

    print_neighbors(1);
    bfs_graph(1,n);
}
```



### 最短路

| **算法类型**        | **适用场景**   | **边权限制**           | **时间复杂度**             | **核心思想**                           |
| ------------------- | -------------- | ---------------------- | -------------------------- | -------------------------------------- |
| **朴素 Dijkstra**   | 稠密图（单源） | 非负边权               | $O(n^2)$                   | 贪心：每次找未确定节点的最小值         |
| **堆优化 Dijkstra** | 稀疏图（单源） | 非负边权               | $O(m \log n)$              | 贪心 + 优先队列维护极小值              |
| **Bellman-Ford**    | 通用（单源）   | 可含负权边，可检测负环 | $O(mn)$                    | 动态规划：对所有边松弛 $n-1$ 轮        |
| **SPFA (BF优化)**   | 稀疏图（单源） | 可含负权边，可检测负环 | 平均 $O(km)$，最坏 $O(mn)$ | 队列优化：只将距离变小的节点入队松弛   |
| **Floyd-Warshall**  | 全图（多源）   | 可含负权边，不能有负环 | $O(n^3)$                   | 动态规划：依次以每个点作为中间节点松弛 |



#### Dijkstra

**单源最短路**

**不能处理负权边和负环**

- \(n\le 1000\)、稠密图 → 朴素 Dijkstra \(O(n^2)\)
- n 上万、稀疏图 → **堆优化 Dijkstra \(O(m\log n)\)**

```c++
// 朴素版 稠密图
struct edge{int v,w;};
vector<edge> e[N];
int d[N],vis[N];
void dijkstra(int s){
  	// 初始化距离
  	for(int i=0;i<=n;i++) d[i]=inf;
  	d[s]=0;
  	// 枚举次数（n-1次找到剩下n-1个点的最小距离）
  	for(int i=1;i<n;i++){
    	int u=0;
    	// 枚举点（未确定最小距离的点中找距离最小的）
    	for(int j=1;j<=n;j++){
      		if(!vis[j]&&d[j]<d[u]) u=j;
    	}
        if(u==0 || d[u]==inf) break;// 剩余点不连通
   		vis[u]=1;// 已经确定当前点的最小距离
    	// 枚举邻边
    	for(auto ed:e[u]){
      		int v=ed.v,w=ed.w;
      		if(d[v]>d[u]+w) d[v]=d[u]+w;
    	}
  	}
}

// 堆优化版 稀疏图
// Dijkstra 堆优化：单源最短路，适用于非负权图
// 原理：贪心 + 优先队列，每次取出距离最小的节点进行松弛
struct edge{int v,w;};
vector<edge> e[N];
int d[N],vis[N];
#define pii pair<int,int>  // 距离 节点编号
priority_queue<pii,vector<pii>,greater<pii>> q;

void dijkstra(int s){
    for(int i=0;i<=n;i++) d[i]=inf;
 	d[s]=0;
  	q.push({0,s});
    
  	while(!q.empty()){
    	auto t=q.top();q.pop();
    	int u=t.second;
      
    	if(vis[u]) continue;
    	vis[u]=1;
      
    	for(auto ed:e[u]){
      		int v=ed.v,w=ed.w;
      		if(d[v]>d[u]+w){
        		d[v]=d[u]+w;
        		q.push({d[v],v});
      		}
    	}
  	}
}
```

* 稠密图边数 m 接近 $n^2$
* 稀疏图边数 m 远小于 $n^2$

如果要输出路径，可以记录前驱点，也就是父亲节点，然后进行路径回溯 

```c++
#define pii pair<int,int>

int n,m;
struct p{
    int v,w;
};
vector<vector<p>> g;

void solve(){
    cin>>n>>m;
    g.resize(n+1,vector<p> ());
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        if(v==u) continue;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }

    priority_queue<pii,vector<pii>,greater<pii>> q;
    vector<int> fa(n+1,-1);
    vector<int> dis(n+1,1e18);
    vector<int> vis(n+1,0);
    dis[1]=0;
    q.push({0,1});

    while(!q.empty()){
        auto [d,u]=q.top();
        q.pop();
        
        if(vis[u]) continue;
        vis[u]=1;// .

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                fa[v]=u;
                q.push({dis[v],v});
            }
        }
        
    }
    if(dis[n]==1e18){
        cout<<-1<<endl;
        return ;
    }
    
    // 路径回溯
    vector<int> path;
    for(int v=n;v!=-1;v=fa[v]){
        path.push_back(v);
    }
    reverse(path.begin(),path.end());
    for(auto x:path){
        cout<<x<<" ";
    }
    cout<<endl;
}
```



**如果要从点1到n的路径：**

```c++
int n,m;
struct p{
    int v,w;
};
vector<vector<p>> g;

void solve(){
    cin>>n>>m;
    g.resize(n+1,vector<p> ());
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        if(v==u) continue;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }

    priority_queue<pii,vector<pii>,greater<pii>> q;
    vector<int> fa(n+1,-1),dis(n+1,1e18),vis(n+1,0);
    dis[1]=0;
    q.push({0,1});

    while(!q.empty()){
        auto [d,u]=q.top();
        q.pop();
        
        if(vis[u]) continue;
        vis[u]=1;// .

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                fa[v]=u;
                q.push({dis[v],v});
            }
        }
        
    }
    if(dis[n]==1e18){
        cout<<-1<<endl;
        return ;
    }
    vector<int> path;
    for(int v=n;v!=-1;v=fa[v]){
        path.push_back(v);
    }
    reverse(path.begin(),path.end());
    for(auto x:path){
        cout<<x<<" ";
    }
    cout<<endl;
}
```



#### 分层图最短路

当最短路还受“最多使用 $k$ 次免费机会”等限制时，把点拆成 $(u,p)$：当前在 $u$，已使用 $p$ 次机会。

以 [P4568 飞行路线](https://www.luogu.com.cn/problem/P4568) 为例，城市编号为 $0\sim n-1$，航线双向。普通经过 $(u,v,w)$ 时，同层转移并加 $w$；使用免费机会时，转移到下一层，费用不变。无需显式建出所有层，扩展状态时枚举原图边即可。

终点取所有层的最小值；Dijkstra 第一次弹出任意终点状态时也可以直接返回。要求转移费用非负，时间复杂度 $O((k+1)(n+m)\log((k+1)n))$。

```c++
int n,m,k;
int s,t;
struct p{
    int v,w;
};
vector<vector<p>> g;
struct S{
    int d,u,p;// 距离 节点编号 使用的免费次数
    bool operator>(const S& other)const{
        return d>other.d;
    };
};

void solve(){
    cin>>n>>m>>k;
    cin>>s>>t;
    g.assign(n+1,vector<p>());
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }
    vector dis(n+1,vector<int>(k+1,1e18));
    priority_queue<S,vector<S>,greater<S>> q;

    dis[s][0]=0;
    q.push({0,s,0});

    while(!q.empty()){
        auto [d,u,p]=q.top();
        q.pop();

        if(d>dis[u][p]) continue;// vis

        if(u==t){
            cout<<d<<endl;
            return ;
        }

        for(auto [v,w]:g[u]){
            // 不使用免费机会 同层
            if(dis[v][p]>dis[u][p]+w){
                dis[v][p]=dis[u][p]+w;
                q.push({dis[v][p],v,p});
            }
            // 使用免费机会 下一层
            if(p+1<=k && dis[v][p+1]>dis[u][p]){
                dis[v][p+1]=dis[u][p];
                q.push({dis[v][p+1],v,p+1});
            }
        }
    }

    int ans=1e18;
    for(int i=0;i<=k;i++){
        ans=min(ans,dis[t][i]);
    }
    cout<<ans<<endl;
}
```

#### 非空最短环

[ABC 191E Come Back Quickly](https://atcoder.jp/contests/abc191/tasks/abc191_e)：对有向正权图中的每个点，求从它出发、至少经过一条边再返回的最短距离，不存在输出 $-1$。

以 $i$ 为起点时，不设置 `dis[i]=0`，改为先用所有出边初始化距离，再跑 Dijkstra。这样 `dis[i]` 必须实际走过边才会被更新，自环和重边也都能处理。

时间复杂度 $O(n(n+m)\log(n+m))$。

```c++
void solve(){
    int n,m;
    cin>>n>>m;
    vector<vector<pii>> g(n+1,vector<pii>());
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
    }
    for(int i=1;i<=n;i++){
        vector<int> dis(n+1,1e18),vis(n+1,0);

        priority_queue<pii,vector<pii>,greater<pii>> q;

        // 先走一条出边，排除长度为0的空路径
        for(auto [v,w]:g[i]){
            if(dis[v]>w){
                dis[v]=w;
                q.push({dis[v],v});
            }
        }

        while(!q.empty()){
            auto [d,u]=q.top();
            q.pop();
            if(vis[u]) continue;
            vis[u]=1;
            for(auto [v,w]:g[u]){
                if(dis[v]>dis[u]+w){
                    dis[v]=dis[u]+w;
                    q.push({dis[v],v});
                }
            }
        }
        if(dis[i]==1e18){
            cout<<-1<<endl;
        }
        else cout<<dis[i]<<endl;
    }
}
```

#### Floyd

**多源最短路**

**不能处理负环（最短路得存在），可以处理负权边和检测负环**

只要最后存在任意一个节点 i 使得 `dis[i][i]<0 ` 就说明图中存在负权环

加上 `if(d[i][k]<1e18 && d[k][j]<1e18)` 判断：防止负权边错误更新两个不可达的点

时间复杂度为 $O(n^3)$ 

```c++
// 初始化
for(int i=1;i<=n;i++){
    for(int j=1;j<=n;j++){
        d[i][j]=1e18;
        if(i==j) d[i][j]=0;
    }
}
// 读入邻接矩阵

// floyed
for(int k=1;k<=n;k++){// 先枚举每一个中间点
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            if(d[i][k]<1e18 && d[k][j]<1e18){
           		d[i][j]=min(d[i][j],d[i][k]+d[k][j]);     
            }
        }
    }
}
```

##### Floyd 传递闭包

二元关系具有传递性，通过传递性判断更多元素之间的关系被称为传递闭包

**$i$ 能到达 $j$**，当且仅当：

1. $i$ **原本就能直接到达** $j$；
2. **或者**： $i$ **能够到达中转点** $k$，**并且** 中转点 $k$ **能够到达** $j$。

```c++
int d[N][N];
int n,m;
void solve(){
    cin>>n>>m;
    for(int i=1;i<=n;i++) d[i][i]=1;
    for(int i=1;i<=m;i++){
        int x,y;
        cin>>x>>y;
        d[x][y]=d[y][x]=1;
    }
    for(int k=1;k<=n;k++){
        for(int i=1;i<=n;i++){
            if(!d[i][k]) continue;
            for(int j=1;j<=n;j++){
                d[i][j] |= d[i][k]&d[k][j];
            }
        }
    }
}
```

例如，可以用 floyd 传递闭包解决**拓扑排序**问题，给出了每个人的后代信息，要求输出一个序列，使得每个人的后辈都比那个人后列出。

- **错误做法**：将传递闭包的偏序关系直接传给 `sort` 比较，并在两元素无亲缘关系时写了 `return a < b`。
- **正确做法**：跑完传递闭包后**统计每个点能到达的节点总数（包含自己）**，长辈的可达点数必然大于后辈，按**可达点数从大到小排序**即可。

**错误原因**

原逻辑认为“无长辈/后辈关系时谁前谁后都可以”，于是用 `return a < b` 强行指定顺序。但这破坏了 `sort` 必须满足的**传递性**（Strict Weak Ordering）。

例如：若 $A$ 与 $B$ 无关系（判定 $A < B$），$B$ 与 $C$ 无关系（判定 $B < C$），`sort` 会推导 $A < C$；但若图中恰好存在 $C \to A$ 的长辈关系，代码又会根据 `d[C][A] == 1` 判定 $C < A$（即 $A > C$）。这构成了 $A < B < C < A$ 的逻辑矛盾，导致 `sort` 内部逻辑错误。

```c++
const int N=110;
int d[N][N];
int cnt[N];
int n;

void solve(){
    memset(d,0,sizeof(d));
    memset(cnt,0,sizeof(cnt));

    cin>>n;
    for(int i=1;i<=n;i++){
        d[i][i]=1;
        int c;
        while(cin>>c && c!=0){
            d[i][c]=1;
        }
    }

    for(int k=1;k<=n;k++){
        for(int i=1;i<=n;i++){
            if(!d[i][k]) continue;
            for(int j=1;j<=n;j++){
                d[i][j] |= d[i][k]&d[k][j];
            }
        }
    }

    vector<int> p(n);
    for(int i=1;i<=n;i++){
        p[i-1]=i;
        for(int j=1;j<=n;j++){
            if(d[i][j]) cnt[i]++;
        }
    }

    sort(p.begin(),p.end(),[&](int a,int b){
        if(cnt[a]!=cnt[b]) return cnt[a]>cnt[b];
        return a<b;
    });

    for(int i=0;i<n;i++){
        cout<<p[i]<<" ";
    }
    cout<<endl;
}
```

#### Bellman-Ford

**单源最短路**

**不能在负环图上求最短路，可以检测负环**

每一轮对每一条边进行松弛操作，当某一轮不再有松弛操作出现时停止，这里轮次 k 指的是最多经过 k 条边两点之间的最短距离，显然最多只有 n-1 轮（没有负环情况下）

**推广：可以判断某个点出发能不能到达负环**

没有负环，松弛操作轮数必然 <=n - 1 ，如果发现从点  A 出发，第 n 轮时松弛操作依然存在，说明从 A 出发能够到达负环

时间复杂度为 $O(m\times n)$

```c++
struct Edge{
    int u,v,w;
};
vector<Edge> g;

void bellman_ford(int n,int s){
    vector<int> d(n+1,1e18);
    d[s]=0;

    for(int i=1;i<n;i++){
        bool flag=0;
        for(auto e:g){
            int u=e.u,v=e.v,w=e.w;
            if(d[u]!=1e18 && d[v]>d[u]+w){
                d[v]=d[u]+w;
                flag=1;
            } 
        }
        if(!flag) break;
    }
    // 第n轮判断负环
    for(auto e:g){
        if(d[e.u]!=1e18 && d[e.v]>d[e.u]+e.w){
            cout<<"NO"<<endl;// 存在负环
            return ;
        }
    }
    for(int i=1;i<=n;i++){
        if(d[i]==1e18) cout<<-1<<" ";
        else cout<<d[i]<<" ";
    }
    cout<<endl;
}
```



#### SPFA

**Bellman-Ford算法的优化版：**只有上一轮松驰过的节点、距离变小的节点才有可能引起下一轮松弛操作，用一个队列维护刚刚哪些节点的距离变小了即可

用cnt数组检测从一个起点能不能走到负环，cnt数组表示路径上的边数

**时间复杂度为 $O(nm)$** 

**如果想判断整张图有没有负环，需要设置虚拟源点，**到其他所有点的边权为 0 ，判定条件改为 `cnt[v]>=n+1`

```c++
struct Edge{
    int v,w;
};
vector<vector<Edge>> g;

void spfa(int n,int s){
    vector<int> d(n+1,1e18);
    vector<int> vis(n+1,0);// 记录是否在队列里面 
    vector<int> cnt(n+1,0);// 记录路径上的边数
    queue<int> q;

    d[s]=0,vis[s]=1;
    q.push(s);

    while(!q.empty()){
        int u=q.front();q.pop();
        vis[u]=0;

        for(auto e:g[u]){
            int v=e.v,w=e.w;
            if(d[v]>d[u]+w){
                d[v]=d[u]+w;
                // 只要发生松弛，计数就增加（无论 v 是否在队列中）
                cnt[v]=cnt[u]+1; // 记录从起点到 v 的最短路包含的边数
                if (cnt[v]>=n){   // 存在负环
                    cout<<"NO"<<endl;
                    return;
                }

                // 只有不在队列时才入队
                if(!vis[v]){
                    q.push(v);
                    vis[v]=1;
                }
            }
        }
    }
    for(int i=1;i<=n;i++){
        if(d[i]==1e18) cout<<-1<<" ";
        else cout<<d[i]<<" ";
    }
    cout<<endl;
}
```



#### 差分约束

将每个约束 $x_v-x_u\le w$ 改写为 $x_v\le x_u+w$，连有向边 $u\to v$，边权为 $w$。

新增虚拟源点 $0$，向所有变量连权为 $0$ 的边，跑 SPFA。若无负环，最短距离满足每条边对应的不等式，就是一组可行解；若有负环，沿环累加会得到 $0<0$，无解。

例题：[P5960 差分约束](https://www.luogu.com.cn/problem/P5960)。图中共有 $n+1$ 个点，`cnt[v]` 记录松弛路径的边数，达到 $n+1$ 即判负环。最坏时间复杂度 $O(n(n+m))$。

```c++
int n,m;
struct p{
    int v,w;
};
vector<vector<p>> g;

void solve(){
    cin>>n>>m;
    g.assign(n+1,vector<p>());

    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>v>>u>>w;
        g[u].push_back({v,w});
    }

    for(int i=1;i<=n;i++){
        g[0].push_back({i,0});
    }

    vector<int> d(n+1,1e18),vis(n+1,0),cnt(n+1,0);
    queue<int> q;
    d[0]=0;
    vis[0]=1;
    q.push(0);

    while(!q.empty()){
        int u=q.front();
        q.pop();
        vis[u]=0;

        for(auto [v,w]:g[u]){
            if(d[v]>d[u]+w){
                d[v]=d[u]+w;

                cnt[v]=cnt[u]+1;
                if(cnt[v]>=n+1){
                    cout<<"NO"<<endl;
                    return ;
                }
                if(!vis[v]){
                    q.push(v);
                    vis[v]=1;
                }
            }
        }
    }

    for(int i=1;i<=n;i++){
        cout<<d[i]<<' ';
    }
    cout<<endl;

}
```

### 拓扑排序

```c++
const int N=2e5+10;
int n,m;
vector<int> g[N];
int in[N];
vector<int> topo;
// Kahn 拓扑排序
// 时间复杂度：O(n+m)
// 若图中存在环，返回 false
bool topo_sort(){
    queue<int> q;
    for(int i=1;i<=n;i++){
        if(in[i]==0){
            q.push(i);
        }
    }
    while(!q.empty()){
        int u=q.front();
        q.pop();
        topo.push_back(u);
        for(int v:g[u]){
            if(--in[v]==0){
                q.push(v);
            }
        }
    }
    return (int)topo.size()==n;
}
void solve(){
    cin>>n>>m;

    for(int i=1;i<=m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        in[v]++;
    }
    if(!topo_sort()){
        cout<<-1<<endl;
        return;
    }
    for(int x:topo){
        cout<<x<<" ";
    }
    cout<<endl;
}
```


#### DAG 路径计数

例题：[P4017 最大食物链计数](https://www.luogu.com.cn/problem/P4017)。边由被捕食者指向捕食者，统计从入度为 $0$ 的生产者到出度为 $0$ 的消费者的路径条数，模 $80112002$。这里的“最大”指链无法继续延伸，并非只统计长度最长的链。

`dp[u]` 表示从任意源点到 $u$ 的路径数。所有源点初始化为 $1$，按拓扑序将 `dp[u]` 累加给后继，最后汇总所有汇点。图必须无环，时间复杂度 $O(n+m)$。

```c++
const int MOD=80112002;
const int N=5e5+10;
int dp[N],in[N],out[N];
int n,m;
vector<int> g[N];

// 拓扑排序 动态规划
// dp[i]表示从任意生产者到i的食物链数量

void solve(){
    cin>>n>>m;
    for(int i=1;i<=m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        in[v]++;
        out[u]++;
    }

    queue<int> q;
    for(int i=1;i<=n;i++){
        if(in[i]==0){
            q.push(i);
            dp[i]=1;
        }
    }

    while(!q.empty()){
        int u=q.front();
        q.pop();
        for(auto v:g[u]){
            dp[v]=(dp[v]+dp[u])%MOD;
            in[v]--;
            if(in[v]==0){
                q.push(v);
            }
        }
    }

    int ans=0;
    for(int i=1;i<=n;i++){
        if(out[i]==0){
            ans=(ans+dp[i])%MOD;
        }
    }
    cout<<ans<<endl;
}
```

### Tarjan 强连通分量与缩点

#### 基本概念

* **强连通：** 有向图中，两个点 $u,v$ 互相可达，即 $u$ 能走到 $v$，$v$ 也能走到 $u$。
* **强连通分量（SCC）：** 极大的强连通子图，内部任意两点都互相可达，再加入其他点就不满足这个条件。每个点恰好属于一个 SCC，单个点也可以构成 SCC。
* **缩点：** 把每个 SCC 合并为一个点，只保留不同 SCC 之间的有向边。缩点后一定是有向无环图（DAG）：如果多个 SCC 之间形成环，它们就能互相到达，应当属于同一个 SCC。因此可以在缩点后的图上做拓扑排序、DAG DP 等。

#### 算法原理

Tarjan 在一次 DFS 中维护时间戳和一个栈：

* `dfn[u]`：第一次访问 $u$ 的时间戳，`dfn[u]==0` 表示还没访问。
* `low[u]`：从 $u$ 出发，沿 DFS 树边向下，再至多经过一条指向栈内节点的边，能到达的最小 `dfn`，也包括 $u$ 自己。
* `s`：保存已访问但还没有分配 SCC 编号的节点。DFS 返回时不一定出栈，所以它与函数递归调用栈不同。

遍历边 $u\to v$ 时，如果 $v$ 没访问过，先递归，再用 `low[v]` 更新 `low[u]`；如果 $v$ 已访问且仍在栈内，用 `dfn[v]` 更新 `low[u]`。已经分配 SCC 编号的点不参与更新。

当 `dfn[u]==low[u]` 时，说明 $u$ 是当前 SCC 在 DFS 中最先访问的点，这部分节点无法再连回更早的栈内节点。从栈顶一直弹到 $u$，弹出的节点恰好组成一个 SCC。

`scc[u]` 是 $u$ 所属的 SCC 编号，编号范围为 `1~scnt`；`nodes[i]` 和 `sz[i]` 分别记录第 $i$ 个 SCC 的节点及数量。遍历原图的边，将跨 SCC 的边加入 `dag`，同时统计缩点后的入度 `in`。

**时间复杂度：** Tarjan 和缩点均为 $O(n+m)$。

#### 代码

```c++
const int N=1e5+10;
const int MOD=1e9+7;

vector<int> g[N];
int dfn[N];     // 时间戳 dfn序
int low[N];     // 按上述规则能到达的最小dfn
stack<int> s;   // 尚未分配SCC编号的节点栈
int t=0;        // 时间戳计数器

int scnt=0;     // 强连通分量计数器
int scc[N];     // scc[u]表示u属于第几个scc

vector<int> nodes[N];// 记录每个scc包含的节点
int sz[N];      // 每个scc的节点数量

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
            sz[scnt]++;
            nodes[scnt].push_back(v);

            if(u==v) break;
        }
    }
}

vector<int> dag[N];
int in[N];

void build_dag(int n){
    for(int u=1;u<=n;u++){
        for(int v:g[u]){
            if(scc[u]!=scc[v]){
                dag[scc[u]].push_back(scc[v]);
                in[scc[v]]++;
            }
        }
    }
}

void solve(){
    int n,m;
    cin>>n>>m;
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
    }
    // 从每个未访问的点出发 遍历整张有向图
    for(int i=1;i<=n;i++){
        if(!dfn[i]){
            tarjan(i);
        }
    }
    // 缩点生成有向无环图
    build_dag(n);

}
```

* `build_dag` 保留重边，`in` 也按重边条数统计；拓扑排序时遍历 `dag` 的每条边并减少对应入度即可。如果题目要求统计不同后继的数量，需要另行去重。
* 在缩点后的图上做拓扑排序时，遍历 `1~scnt`，邻接表使用 `dag`。
* 以上是单组数据写法。多测时清空上一组用到的 `g、dag、nodes`，将 `dfn、low、scc、sz、in` 置零，重置 `t、scnt` 并清空栈。
* 递归深度最坏为 $O(n)$，长链图需要留意运行环境的栈空间。


### 01BFS

可以解决边权只有0和1的单源最短路问题

用双端队列维护队列的单调性：

* **边权为 $0$ 的边**：节点 $v$ 的距离与当前节点 $u$ **完全相同**，说明它的优先级最高！我们直接将 $v$ 插到**队头**（`push_front`）。

* **边权为 $1$ 的边**：节点 $v$ 的距离等于 $dist[u] + 1$，按照普通 BFS 规则，插到**队尾**（`push_back`）。

时间复杂度为 $O(M+N)$

```c++
struct Edge{
    int v,w;
};
int n,m;
vector<vector<Edge>> g;
vector<int> d;

void bfs01(int s){
    d.assign(n+1,1e18);
    deque<int> dq;
    
    d[s]=0;
    dq.push_back(s);
    
    while(!dq.empty()){
        int u=dq.front();
        dq.pop_front();
        
        for(auto &e:g[u]){
            int v=e.v;
            int w=e.w;
            if(d[v]>d[u]+w){
                d[v]=d[u]+w;
                
                if(w==0){
                    dq.push_front(v);
                }
                else{
                    dq.push_back(v);
                }
            }
        }
    }
}
void solve(){
    cin>>n>>m;
    g.assign(n+1,{});
    
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }
    int s=1;
    bfs01(s);
    for(int i=1;i<=n;i++){
        if(d[i]==1e18) cout<<-1<<" ";
        else cout<<d[i]<<" ";
    }
    cout<<endl;
}
```



#### 二分答案与 01BFS

例题：[P1948 Telephone Lines S](https://www.luogu.com.cn/problem/P1948)。从 $1$ 到 $n$ 选一条路径，最多 $k$ 条边免费，其余边只按最大边权计费，求最小费用，不连通输出 $-1$。

二分费用上限 `lim`。原边权大于 `lim` 时记为 $1$，否则记为 $0$；此时最短路表示需要免费处理的边数，不超过 $k$ 就可行。上限越大越容易满足，可以用 01BFS 检查，零权边放队首，一权边放队尾。

先检查最大原边权，排除不连通；答案从 $0$ 开始二分，路径不超过 $k$ 条边时费用可以为 $0$。时间复杂度 $O((n+m)\log(W+1))$。

```c++
int n,p,k;
vector<vector<pii>> g;

bool check(int lim){
    vector<int> dis(n+1,1e18);
    deque<pii> q;
    dis[1]=0;
    q.push_front({0,1});
    while(!q.empty()){
        auto [d,u]=q.front();
        q.pop_front();
        if(d>dis[u]) continue;
        for(auto [v,w]:g[u]){
            int cost=0;
            if(w>lim) cost=1;
            if(dis[v]>d+cost){
                dis[v]=d+cost;
                if(cost==0) q.push_front({dis[v],v});
                else q.push_back({dis[v],v});
            }
        }
    }
    return dis[n]<=k;
}

void solve(){
    cin>>n>>p>>k;
    g.assign(n+1,vector<pii>());
    int mx=0;
    for(int i=0;i<p;i++){
        int u,v,w;
        cin>>u>>v>>w;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
        mx=max(mx,w);
    }
    if(!check(mx)){
        cout<<-1<<endl;
        return ;
    }
    int l=0,r=mx;
    while(l<r){
        int mid=(l+r)/2;
        if(check(mid)) r=mid;
        else l=mid+1;
    }
    cout<<l<<endl;
}
```

### 最小生成树

#### Kruskal

```c++
const int N=2e5+10;
int n,m;
int fa[N];
// Kruskal 最小生成树
// 时间复杂度：O(mlogm)
// 若图不连通，返回 -1
struct edge{
    int u,v,w;
    bool operator<(const edge& other) const{
        return w<other.w;
    }
}e[N];
int find(int x){
    if(fa[x]==x){
        return x;
    }
    return fa[x]=find(fa[x]);
}
void merge(int x,int y){
    int fx=find(x);
    int fy=find(y);
    if(fx==fy){
        return;
    }
    // Kruskal 一般不用按秩合并
    fa[fx]=fy;
}
int kruskal(){
    sort(e+1,e+m+1);
    for(int i=1;i<=n;i++) fa[i]=i;
    int ans=0,cnt=0;
    for(int i=1;i<=m;i++){
        int u=e[i].u,v=e[i].v,w=e[i].w;
        if(find(u)!=find(v)){
            merge(u,v);
            ans+=w;
            cnt++;
            if(cnt==n-1) break;
        }
    }
    if(cnt!=n-1) return -1;
    return ans;
}
void solve(){
    cin>>n>>m;
    for(int i=1;i<=m;i++){
        cin>>e[i].u>>e[i].v>>e[i].w;
    }
    cout<<kruskal()<<endl;
}
```



### 树的直径 

**法一：树形 dp 求树的直径**

以任意节点为根（通常设 1 号为根）。对于节点 $u$：

- 定义 $d_1[u]$ 为以 $u$ 为根的子树中，从 $u$ 出发向下的**最长路径**。
- 定义 $d_2[u]$ 为以 $u$ 为根的子树中，从 $u$ 出发向下的**次长路径**（不能与最长路径走同一条分支）。
- 经过节点 $u$ 的最长简单路径长度为 $d_1[u] + d_2[u]$。
- **遍历整棵树，所有节点的 $(d_1[u] + d_2[u])$ 中的最大值即为树的直径。**

```c++
struct Edge{
    int v,w;
};
int n;
vector<vector<Edge>> g;
int ans;
int dfs(int u,int fa){
    int d1=0;
    int d2=0;
    
    for(auto &e:g[u]){
        int v=e.v;
        if(v==fa) continue;
        int d=dfs(v,u)+e.w;
        if(d>d1){
            d2=d1;
            d1=d;
        }
        else if(d>d2){
            d2=d;
        }
    }
    ans=max(ans,d1+d2);
    return d1;
}
int get_d(){
    ans=0;
    dfs(1,0);
    return ans;
}
```

**法二：两次 DFS 求树的直径**

只适用于**边权非负**的情况，如果有负边权，需要考虑树形 dp，但是两次 DFS 更有利于还原路径 

1. 从任意节点出发找到最远节点 $A$（$A$ 即为直径的一个端点）
2. 从 $A$ 出发再次搜索找到最远节点 $B$，$A$ 到 $B$ 的路径即为树的直径

时间复杂度为 $O(N)$

```c++
struct Edge{
    int v,w;
};
int n;
vector<vector<Edge>> g;
int p1;// 最远点
int mxd;// 最长距离（树的直径）
void dfs(int u,int fa,int d){
    if(d>mxd){
        mxd=d;
        p1=u;// 刷新最远点
    }
    for(auto &e:g[u]){
        if(e.v!=fa){
            dfs(e.v,u,d+e.w);
        }
    }
}

void get_d(){
    // 第一次dfs：从1号点出发，找到最远点A
    mxd=-1;
    dfs(1,0,0);
    int A=p1;
    // 第二次dfs：从A出发，找到最远点B
    mxd=-1;
    dfs(A,0,0);
    return mxd;
}
```



### 树的重心

在树中删去节点 $u$ 后，剩余部分会形成若干个连通块（即子树）。使**最大连通块的节点数最小**的那个节点 $u$，就称为这棵树的**重心**。

**核心性质**

1. **子树限制**：以重心为根时，它的任何一棵子树（包含它的父节点方向的那棵“上子树”）的节点数都不超过 $\lfloor \frac{N}{2} \rfloor$。
2. **重心个数**：一棵树最多有 2 个重心；若有 2 个重心，它们必然相邻。
3. **距离和最小**：树上所有节点到重心的距离之和是最小的（即树的最佳“集散中心”）。

求重心（一次dfs）

1. 设 $sz[u]$ 表示以节点 $u$ 为根的子树的大小。

2. 在递归回溯时，算出的最大子树节点数即为：

   $$\text{max\_part} = \max\left( \max_{v \in \text{child}(u)} sz[v], \ N - sz[u] \right)$$

   其中 $N - sz[u]$ 就是 $u$ **向上**连接的那部分连通块的大小。

3. 比较所有节点的 $\text{max\_part}$，值最小的节点即为重心。

```c++
int n;
vector<vector<int>> g;
vector<int> sz;
vector<int> center;// 存储重心（最多两个）
int mn;// 全局最小的最大连通块大小
void dfs(int u,int fa){
    sz[u]=1;
    int mxp=0;// 删掉u后 产生的最大连通块大小
    for(int v:g[u]){
        if(v==fa) continue;
        dfs(v,u);
        sz[u] += sz[v];
        mxp=max(mxp,sz[v]);
    }
    // 上方子树
    mxp=max(mxp,n-sz[u]);
    if(mxp<mn){
        mn=mxp;
        center.clear();
        center.push_back(u);
    }
    else if(mxp==mn){
        center.push_back(u);
    }
}
void get_center(){
    sz.assign(n+1,0);
    center.clear();
    mn=1e18;
    dfs(1,0);
}
```



### LCA

时间复杂度为 $O((M+N)\log N)$

```c++
const int N=5e5+10;
int n,m,s,ans;
vector<int> g[N];
int dep[N];
int fa[N][21];// 开大一点
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



### 树上差分

基于自底向上子树求和

- **点差分**（修改路径 $u \to v$ 上的节点）：

  $$\text{diff}[u] += x, \quad \text{diff}[v] += x, \quad \text{diff}[\text{LCA}] -= x, \quad \text{diff}[\text{fa}_{\text{LCA}}] -= x$$

  - *逻辑*：$u, v$ 向上传播；$\text{LCA}$ 抵消一次多加；$\text{fa}_{\text{LCA}}$ 截断向上传播。

- **边差分**（修改路径 $u \to v$ 上的边，点 $u$ 代表连向父节点的边）：

  $$\text{diff}[u] += x, \quad \text{diff}[v] += x, \quad \text{diff}[\text{LCA}] -= 2x$$

  - *逻辑*：$u, v$ 向上传播；$\text{LCA}$ 处完全扣除 $2x$，不影响 $\text{LCA}$ 到其父节点的边。

时间复杂度为 $O((M+N)\log N)$

| **概念**     | **点差分中的 diff[u]**              | **边差分中的 diff[u]**                                       |
| ------------ | ----------------------------------- | ------------------------------------------------------------ |
| **代表对象** | 代表 **节点 $u$ 本身** 的点权修改量 | 代表 **节点 $u$ 与其父节点 `fa[u]` 之间的那条边** 的边权修改量 |
| **最终答案** | `val[u]` 就是节点 $u$ 的最终点权    | `val[u]` 就是边 $(u, \text{fa}[u])$ 的最终边权               |

```c++
int n,m;
vector<vector<int>> g;
vector<int> dep;
vector<vector<int>> fa;// 倍增数组 fa[u][i]
vector<int> diff;
vector<int> val;// 每个节点最终权值

// dfs预处理深度与倍增lca数组
void dfs_lca(int u,int pa,int d){
	dep[u]=d;
    fa[u][0]=pa;
    for(int i=1;i<20;i++){
        fa[u][i]=fa[fa[u][i-1]][i-1];
    }
    for(int v:g[u]){
        if(v!=pa){
            dfs_lca(v,u,d+1);
        }
    }
}
// 倍增求lca
int get_lca(int u,int v){
    if(dep[u]<dep[v]) swap(u,v);
    for(int i=19;i>=0;i--){
        if(dep[u]-(1<<i)>=dep[v]){
            u=fa[u][i];
        }
    }
    if(u==v) return u;
    for(int i=19;i>=0;i--){
        if(fa[u][i]!=fa[v][i]){
            u=fa[u][i];
            v=fa[v][i];
        }
    }
    return fa[u][0];
}

// 点差分修改
void add_node(int u,int v,int x){
    int lca=get_lca(u,v);
    int p=fa[lca][0];
    
    diff[u] += x;
    diff[v] += x;
    diff[lca] -= x;
    if(p!=0) diff[p] -= x;
}
// 边差分修改
void add_edge(int u,int v,int x){
    int lca=get_lca(u,v);
    diff[u] += x;
    diff[v] += x;
    diff[lca] -= 2*x;
}

// 自底向上汇总差分值（回溯）
void dfs_sum(int u,int p){
    val[u]=diff[u];
    for(int v:g[u]){
        if(v!=p){
            dfs_sum(v,u);
            val[u] += val[v];
        }
    }
}
void solve(){
    cin>>n>>m;
    
    g.resize(n+1);
    dep.resize(n+1);
    fa.assign(n+1,vector<int>(20,0));
    diff.assign(n+1,0);
    val.assign(n+1,0);
    
    for(int i=0;i<n-1;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    
    dfs_lca(1,0,1);
    
    while(m--){
        int u,v,x;
        cin>>u>>v>>x;
        add_node(u,v,x);
    }
    
    dfs_sum(1,0);
    for(int i=1;i<=n;i++){
        cout<<val[i]<<" ";
    }
    // 在需要输出边权时，只需遍历2~n的 val[i] 即可（val[i]对应点i与其父节点连接的那条边
    cout<<endl;
}
```



### 二分图

#### 二分图染色法判定

* 二分图不存在奇环
* 非连通图是二分图，当且仅当每一个连通分量都是二分图

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
    }g
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



#### 寻找奇环

无向图是二分图，当且仅当不存在奇环。DFS 交替染色，遇到同色的返祖边 $u\to v$ 时，树上 $u$ 到祖先 $v$ 的路径长为偶数，加上这条边就得到奇环。

记录 DFS 父节点 `fa`，从 $u$ 沿父链回到 $v$ 即可还原。发现后立即返回，不继续搜索。适用于简单无向图，时间复杂度 $O(n+m)$。

例题：[ABC 472E Odd Cycle](https://atcoder.jp/contests/abc472/tasks/abc472_e)，找不到输出 $-1$，否则依次输出奇环顶点，不重复输出起点。

```c++
int n,m;
vector<vector<int>> g;

vector<int> color;// 0表示未染色 1和-1表示两种不同颜色
vector<int> fa;
int st,en;

bool dfs(int u,int c,int p){
    color[u]=c;
    for(int v:g[u]){
        if(v==p) continue;
        if(color[v]==0){
            fa[v]=u;
            if(dfs(v,-c,u)) return true;// 发现奇环
        }
        else if(color[v]==c){
            st=v;
            en=u;
            return true;
        }
    }
    return false;
}

void solve(){
    cin>>n>>m;
    g.assign(n+1,vector<int>());
    color.assign(n+1,0);
    fa.resize(n+1);
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    // 二分图不存在奇环 如果不是二分图就是存在奇环吧

    bool flag=false;
    for(int i=1;i<=n;i++){
        if(color[i]==0){// 处理非连通图
            if(dfs(i,1,0)){
                flag=true;
                break;
            }
        }
    }
    if(!flag){
        cout<<-1<<endl;
        return ;
    }
    vector<int> path;
    path.push_back(st);
    for(int v=en;v!=st;v=fa[v]){
        path.push_back(v);
    }
    cout<<path.size()<<endl;
    for(int x:path){
        cout<<x<<" ";
    }
    cout<<endl;
}
```

#### 匈牙利算法

**匹配：** “任意两条边都没有公共端点”的边的集合被称为图的一组匹配

**最大匹配：** 二分图中，包含边数最多的一组匹配被称为二分图的最大匹配

**增广路：** 对于任意组匹配 $S$（$S$ 是一个边集合），属于 $S$ 的边称为**匹配边**，不属于 $S$ 的边称为**非匹配边**。匹配边的端点称为**匹配点**，其他节点称为**非匹配点**。如果在二分图中存在一条连接**两个非匹配点**的路径 $\text{path}$，使得**非匹配边**与**匹配边**在 $\text{path}$ 上**交替出现**，那么称 $\text{path}$ 是匹配 $S$ 的**增广路**（也称交错路）。

**增广路性质：**

1. 长度 len 是奇数
2. 路径上第 1、3、5…… len 奇数条边是非匹配边，第 2、4、6…… len-1 偶数条边是匹配边。



**二分图的一组匹配 $S$ 是最大匹配，当且仅当该图中不存在 $S$ 的增广路。**

**匈牙利算法**

可以采用深搜实现：

对于二分图的每一轮查找，我们的目标是：**尝试给左边的一个未匹配点 $u$ 找一个配偶。**

1. 从左边的未匹配点 $u$ 出发，随便找一条连出去的边，到达右边的一个邻居节点 $v$。
2. 这里会出现两种情况：
   - **情况 A：$v$ 还没有被匹配过。**
     - 直接连上，$u$ 和 $v$ 结成伴侣。这条路径（$u \to v$）就是一个长度为 1 的增广路（起点 $u$ 是非匹配点，终点 $v$ 也是非匹配点）。
   - **情况 B：$v$ 已经被别人（比如 $w$）匹配了。**
     - 此时不能放弃，我们要施展“腾位子”**策略：看看现在的占用者 $v$ 的原伴侣 $w$，能不能去匹配**别人？
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



## 字符串

### 字典树

#### 字符串字典树

字典树（Trie）是一种利用字符串的**公共前缀**来减少无谓比较的数据结构，可以在 $O(L)$ 时间复杂度内（$L$ 为字符串长度）高效完成字符串的存储、检索与删除。

**核心变量**

- `tree[u][c]`：状态转移表，表示节点 $u$ 沿着字符 $c$（映射为 $0 \sim 25$）到达的子节点编号。
- `cnt[u]`：经过节点 $u$ 的字符串数量（用于**前缀频次**统计）。
- `endcnt[u]`：恰好以节点 $u$ 结尾的字符串数量（用于**完全匹配频次**统计）。
- `have[u]`：标记是否有单词在节点 $u$ 结尾。
- `max_idx`：记录历史使用过的最大节点编号（保证多组数据 $O(\text{max\_idx})$ 极速安全清空）。

**函数功能**

- `init()`：**重置字典树**。清空历史用到的所有节点信息，在多组测试数据（$T > 1$）时写在 `solve()` 开头。
- `insert(s)`：**插入字符串** $s$。构建路径并维护沿途节点及结尾的计数。
- `query_cnt(s)`：**精确匹配查询**。返回字典树中完全等于 $s$ 的字符串出现次数。
- `query_pre(s)`：**前缀匹配查询**。返回字典树中所有以 $s$ 为前缀的字符串总数。
- `delet(s)`：**删除字符串** $s$。若树中存在 $s$，将其沿途的频次计数均减 1。

**时间复杂度：** 插入、查询、删除均为 $O(L)$（$L$ 为字符串长度）；`init()` 清空复杂度为 $O(\text{max\_idx})$。

```c++
const int N=1e5+10;
const int M=26;

struct Trie{
    int tree[N][M]; // 表示从节点u沿字符c走到的子节点编号 
    int cnt[N];     // 经过该节点的字符串总数（包含了穿过它的和在这里结尾的）
    int endcnt[N];  // 恰好以该节点结尾的字符串数量
    bool have[N];   // 标记是否有单词以该节点结尾
    int idx;        // 当前测试用例中分配到的最新节点编号（0为根节点）
    int max_idx;    // 历史分配过的最大节点编号

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
            endcnt[i]=0;
            have[i]=false;
            memset(tree[i],0,sizeof tree[i]);
        }
        idx=0;
        max_idx=0;
    }

    Trie(){
        max_idx=0;
        idx=0;
        init();
    }

    // 1.插入字符串
    void insert(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]){
                idx++;
                tree[u][c]=idx;
                max_idx=max(max_idx,idx); // 实时更新历史最大的节点编号
            }
            u=tree[u][c];
            cnt[u]++;
        }
        have[u]=true;
        endcnt[u]++;
    }

    // 2.查询s的前缀包含了多少已经插入的字符串 
    // 即：沿着s的路径走，累加沿途所有的endcnt[u]
    int query_prefix(const string& s){
        int u=0;
        int sum_endcnt=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) break;
            u=tree[u][c];
            sum_endcnt += endcnt[u];
        }
        return sum_endcnt;
    }

    // 3.查询以s为前缀的字符串有多少个
    int query_pre(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) return 0;
            u=tree[u][c];
        }
        return cnt[u];
    }

    // 4.查询字典树里面有多少个完全相同的s
    int query_cnt(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) return 0;
            u=tree[u][c];
        }
        return endcnt[u];
    }

    // 5.删除一个字符串
    void delet(const string& s){
        int u=0;
        if(query_cnt(s)==0) return ;
        for(char ch:s){
            int c=ch-'a';
            u=tree[u][c];
            cnt[u]--;
        }
        endcnt[u]--;
        if(endcnt[u]==0){
            have[u]=false;
        }
    }

    // 6.字典树上的dfs回溯搜索（按照字典序输出所有字符串）
    void dfs(int u,string& path){
        if(have[u]){
            cout<<"Found word:"<<path<<"(count:"<<endcnt[u]<<")\n";
        }
        for(int i=0;i<M;i++){
            if(tree[u][i]){
                path.push_back((char)('a'+i));
                dfs(tree[u][i],path);
                path.pop_back();
            }
        }
    }

    void print_all(){
        string path="";
        dfs(0,path);
    }
}trie;

void solve(){
    trie.init();

    trie.insert("apple");
    trie.insert("app");
    trie.insert("app");

    cout<<trie.query_cnt("app")<<endl;  // 输出 2 (完全匹配 app 的数量)
    cout<<trie.query_pre("app")<<endl;  // 输出 3 (以 app 为前缀的数量: apple*1 + app*2)

    trie.delet("app");
    cout<<trie.query_cnt("app")<<endl;  // 输出 1 (删掉一个后剩余的 app 数量)
    
}
```

#### 01字典树

时间复杂度： 

- 单次插入 / 删除 / 查询：O(BITS)  
- 处理 N 个数：O(N * BITS)

```c++
const int MOD=998244353;
const int N=2e5+10; // 元素个数
const int BITS=30;  // 对应 0 ~ 2^30-1 的范围，即最高到第 29 位
const int M=N*BITS+10; // 静态数组总结点数上限

struct Trie01{
    int tree[M][2]; // 01 分支
    int cnt[M];     // 经过该节点的数值数量
    int endcnt[M];  // 恰好在该节点结尾的数值数量
    int idx;        // 当前分配的节点编号
    int max_idx;    // 历史分配过的最大节点编号（用于多组数据快速清空）

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
            endcnt[i]=0;
            tree[i][0]=tree[i][1]=0;
        }
        idx=0;
        max_idx=0;
    }

    Trie01(){
        max_idx=0;
        idx=0;
        init();
    }

    // 1.插入数值 x
    void insert(int x){
        int u=0;
        cnt[u]++;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            if(!tree[u][bit]){
                idx++;
                tree[u][bit]=idx;
                max_idx=max(max_idx,idx); // 实时更新历史最大的节点编号
            }
            u=tree[u][bit];
            cnt[u]++;
        }
        endcnt[u]++;
    }

    // 2.删除数值 x（必须保证 x 已存在于 Trie 中）
    void delet(int x){
        int u=0;
        cnt[u]--;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            u=tree[u][bit];
            cnt[u]--;
        }
        endcnt[u]--;
    }

    // 3.查询与 x 异或【最大】所对应的数值本身
    int query_max(int x){
        int u=0,res=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            int wish=bit^1; // 优先走不同方向 (0->1, 1->0)
            if(tree[u][wish]&&cnt[tree[u][wish]]>0){
                u=tree[u][wish];
                res|=(wish<<i);
            }else{
                u=tree[u][bit];
                res|=(bit<<i);
            }
        }
        return res;
    }

    // 4.查询与 x 异或【最小】所对应的数值本身
    int query_min(int x){
        int u=0,res=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            int wish=bit; // 优先走相同方向 (0->0, 1->1)
            if(tree[u][wish]&&cnt[tree[u][wish]]>0){
                u=tree[u][wish];
                res|=(wish<<i);
            }else{
                u=tree[u][bit^1];
                res|=((bit^1)<<i);
            }
        }
        return res;
    }

    // 5.查询数字 x 出现的完整次数
    int query_cnt(int x){
        int u=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            if(!tree[u][bit]) return 0;
            u=tree[u][bit];
        }
        return endcnt[u];
    }

    // 6.字典树上的 dfs 遍历（按从小到大的顺序遍历树中存在的所有数值）
    void dfs(int u,int depth,int val){
        if(depth<0){
            if(endcnt[u]>0){
                cout<<"Found val:"<<val<<" (count:"<<endcnt[u]<<")\n";
            }
            return;
        }
        for(int bit=0;bit<=1;bit++){
            if(tree[u][bit]&&cnt[tree[u][bit]]>0){
                dfs(tree[u][bit],depth-1,val|(bit<<depth));
            }
        }
    }

    void print_all(){
        dfs(0,BITS-1,0);
    }
}trie;
```



### 字符串哈希

用于快速比较两个子串是否相等。把字符串看成以 `base` 为底的多项式，维护前缀哈希 `h[i]` 与幂 `pw[i]`。对子串 $[l,r]$，减去前面部分的贡献即可：

$$
H(l,r)=\bigl(h[r]-h[l-1]\cdot pw[r-l+1]\bigr)\bmod mod
$$

采用两组不同的 `base` 和模数降低碰撞概率，这里取 `base1=13331`、`base2=131313`，也可以换成 `131` 等其他值，取值需小于对应模数。比较时要求**子串长度相同、两组哈希值均相同**；哈希仍存在碰撞，不能保证绝对正确。不同字符串构造的 `StringHash` 使用相同参数，可以直接比较返回值。

**时间复杂度：** 预处理 $O(n)$，单次查询 $O(1)$。

```c++
const int mod1=1000000007,mod2=1000000009;
const int base1=13331,base2=131313;

struct StringHash{
    vector<int> h1,h2,pw1,pw2;

    StringHash(const string& s){
        int n=s.size();
        h1.assign(n+1,0);
        h2.assign(n+1,0);
        pw1.assign(n+1,1);
        pw2.assign(n+1,1);
        for(int i=1;i<=n;i++){
            int x=(unsigned char)s[i-1]+1;
            h1[i]=(h1[i-1]*base1+x)%mod1;
            h2[i]=(h2[i-1]*base2+x)%mod2;
            pw1[i]=pw1[i-1]*base1%mod1;
            pw2[i]=pw2[i-1]*base2%mod2;
        }
    }

    pair<int,int> get(int l,int r) const{
        int x=(h1[r]-h1[l-1]*pw1[r-l+1]%mod1+mod1)%mod1;
        int y=(h2[r]-h2[l-1]*pw2[r-l+1]%mod2+mod2)%mod2;
        return {x,y};
    }
};

// 查询要求1<=l<=r<=字符串长度
// StringHash hs(s),ht(t);
// 等长子串比较：hs.get(l1,r1)==ht.get(l2,r2)
// 乘法依赖全局的#define int long long，避免32位溢出
```

### KMP

用于在文本串 `s` 中查找模式串 `p` 的所有出现位置，允许重叠匹配。传入原字符串即可，模式串内部转为 **1-based**，返回的匹配起点也是 **1-based**；模式串需非空。

- `ne[i]`：`p[1..i]` 的最长相等真前缀与真后缀的长度，不能包含整个 `p[1..i]`，所以 `ne[1]=0`。
- `j`：当前已经匹配的模式串前缀长度。失配时令 `j=ne[j]`，保留已匹配部分中仍可能作为前缀的最长后缀，再尝试匹配当前字符。
- 完整匹配后也要令 `j=ne[j]`，继续寻找可能重叠的匹配。例如 `s="ababa"`、`p="aba"`，起点为 `1,3`。

**时间复杂度：** 构造 $O(m)$，单次匹配 $O(n)$，其中 $n=|s|$、$m=|p|$。

```c++
struct KMP{
    int m;
    string p;
    vector<int> ne;

    KMP(const string& t):m(t.size()),p(" "+t),ne(m+1,0){
        for(int i=2,j=0;i<=m;i++){
            while(j && p[i]!=p[j+1]) j=ne[j];
            if(p[i]==p[j+1]) j++;
            ne[i]=j;
        }
    }

    vector<int> match(const string& s) const{
        int n=s.size();
        vector<int> ans;
        for(int i=1,j=0;i<=n;i++){
            // s保持原字符串，s[i-1]对应文本串的第i个字符
            while(j && s[i-1]!=p[j+1]) j=ne[j];
            if(s[i-1]==p[j+1]) j++;
            if(j==m){
                ans.push_back(i-m+1);
                j=ne[j];// 保留公共前后缀，允许重叠匹配
            }
        }
        return ans;
    }
};

void solve(){
    string s,p;
    cin>>s>>p;// 先文本串，后模式串，均不含空白字符
    KMP kmp(p);
    auto ans=kmp.match(s);
    for(int x:ans) cout<<x<<'\n';
    // 前缀数组可通过kmp.ne[1..kmp.m]访问
}
```

#### 公共前后缀与循环节

对长度为 $n$ 的非空串构造 `KMP kmp(s)`。从 `kmp.ne[n]` 开始，不断令 `j=kmp.ne[j]`，直到 `j=0`，就能按长度递减枚举所有非空、且不等于原串的公共前后缀。

令 $p=n-\mathrm{ne}[n]$，则 $p$ 是最短周期：将字符串向右移动 $p$ 位后，重叠部分仍然相等。若还要求原串由某个短串**完整重复**得到，则需满足 $n\bmod p=0$，否则最短循环节长度为 $n$。例如 `ababa` 的最短周期为 $2$，但不能由 `ab` 完整重复得到。

**时间复杂度：** 前缀数组求出后，枚举公共前后缀 $O(n)$，求最短周期与循环节 $O(1)$。

### Z 函数与扩展 KMP

`z[i]` 表示字符串从第 $i$ 位开始的后缀与整个字符串的最长公共前缀长度，约定 `z[1]=n`。它比较的是“前缀和某个后缀”；KMP 的 `ne[i]` 则比较 `s[1..i]` 的真前缀与真后缀，二者含义不同。

例如 `s="ababa"` 时，`z[1..5]={5,0,3,0,1}`：从第 $3$ 位开始的 `aba` 与原串前 $3$ 个字符相同，所以 `z[3]=3`。

维护与前缀相同、且右端点最远的区间 $[l,r]$。若 $i\le r$，`s[i]` 对应前缀的第 `i-l+1` 位，可以复用 `z[i-l+1]`，但已知相等的部分不能超过右边界，因此先取 `min(r-i+1,z[i-l+1])`，再向右比较尚未确定的部分。每个位置至多多做一次失配比较，成功扩展只会推进右边界，因此总比较次数为线性。

扩展 KMP 将比较对象换成两个字符串：`ex[i]` 表示文本串 `s` 从第 $i$ 位开始的后缀与模式串 `p` 的最长公共前缀长度。先求 `p` 的 Z 数组，再用同样的区间复用过程扫描 `s`；`ex[i]==p.size()` 就表示该处完整匹配。模式串需非空。

**时间复杂度：** Z 函数 $O(n)$；扩展 KMP $O(n+m)$，其中 $n=|s|$、$m=|p|$。

```c++
vector<int> get_z(const string& s){
    int n=s.size();
    string t=" "+s;
    vector<int> z(n+1,0);
    if(n==0) return z;
    z[1]=n;
    for(int i=2,l=0,r=0;i<=n;i++){
        if(i<=r) z[i]=min(r-i+1,z[i-l+1]);
        while(i+z[i]<=n && t[z[i]+1]==t[i+z[i]]) z[i]++;
        if(i+z[i]-1>r){
            l=i;
            r=i+z[i]-1;
        }
    }
    return z;
}

vector<int> exkmp(const string& s,const string& p){
    int n=s.size(),m=p.size();
    auto z=get_z(p);
    vector<int> ex(n+1,0);
    for(int i=1,l=0,r=0;i<=n;i++){
        if(i<=r) ex[i]=min(r-i+1,z[i-l+1]);
        while(ex[i]<m && i+ex[i]<=n && s[i+ex[i]-1]==p[ex[i]]){
            ex[i]++;
        }
        if(i+ex[i]-1>r){
            l=i;
            r=i+ex[i]-1;
        }
    }
    return ex;
}
```

### Manacher（最长回文子串）

用于求最长回文**子串**，也能在预处理后判断任意子串是否为回文。在相邻字符之间以及首尾插入分隔符，将奇数长度和偶数长度的回文统一处理。代码用整数 `-1` 作为分隔符，原字符转换为非负整数，避免与输入字符冲突。

`d[i]` 是处理后字符串以第 $i$ 位为中心、**包含中心**的最大回文半径，故对应原串的回文长度为 `d[i]-1`。维护右端点最远的回文区间 $[l,r]$；区间内的位置先利用镜像中心 `l+r-i` 的半径，再向外扩展尚未确定的部分。

例如 `aba` 处理后为 `#a#b#a#`，这里用 `#` 表示分隔符。以第 $4$ 位的 `b` 为中心，半径为 $4$，对应原串长度为 $3$ 的回文 `aba`。因为 $[l,r]$ 本身是回文，对称位置的匹配结果可以复用；超过右边界的部分仍需实际比较。

`pos,len` 保存最长回文子串的起点与长度，长度相同时保留最先找到的一个；空串时二者均为 `0`。原串子串 $[l,r]$ 的中心映射到处理后的第 $l+r$ 位，半径至少为 $r-l+2$ 时，该子串就是回文。

**时间复杂度：** 预处理及求最长回文 $O(n)$，单次回文判断 $O(1)$。

```c++
struct Manacher{
    vector<int> d;
    int pos=0,len=0;

    Manacher(const string& s){
        int n=s.size(),m=2*n+1;
        vector<int> t(m+1,-1);
        for(int i=1;i<=n;i++) t[2*i]=(unsigned char)s[i-1];
        d.assign(m+1,1);
        for(int i=1,l=0,r=0;i<=m;i++){
            if(i<=r) d[i]=min(r-i+1,d[l+r-i]);
            while(i-d[i]>=1 && i+d[i]<=m && t[i-d[i]]==t[i+d[i]]){
                d[i]++;
            }
            if(i+d[i]-1>r){
                l=i-d[i]+1;
                r=i+d[i]-1;
            }
            if(d[i]-1>len){
                len=d[i]-1;
                pos=(i-d[i]+2)/2;
            }
        }
    }

    bool is_palindrome(int l,int r) const{
        return d[l+r]>=r-l+2;// 要求1<=l<=r<=原串长度
    }
};

// Manacher man(s);
// 最长回文子串：s.substr(man.pos-1,man.len)，原串需非空
// 判断区间：man.is_palindrome(l,r)
```

### 最小表示法

用于求字符串所有循环移位中字典序最小的一个。例如 `baca` 的最小表示为 `abac`，起点是原串第 $4$ 位。将字符串复制一遍接在末尾，每种循环移位就对应一个长度为 $n$ 的连续子串。

维护两个候选起点 `i,j`，用 `k` 记录相等的前缀长度。首个不同字符确定哪一个候选更大，同时可以排除这个候选之后的 `k` 个起点：这些起点也能与另一侧相应偏移的起点比较，在同一处失配并判为更大。因此较大的一侧直接前进 `k+1` 位；若两个指针相遇，再跳过相同起点。

函数返回最小表示的 **1-based 起点**，多个起点产生相同结果时返回最小起点；空串返回 `0`。

**时间复杂度：** $O(n)$。

```c++
int min_rotation(const string& s){
    int n=s.size();
    if(n==0) return 0;
    string t=" "+s+s;
    int i=1,j=2,k=0;
    while(i<=n && j<=n && k<n){
        if(t[i+k]==t[j+k]){
            k++;
            continue;
        }
        if((unsigned char)t[i+k]>(unsigned char)t[j+k]){
            i+=k+1;
            if(i==j) i++;
        }
        else{
            j+=k+1;
            if(i==j) j++;
        }
        k=0;
    }
    return min(i,j);
}

// int pos=min_rotation(s);
// string ans=(s+s).substr(pos-1,s.size());// 原串需非空
```

### AC 自动机（多模式匹配）

用于统计多个模式串在一个文本串中的出现次数，允许重叠。先将所有模式串插入 Trie，再按 BFS 顺序建立 `fail`：`fail[u]` 指向当前节点对应字符串的最长真后缀，且这个后缀也是 Trie 中的某个前缀。失配时沿 `fail` 跳转，继续利用已经匹配的后缀。

建图时将缺失转移补成 `tr[fail[u]][c]`，扫描文本时每个字符便只需走一次转移。扫描到节点 `u` 时给 `cnt[u]` 加一；最后按 BFS 的逆序把 `cnt[u]` 累加到 `cnt[fail[u]]`，因为一次较长串的匹配也包含它的这些后缀。模式串终止节点的计数就是答案。

例如模式串有 `she` 和 `he`，扫描文本 `she` 后停在 `she` 的终止节点。它的 `fail` 指向 `he` 的终止节点，倒序累加后两者的出现次数都为 $1$，不必在扫描每个字符时反复枚举所有后缀。

模板仅处理小写英文字母，模式串需非空。**先完成所有 `insert()`，再调用一次 `build()`**，之后可以多次 `count()` 查询不同文本。`insert()` 返回终止节点，重复模式串会返回相同节点，查询时各自得到相同次数。

**时间复杂度：** 插入总长为 $L$ 的模式串 $O(L)$；建图 $O(26V)$；单次统计 $O(n+V)$，其中 $V$ 为节点数，$n$ 为文本串长度。

```c++
struct AC{
    vector<array<int,26>> tr;
    vector<int> fail,ord;

    AC(){
        tr.push_back({});// 根节点编号为0
        fail.push_back(0);
    }

    int insert(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tr[u][c]){
                tr[u][c]=tr.size();
                tr.push_back({});
                fail.push_back(0);
            }
            u=tr[u][c];
        }
        return u;
    }

    void build(){
        queue<int> q;
        for(int c=0;c<26;c++){
            if(tr[0][c]) q.push(tr[0][c]);
        }
        while(!q.empty()){
            int u=q.front();
            q.pop();
            ord.push_back(u);
            for(int c=0;c<26;c++){
                int v=tr[u][c];
                if(v){
                    fail[v]=tr[fail[u]][c];
                    q.push(v);
                }
                else tr[u][c]=tr[fail[u]][c];
            }
        }
    }

    vector<int> count(const string& s) const{
        vector<int> cnt(tr.size(),0);
        int u=0;
        for(char ch:s){
            u=tr[u][ch-'a'];
            cnt[u]++;
        }
        for(int i=(int)ord.size()-1;i>=0;i--){
            int v=ord[i];
            cnt[fail[v]]+=cnt[v];
        }
        return cnt;
    }
};

void solve(){
    int n;
    cin>>n;// 模式串个数，接着读入n个模式串和一个文本串
    AC ac;
    vector<int> ed(n+1);
    for(int i=1;i<=n;i++){
        string p;
        cin>>p;
        ed[i]=ac.insert(p);
    }
    ac.build();
    string s;
    cin>>s;
    auto cnt=ac.count(s);
    for(int i=1;i<=n;i++) cout<<cnt[ed[i]]<<'\n';
}
```

## 数学

### 位运算

#### 不进位加法

对非负整数 $a,b$，有：

$$
a+b=(a\oplus b)+2(a\&b)
$$

当且仅当 $a\&b=0$ 时，两数没有重叠的 $1$，相加不进位，此时：

$$
a+b=a\oplus b
$$

#### 不退位减法

对非负整数 $a\ge b$，有以下恒等式，其中 $\sim a$ 表示按位取反：

$$
a-b=(a\oplus b)-2\bigl((\sim a)\&b\bigr)
$$

当且仅当 $a\&b=b$ 时，$b$ 为 $1$ 的位置上 $a$ 也为 $1$，相减不退位，即不需要向高位借位，此时：

$$
a-b=a\oplus b
$$

条件 $a\&b=b$ 也表示 $b$ 是 $a$ 的子掩码。

### 最大公约数

时间复杂度为 $O(log(\min{(a,b)}))$

```c++
int gcd(int a,int b){
    if(b==0) return a;
    return gcd(b,a%b);
}
```

```c++
int gcd(int a,int b){
	while(b){
        int temp=b;
        b=a%b;
        a=temp;
    }
    return a;
}
```

### 最小公倍数

```c++
int lcm(int a,int b){
    return a/gcd(a,b)*b;
}
```

### 快速幂与乘法逆元

计算  $a^b mod MOD$

```c++
int qpow(int a,int b){
    int ret=1;
    while(b){
        if(b&1) ret = ret*a%MOD;
        a=a*a%MOD;
        b >>= 1;
    }
    return ret;
}
int inv(int x){
    return qpow(x,MOD-2);
}
```

$\frac{a}{b} \bmod m \equiv a \cdot b^{m-2} \pmod{m}$

调用：`a*inv(b)%MOD`

### 埃氏筛法

时间复杂度为 $O(n \log \log n)$ 

```c++
// 筛出 [1,n] 的所有质数
vector<int> primes;
vector<int> is_prime;// 1表示质数，0表示合数

void sieve(int n){
    is_prime.assign(n+1,1);
    primes.clear();
    is_prime[0]=is_prime[1]=0;
    for(int i=2;i<=n;i++){
        if(is_prime[i]){
            primes.push_back(i);
            if(i*i<=n){
                for(int j=i*i;j<=n;j+=i){
                    is_prime[j]=0;
                }
            }
        }
    }
}
```

这个合法上界不要开太大



### 质因数分解

试除时不断除尽当前因子，最后若剩余数大于 $1$，它就是一个质因子。单次分解最坏 $O(\sqrt{x})$。

例题：[P2043 质因子分解](https://www.luogu.com.cn/problem/P2043)，输出 $n!$ 的质因子及指数，$n\le10^4$。逐个分解 $2\sim n$ 并累计即可，时间复杂度上界 $O(n\sqrt n)$。

若已筛出质数，也可以直接用勒让德公式计算 $n!$ 中质数 $p$ 的指数：

$$
\sum_{j\ge1}\left\lfloor\frac{n}{p^j}\right\rfloor.
$$

实现时反复执行 `x/=p` 并累加商，避免计算 $p^j$ 溢出。

```c++
const int N=2e5+10;
int n;
int cnt[N];

void divide(int x){
    // 试除法分解
    for(int i=2;i*i<=x;i++){
        while(x%i==0){
            cnt[i]++;
            x /= i;
        }
    }
    // 最后剩的大质数
    if(x>1) cnt[x]++;
}

void solve(){
    cin>>n;
    for(int i=2;i<=n;i++){
        divide(i);
    }

    for(int i=2;i<=n;i++){
        if(cnt[i]!=0) cout<<i<<" "<<cnt[i]<<endl;
    }
}
```

### 取模运算

```c++
const int MOD = 1e9 + 7;
// (a + b) % MOD
int add(int a, int b) {
  int ret = a + b;
  if (ret >= MOD) ret -= MOD;
  return ret;
}
// (a - b) % MOD
int sub(int a, int b) {
  int ret = a - b;
  if (ret < 0) ret += MOD;
  return ret;
}
// (a * b) % MOD
int mul(int a, int b) {
  return 1LL * a * b % MOD;
}
// (a / b) % MOD = a * inv(b) % MOD
int div_mod(int a, int b) {
  return mul(a, inv(b));
}
// 将任意整数 x 转为 [0, MOD-1] 范围
int norm(int x) {
  return (x % MOD + MOD) % MOD;
}
```



### 浮点数二分

```c++
// 浮点数二分求平方根
// 公式：x 的平方根满足 mid^2 <= x < (mid+eps)^2
double sqrt_binary(double x) {
  double l = 0, r = x;
  for (int i = 0; i < 100; i++) { // 固定迭代次数，保证精度
    double mid = (l + r) / 2;
    if (mid * mid < x) l = mid;  // mid^2 < x，答案在 [mid, r]
    else r = mid;         // mid^2 >= x，答案在 [l, mid]
  }
  return l;
}
```

### 三分

#### 浮点三分

（实数域单峰函数求极值）

假设函数 `f(x)` 在区间 `[l, r]` 上是单峰的，求极小值点（极大值只需改比较符号）。

```c++
// 浮点数三分
// 单谷函数（先减后增，求谷底）
double f(double x){
    return (x-3.14159)*(x-3.14159)+10.0;
}
double ternary_search_float(double l,double r){
    for(int i=0;i<100;i++){
        double m1=l+(r-l)/3.0;
        double m2=r-(r-l)/3.0;
        if(f(m1)<f(m2)){
            r=m2;
        }
        else l=m1;
    }
    return l;
}
void solve(){
    double ans=ternary_search_float(-1.0,100.0);
}
```

#### 整数三分

（离散域严格单峰函数求最值）

适用于定义在整数区间上的凸/凹函数。以**求最小值**为例（求最大值改符号）。

```c++
// 整数三分 
// 单谷函数（先减后增，求谷底）
double f(int x){
    return (x-5)*(x-5)+10;
}

int ternary_search_int(int l,int r){

    while(r-l>2){
        int m1=l+(r-l)/3;
        int m2=r-(r-l)/3;
        if(f(m1)<f(m2)){
            r=m2;
        }
        else l=m1;
    }
    int res=l;
    for(int i=l+1;i<=r;i++){
        if(f(i)<f(res)) res=i;
    }
    return res;
}
void solve(){
    int ans=ternary_search_int(0,100);
}
```



### 组合数

**一：小数据 / 无模数 / 精确值**

（$n \le 62$）

- **应用场景**：结果在 `unsigned long long` 范围内，不取模。
- **时间复杂度**：$O(m)$。
- **核心技巧**：利用 $C(n, m) = \frac{n \times (n-1) \times \dots \times (n-m+1)}{1 \times 2 \times \dots \times m}$，**边乘边除**防止溢出

```c++
#define ull unsigned long long

ull C1(ull n,ull m){
    if(m>n)return 0;
    if(m>n-m)m=n-m;
    ull res=1;
    for(ull i=1;i<=m;i++){
        res=res*(n-i+1)/i;
    }
    return res;
}
```

**二：大数据 + 静态模质数**

（$n, m \le 10^6$，$P$ 为大质数如 $10^9+7$ 或 $998244353$）

- **应用场景**：竞赛中最常见的预处理场景，多组询问（$O(1)$ 回答）。
- **时间复杂度**：预处理 $O(N)$，单次查询 $O(1)$。
- **核心技巧**：根据费马小定理（$a^{P-2} \equiv a^{-1} \pmod P$），预处理阶乘 `fact` 和阶乘逆元 `invfact`

```c++
#define int long long

const int MOD=1e9+7;
const int N=1e6+5;
int fact[N],inv[N];

int qpow(int a,int b){
    int res=1;
    a%=MOD;
    while(b){
        if(b&1)res=res*a%MOD;
        a=a*a%MOD;
        b>>=1;
    }
    return res;
}

void init(){
    fact[0]=1;
    inv[0]=1;
    for(int i=1;i<N;i++)fact[i]=fact[i-1]*i%MOD;
    inv[N-1]=qpow(fact[N-1],MOD-2);
    for(int i=N-2;i>=1;i--)inv[i]=inv[i+1]*(i+1)%MOD;
}

int C(int n,int m){
    if(m<0||m>n)return 0;
    return fact[n]*inv[m]%MOD*inv[n-m]%MOD;
}
```

**三：超大数据 + 模小质数**

（$n, m \le 10^{18}$，$P \le 10^5$ 且 $P$ 为质数）

- **应用场景**：$n, m$ 极高但模数 $P$ 较小，需要用到 **卢卡斯定理（Lucas Theorem）**：

  $$\binom{n}{m} \equiv \binom{n \bmod P}{m \bmod P} \times \binom{\lfloor n/P \rfloor}{\lfloor m/P \rfloor} \pmod P$$

- **时间复杂度**：预处理 $O(P)$，单次查询 $O(\log_P n)$。

```c++
#define int long long

int qpow(int a,int b,int p){
    int res=1;
    a%=p;
    while(b){
        if(b&1)res=res*a%p;
        a=a*a%p;
        b>>=1;
    }
    return res;
}

int C(int n,int m,int p){
    if(m>n)return 0;
    int num=1,den=1;
    for(int i=0;i<m;i++){
        num=num*(n-i)%p;
        den=den*(i+1)%p;
    }
    return num*qpow(den,p-2,p)%p;
}

int lucas(int n,int m,int p){
    if(m==0)return 1;
    return C(n%p,m%p,p)*lucas(n/p,m/p,p)%p;
}
```

**四：中等数据 + 动态模数/非质数**

（$n, m \le 5000$）

- **应用场景**：模数不固定，或者模数不为质数（无法使用逆元）。
- **时间复杂度**：预处理 $O(N^2)$，单次查询 $O(1)$。
- **核心技巧**：杨辉三角递推 $\binom{n}{m} = \binom{n-1}{m-1} + \binom{n-1}{m}$。

```c++
#define int long long

const int N=5005;
int C[N][N];

void init(int mod){
    for(int i=0;i<N;i++){
        C[i][0]=1;
        for(int j=1;j<=i;j++){
            C[i][j]=(C[i-1][j-1]+C[i-1][j])%mod;
        }
    }
}
```

**总结**

- **$N \le 62$ 无模数** $\rightarrow$ **一**（直接计算 $O(M)$）
- **$N \le 10^6$ 模大质数** $\rightarrow$ **二**（阶乘逆元预处理 $O(N) + O(1)$，**最常用**）
- **$N \le 10^{18}$ 模小质数** $\rightarrow$ **三**（Lucas 定理 $O(\log_P N)$）
- **$N \le 5000$ 模任意数** $\rightarrow$ **四**（杨辉三角递推 $O(N^2)$）



## 计算几何

### 精度与使用约定

平面直角坐标系中，$x$ 轴向右、$y$ 轴向上，逆时针为正方向。点集、多边形使用 **0-based** 的 `vector<Point>`，不在末尾重复存放第一个点；访问下一点时写 `p[(i+1)%n]`。

坐标使用 `long double`。

```c++
using ld=long double;
const ld eps=1e-10L;
const ld PI=acosl(-1.0L);

int sgn(ld x){
    if(x>eps) return 1;
    if(x<-eps) return -1;
    return 0;
}

// 浮点数相等：sgn(a-b)==0
// 输出：cout<<fixed<<setprecision(10)<<ans<<'\n';
```

`eps` 用于浮点数判零，按坐标范围和题目精度调整。整数坐标的共线、方向和相交判断用整数计算，乘法可能溢出时用 `__int128`。

**排序比较器不要用 `eps` 判断大小**，否则可能破坏严格弱序。排序直接按坐标比较，几何判断再使用 `sgn()`。

### 点与向量

点表示位置，向量表示方向和位移。二者共用 `Point` 存储：`b-a` 是从点 $A$ 指向点 $B$ 的向量，`a+v` 是将点 $A$ 沿向量 $v$ 平移。

```c++
struct Point{
    ld x=0,y=0;
    Point()=default;
    Point(ld x,ld y):x(x),y(y){}

    Point operator+(const Point& b) const{
        return {x+b.x,y+b.y};
    }
    Point operator-(const Point& b) const{
        return {x-b.x,y-b.y};
    }
    Point operator*(ld k) const{
        return {x*k,y*k};
    }
    Point operator/(ld k) const{
        return {x/k,y/k};// 要求k非零
    }
    bool operator<(const Point& b) const{
        if(x!=b.x) return x<b.x;
        return y<b.y;
    }
    bool operator==(const Point& b) const{
        return x==b.x && y==b.y;// 精确去重，不用于近似相等判断
    }
};

bool same(Point a,Point b){
    return sgn(a.x-b.x)==0 && sgn(a.y-b.y)==0;
}

ld dot(Point a,Point b){
    return a.x*b.x+a.y*b.y;
}

ld cross(Point a,Point b){
    return a.x*b.y-a.y*b.x;
}

ld norm2(Point a){
    return dot(a,a);// 长度的平方
}

ld len(Point a){
    return sqrtl(norm2(a));
}

ld dist(Point a,Point b){
    return len(a-b);
}
```

比较两点距离大小时可比较 `norm2(a-b)`，避免开根号；中点为 `(a+b)/2`。上述操作均为 $O(1)$。

### 点积与叉积

#### 点积：夹角与投影

设两个向量为 $a=(x_1,y_1)$、$b=(x_2,y_2)$，夹角为 $\theta\in[0,\pi]$：

$$
a\cdot b=x_1x_2+y_1y_2=|a||b|\cos\theta
$$

对于两个非零向量，点积大于 $0$ 表示夹锐角，等于 $0$ 表示垂直，小于 $0$ 表示夹钝角。向量 $a$ 在非零向量 $b$ 方向上的投影向量为：

$$
\operatorname{proj}_b(a)=b\frac{a\cdot b}{|b|^2}
$$

#### 叉积：方向与面积

二维叉积是一个有符号的数：

$$
a\times b=x_1y_2-y_1x_2
$$

对有向直线 $A\to B$，令 $v=B-A$、$w=P-A$：

| `sgn(cross(v,w))` | 点 $P$ 的位置 |
| --- | --- |
| $1$ | 直线左侧，即 $A\to B\to P$ 逆时针转向 |
| $-1$ | 直线右侧，即顺时针转向 |
| $0$ | 三点共线；仍需另外判断 $P$ 是否在线段上 |

两个非零向量叉积为 $0$ 表示平行，点积为 $0$ 表示垂直。三角形面积为：

$$
S_{ABC}=\frac{|(B-A)\times(C-A)|}{2}
$$

```c++
ld area(Point a,Point b,Point c){
    return fabsl(cross(b-a,c-a))/2;
}
```

#### 整数坐标的方向判断

整数点用 `long long` 存坐标，计算叉积时**先转 `__int128` 再减、乘**。坐标绝对值不超过 $10^{18}$ 时，叉积可放入有符号 `__int128`；更大范围需重新核算。

```c++
struct IPoint{
    long long x,y;
};

__int128 icross(IPoint a,IPoint b,IPoint c){
    __int128 x1=(__int128)b.x-a.x;
    __int128 y1=(__int128)b.y-a.y;
    __int128 x2=(__int128)c.x-a.x;
    __int128 y2=(__int128)c.y-a.y;
    return x1*y2-y1*x2;
}

int iturn(IPoint a,IPoint b,IPoint c){
    __int128 v=icross(a,b,c);
    if(v>0) return 1;
    if(v<0) return -1;
    return 0;// 1逆时针，-1顺时针，0共线
}

bool ionseg(IPoint p,IPoint a,IPoint b){
    return iturn(a,b,p)==0 &&
           min(a.x,b.x)<=p.x && p.x<=max(a.x,b.x) &&
           min(a.y,b.y)<=p.y && p.y<=max(a.y,b.y);
}

bool isegcross(IPoint a,IPoint b,IPoint c,IPoint d){
    // 包含端点接触、共线重叠，允许线段退化为点
    if(ionseg(a,c,d) || ionseg(b,c,d) ||
       ionseg(c,a,b) || ionseg(d,a,b)) return true;
    return iturn(a,b,c)*iturn(a,b,d)<0 &&
           iturn(c,d,a)*iturn(c,d,b)<0;
}
```

`ionseg()` 用叉积判共线，再检查横纵坐标是否均在两个端点的闭区间内；`isegcross()` 的跨立判断与后面的浮点版本相同。这些判断均为 $O(1)$，不需要 `eps`。

### 整点与 gcd

#### 整数方向约分

两个整点的坐标差为 $(dx,dy)$，且两点不同。令：

$$
g=\gcd(|dx|,|dy|),\qquad v=\left(\frac{dx}{g},\frac{dy}{g}\right)
$$

约分后的整数向量可以作为方向的键。例如 $(6,4)$ 和 $(3,2)$ 都变成 $(3,2)$，竖直方向也能直接表示，不需要计算浮点斜率。

统计同一条直线的方向时，还要统一正负：让 $dx>0$，或者 $dx=0$ 且 $dy>0$。统计从某个点出发的同一条射线时，正反方向不同，不能翻转符号。

```c++
pair<long long,long long> dir(long long dx,long long dy){
    // 要求(dx,dy)!=(0,0)，返回同一直线的方向
    long long g=std::gcd(abs(dx),abs(dy));
    dx/=g;
    dy/=g;
    if(dx<0 || (dx==0 && dy<0)){
        dx=-dx;
        dy=-dy;
    }
    return {dx,dy};
}
```

横纵坐标差及其绝对值需能放进 `long long`。枚举点 $A$，用 `map<pair<long long,long long>,int>` 统计其他点与 $A$ 的方向，可以统计经过 $A$ 的共线点；重复点单独计数。若区分射线，去掉翻转符号的 `if`。

**时间复杂度：** 单次约分 $O(\log M)$，其中 $M=\max(|dx|,|dy|)$。

#### 线段上的格点数

端点为整点，令 $g=\gcd(|x_2-x_1|,|y_2-y_1|)$。从起点每次走约分后的方向向量，走 $g$ 步到终点，因此线段上的格点数为：

$$
\text{含两个端点：}g+1
$$

两个端点不同时，内部格点数为：

$$
\text{不含端点：}g-1
$$

例如 $(0,0)$ 到 $(6,4)$，$g=2$，格点为 $(0,0),(3,2),(6,4)$。两个端点相同时，只有一个格点，内部格点数为 $0$。

```c++
long long lattice(IPoint a,IPoint b){
    // 含端点，要求坐标差、绝对值和答案不溢出long long
    long long dx=abs(b.x-a.x),dy=abs(b.y-a.y);
    return std::gcd(dx,dy)+1;
}
```

#### Pick 定理

对于顶点均为整点、不自交且没有孔洞的多边形，设面积为 $S$，内部格点数为 $I$，边界格点数为 $B$：

$$
S=I+\frac{B}{2}-1
$$

每条边含端点的格点数为 $g+1$，所有边相加会将每个顶点算两遍，所以边界格点数为：

$$
B=\sum_{i=0}^{n-1}\gcd(|x_{i+1}-x_i|,|y_{i+1}-y_i|)
$$

下标按 $n$ 取模。若已经用叉积求得两倍面积 $S_2$，则内部格点数为：

$$
I=\frac{S_2-B+2}{2}
$$

例如顶点为 $(0,0),(4,0),(0,3)$ 的三角形，$S_2=12$，$B=4+1+3=8$，所以 $I=3$。

### 夹角与旋转

#### 弧度与三角函数

$$
180^\circ=\pi,\qquad \text{弧度}=\text{角度}\times\frac{\pi}{180}
$$

设非零向量为 $(x,y)$，长度为 $r$，与 $x$ 轴正方向的有向角为 $\theta$：

$$
\cos\theta=\frac{x}{r},\qquad \sin\theta=\frac{y}{r}
$$

当 $x\ne0$ 时：

$$
\tan\theta=\frac{y}{x}
$$

| 角度 | 弧度 | $\sin$ | $\cos$ |
| --- | --- | --- | --- |
| $0^\circ$ | $0$ | $0$ | $1$ |
| $30^\circ$ | $\pi/6$ | $1/2$ | $\sqrt3/2$ |
| $45^\circ$ | $\pi/4$ | $\sqrt2/2$ | $\sqrt2/2$ |
| $60^\circ$ | $\pi/3$ | $\sqrt3/2$ | $1/2$ |
| $90^\circ$ | $\pi/2$ | $1$ | $0$ |

`atan2l(y,x)` 同时考虑两个坐标的符号，返回 $[-\pi,\pi]$ 内的方向角；`atanl(y/x)` 会丢失象限信息，也不能处理竖直方向。

#### 向量夹角与旋转

两个非零向量的夹角 $\theta\in[0,\pi]$ 满足：

$$
\theta=\arccos\frac{a\cdot b}{|a||b|}
$$

浮点误差可能使余弦值略微超出 $[-1,1]$，传入 `acosl()` 前要截断。

```c++
ld angle(Point a,Point b){
    // 要求a、b均为非零向量，返回[0,PI]
    ld c=dot(a,b)/len(a)/len(b);
    c=max(-1.0L,min(1.0L,c));
    return acosl(c);
}

Point rot(Point a,ld rad){
    // 绕原点逆时针旋转rad弧度，负数表示顺时针
    ld c=cosl(rad),s=sinl(rad);
    return {a.x*c-a.y*s,a.x*s+a.y*c};
}

Point rot90(Point a){
    return {-a.y,a.x};// 逆时针90度
}

// 点p绕点o旋转：o+rot(p-o,rad)
// 从非零向量a转到非零向量b的有向角，范围[-PI,PI]
// atan2l(cross(a,b),dot(a,b))，逆时针为正
```

#### 三角形常用公式

设三角形三边为 $a,b,c$，对应的内角为 $A,B,C$。

**内角和：**

$$
A+B+C=\pi
$$

**余弦定理：** 已知两边和夹角可求第三边，已知三边可求角。

$$
c^2=a^2+b^2-2ab\cos C
$$

**正弦定理：** $R$ 为外接圆半径。

$$
\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}=2R
$$

**两边和夹角求面积：**

$$
S=\frac12 ab\sin C
$$

**海伦公式：** 已知三边，令半周长 $s=(a+b+c)/2$。

$$
S=\sqrt{s(s-a)(s-b)(s-c)}
$$

三边需满足三角形不等式。开根号前可用 `max(0.0L,v)` 消除微小负误差；若有三个顶点坐标，直接用叉积求面积即可。

### 斜率与直线方程

#### 斜率

经过两个不同点 $A(x_1,y_1)$、$B(x_2,y_2)$，且 $x_1\ne x_2$ 时，直线斜率为：

$$
k=\frac{y_2-y_1}{x_2-x_1}
$$

水平线的斜率为 $0$，竖直线没有斜率。若直线的倾斜角为 $\alpha\in[0,\pi)$，且 $\alpha\ne\pi/2$，则 $k=\tan\alpha$。

两条都有斜率的直线，斜率相同表示平行或重合；斜率乘积为 $-1$ 表示垂直。水平线与竖直线也垂直，需单独处理。

#### 直线方程

**点斜式：** 已知一点 $(x_0,y_0)$ 与斜率 $k$。

$$
y-y_0=k(x-x_0)
$$

**斜截式：** $b$ 是纵截距。

$$
y=kx+b
$$

**一般式：** $A,B$ 不同时为 $0$，向量 $(A,B)$ 是直线的法向量，$(B,-A)$ 是方向向量。

$$
Ax+By+C=0
$$

经过两点 $(x_1,y_1),(x_2,y_2)$ 时可取：

$$
A=y_1-y_2,\qquad B=x_2-x_1,\qquad C=x_1y_2-x_2y_1
$$

点 $(x_0,y_0)$ 到该直线的距离为：

$$
d=\frac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}}
$$

一般式和方向向量写法都能表示竖直线。判断平行、垂直和共线时，使用叉积、点积或整数方向约分，可以省去斜率中的除法。

### 直线交点、投影与距离

直线用一个点和一个非零方向向量表示：$P+t\,v$，其中 $t$ 可以取任意实数。相比斜率形式，这种写法能直接处理竖直线。

两条直线分别为 $P+t\,v$、$Q+s\,w$。当 $v\times w\ne0$ 时，联立后对 $w$ 取叉积，得到：

$$
t=\frac{(Q-P)\times w}{v\times w}
$$

```c++
// 两条直线各用两个不同的点表示
// 返回0：平行且不重合；1：唯一交点；2：重合
// 只有返回1时，交点ans才有效
int linecross(Point a,Point b,Point c,Point d,Point& ans){
    Point v=b-a,w=d-c;
    ld den=cross(v,w);
    if(sgn(den)==0){
        if(sgn(cross(c-a,v))==0) return 2;
        return 0;
    }
    ans=a+v*(cross(c-a,w)/den);
    return 1;
}

Point proj(Point p,Point a,Point b){
    // p在直线AB上的垂足，要求a!=b
    Point v=b-a;
    return a+v*(dot(p-a,v)/norm2(v));
}

ld disline(Point p,Point a,Point b){
    // 要求a!=b
    return fabsl(cross(b-a,p-a))/len(b-a);
}

Point reflect(Point p,Point a,Point b){
    // p关于直线AB的对称点，要求a!=b
    return proj(p,a,b)*2-p;
}
```

### 线段上的点、线段相交与距离

点 $P$ 在线段 $AB$ 上，需要同时满足共线和位于两端点之间，**包含端点**：

$$
(B-A)\times(P-A)=0,\qquad (P-A)\cdot(P-B)\le0
$$

两条线段相交，先处理端点落在另一条线段上的情况，再检查两条线段是否严格跨过彼此所在直线。这样能覆盖共线重叠、端点接触以及退化为点的线段。

```c++
bool onseg(Point p,Point a,Point b){
    if(same(a,b)) return same(p,a);
    return sgn(cross(b-a,p-a))==0 && sgn(dot(p-a,p-b))<=0;
}

bool segcross(Point a,Point b,Point c,Point d){
    // 闭线段相交：端点接触、共线重叠也返回true
    if(onseg(a,c,d) || onseg(b,c,d) ||
       onseg(c,a,b) || onseg(d,a,b)) return true;
    int c1=sgn(cross(b-a,c-a));
    int c2=sgn(cross(b-a,d-a));
    int c3=sgn(cross(d-c,a-c));
    int c4=sgn(cross(d-c,b-c));
    return c1*c2<0 && c3*c4<0;
}

ld disseg(Point p,Point a,Point b){
    if(same(a,b)) return dist(p,a);
    Point v=b-a;
    ld t=dot(p-a,v)/norm2(v);
    t=max(0.0L,min(1.0L,t));// 垂足超出线段时，取对应端点
    return dist(p,a+v*t);
}

ld segdist(Point a,Point b,Point c,Point d){
    if(segcross(a,b,c,d)) return 0;
    return min({disseg(a,c,d),disseg(b,c,d),
                disseg(c,a,b),disseg(d,a,b)});
}
```

上述操作均为 $O(1)$。若只允许两条线段的**内部严格交叉**，直接使用四个叉积的 `c1*c2<0 && c3*c4<0`，去掉前面的端点判断；这种定义也不包含共线重叠。

### 多边形面积与周长

顶点必须已经按边界顺时针或逆时针排列，适用于不自交的简单多边形，凹多边形也可以。不能将任意点集直接代入，也不能用按横坐标排序代替边界顺序。

设顶点依次为 $P_0,P_1,\ldots,P_{n-1}$，并令 $P_n=P_0$，鞋带公式为：

$$
S=\frac12\left|\sum_{i=0}^{n-1}P_i\times P_{i+1}\right|
$$

```c++
ld area2(const vector<Point>& p){
    // 有向面积的两倍：逆时针为正，顺时针为负
    int n=p.size();
    if(n<3) return 0;
    ld s=0;
    for(int i=1;i+1<n;i++){
        s+=cross(p[i]-p[0],p[i+1]-p[0]);
    }
    return s;// 与鞋带公式等价，平移到p[0]可减少大坐标相消
}

ld area(const vector<Point>& p){
    return fabsl(area2(p))/2;
}

ld perim(const vector<Point>& p){
    int n=p.size();
    ld ans=0;
    for(int i=0;i<n;i++) ans+=dist(p[i],p[(i+1)%n]);
    return ans;
}
```

**时间复杂度：** 均为 $O(n)$。整数坐标的面积可先用 `__int128` 累加两倍有向面积，再取绝对值；还需检查 $n$ 次累加后的范围。面积可能是半整数，不能直接整数除以 $2$。

### 点在多边形内

适用于简单多边形，允许凹多边形，顶点按边界顺序给出，顺逆时针均可。先判断边界，再统计边相对查询点的绕行次数；用半开区间处理纵坐标，避免射线经过顶点时重复计数。

```c++
// 返回0：外部；1：边界；2：内部
int inpoly(Point q,const vector<Point>& p){
    int n=p.size(),cnt=0;
    for(int i=0;i<n;i++){
        Point a=p[i],b=p[(i+1)%n];
        if(onseg(q,a,b)) return 1;
        int k=sgn(cross(b-a,q-a));
        int d1=sgn(a.y-q.y),d2=sgn(b.y-q.y);
        if(d1<=0 && d2>0 && k>0) cnt++;// 向上跨过查询点高度
        if(d2<=0 && d1>0 && k<0) cnt--;// 向下跨过查询点高度
    }
    if(cnt==0) return 0;
    return 2;
}
```

**时间复杂度：** 单次查询 $O(n)$。

### 圆的基础运算

圆心为 $O$、半径为 $r$ 的圆，面积为 $\pi r^2$，周长为 $2\pi r$。圆心到点的距离与半径比较，可判断点在圆内、圆上还是圆外。

```c++
struct Circle{
    Point o;
    ld r;
};

int pos(Point p,Circle c){
    // -1圆内，0圆上，1圆外；要求r>=0
    return sgn(dist(p,c.o)-c.r);
}

int pos(Point a,Point b,Circle c){
    // -1相交，0相切，1相离；要求a!=b、r>0
    return sgn(disline(c.o,a,b)-c.r);
}

// 要求两个圆的半径均大于0
// -1重合，0内含且不相切，1内切，2相交，3外切，4外离
int pos(Circle a,Circle b){
    ld d=dist(a.o,b.o);
    if(same(a.o,b.o) && sgn(a.r-b.r)==0) return -1;
    int outer=sgn(d-a.r-b.r);
    int inner=sgn(d-fabsl(a.r-b.r));
    if(outer>0) return 4;
    if(outer==0) return 3;
    if(inner<0) return 0;
    if(inner==0) return 1;
    return 2;
}

vector<Point> linecircle(Point a,Point b,Circle c){
    // 直线与圆的交点，要求a!=b、r>0
    Point h=proj(c.o,a,b);// 圆心在直线上的垂足
    ld d=dist(c.o,h);
    int k=sgn(d-c.r);
    if(k>0) return {};
    if(k==0) return {h};
    Point v=(b-a)/len(b-a);
    ld t=sqrtl(max(0.0L,(c.r-d)*(c.r+d)));
    return {h+v*t,h-v*t};
}
```

直线与圆相交时，垂足是两个交点的中点，由直角三角形得到交点到垂足的距离 $\sqrt{r^2-d^2}$。如果求**线段**与圆的交点，将结果用 `onseg()` 过滤；退化为点的线段单独判断该点是否在圆上。上述操作均为 $O(1)$。

### 轴对齐矩形相交面积

矩形的边平行于坐标轴。两个矩形分别用左下角和右上角表示，允许退化；交集的宽、高分别由两个坐标区间的交集得到。

```c++
ld rectarea(Point a1,Point a2,Point b1,Point b2){
    // 要求a1.x<=a2.x、a1.y<=a2.y，b同理
    ld w=max(0.0L,min(a2.x,b2.x)-max(a1.x,b1.x));
    ld h=max(0.0L,min(a2.y,b2.y)-max(a1.y,b1.y));
    return w*h;
}
```

**时间复杂度：** $O(1)$。边或角接触时面积为 $0$；若题目把接触也视为相交，需要另外检查横、纵两个闭区间是否均有交集。整数坐标可直接用整数计算，并检查面积乘法是否溢出。

### 凸包（Andrew）

凸包可以理解为用橡皮筋围住所有点后形成的边界。先按 $x$、再按 $y$ 排序，分别从左到右、从右到左维护下凸壳与上凸壳。每加入一个点，若末尾两点与新点没有形成左转，就弹出末尾点，直到恢复凸性。

返回的顶点按**逆时针**排列，起点为字典序最小的点，末尾不重复起点，**不保留同一直边上的中间点**。重复输入点会精确去重；全部共线时只返回两个端点，全相同时只返回一个点，空集返回空集。

```c++
vector<Point> hull(vector<Point> p){
    sort(p.begin(),p.end());
    p.erase(unique(p.begin(),p.end()),p.end());
    int n=p.size();
    if(n<=1) return p;
    vector<Point> lower,upper;
    for(int i=0;i<n;i++){
        while(lower.size()>=2){
            int m=lower.size();
            if(sgn(cross(lower[m-1]-lower[m-2],p[i]-lower[m-1]))>0) break;
            lower.pop_back();
        }
        lower.push_back(p[i]);
    }
    for(int i=n-1;i>=0;i--){
        while(upper.size()>=2){
            int m=upper.size();
            if(sgn(cross(upper[m-1]-upper[m-2],p[i]-upper[m-1]))>0) break;
            upper.pop_back();
        }
        upper.push_back(p[i]);
    }
    lower.pop_back();
    upper.pop_back();
    lower.insert(lower.end(),upper.begin(),upper.end());
    return lower;
}

// auto h=hull(p);
// ld area=area(h);
// ld perimeter=perim(h);
// 凸包退化成线段时，上述周长按来回计算，等于两端点距离的2倍
```

**时间复杂度：** 排序 $O(n\log n)$，扫描 $O(n)$；**空间复杂度：** $O(n)$。求出凸包后可以直接计算面积、周长，或判断点是否在凸包内。

整数坐标需要精确凸包时，将存储类型换为 `IPoint`，补上同样的字典序比较、精确相等比较，并将转向条件换成 `iturn(倒数第二点,最后一点,新点)>0`，不要先转浮点再判断。浮点输入接近共线时，是否弹点取决于误差阈值。

## 动态规划

### 背包

```c++
// 01背包二维
int w[N],v[N];
int dp[N][N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=0;j<=m;j++){
      if(v[i]<=j){
        dp[i][j]=max(dp[i-1][j],dp[i-1][j-v[i]]+w[i]);
      }
      else dp[i][j]=dp[i-1][j];
    }
  }
  cout<<dp[n][m]<<endl;
}
// 01背包一维
int dp[N];
int v[N],w[N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=m;j>=v[i];j--){
      dp[j]=max(dp[j],dp[j-v[i]]+w[i]);
    }
  }
  cout<<dp[m]<<endl;
}
// 完全背包二维
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=0;j<=m;j++){
      if(v[i]>j){
        dp[i][j]=dp[i-1][j];
      }
      else{
        dp[i][j]=max(dp[i-1][j],dp[i][j-v[i]]+w[i]);
      }
    }
  }
  cout<<dp[n][m]<<endl;
}
// 完全背包一维
int dp[N],v[N],w[N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=v[i];j<=m;j++){
      dp[j]=max(dp[j],dp[j-v[i]]+w[i]);
    }
  }
  cout<<dp[m]<<endl;
}
```

### 最长上升子序列

```c++
// 二分优化
signed main(){
  int n;
  cin>>n;
  vector<int> a(n+1);
  vector<int> q;
  for(int i=1;i<=n;i++) cin>>a[i];
  q.push_back(a[1]);
  for(int i=2;i<=n;i++){
    if(a[i]>q.back()) q.push_back(a[i]);
    else{
      int pos=lower_bound(q.begin(),q.end(),a[i])-q.begin();
      q[pos]=a[i];
    }
  }
  cout<<q.size()<<endl;
}
// 朴素做法
int dp[N];// 以i结尾的上升子序列长度的最大值
signed main(){
  cin>>n;
  for(int i=1;i<=n;i++) cin>>a[i];
  // 枚举每一个可能的结尾，看一下前面能够与他组成上升序列的长度的最大值是多少
  // 看一下例子 7 8 9 3 4 5 6 7 10
  // 上面例子就可以看出首先要初始化为1，然后枚举前面的每一个位置，取最长
  for(int i=1;i<=n;i++){
    dp[i]=1;
    for(int j=1;j<=i-1;j++){
      if(a[i]>a[j]) dp[i]=max(dp[i],dp[j]+1);
    }
  }
  int ans=0;
  // 最后一个位置不一定是最大的，显然的例子是前面所有数都比最后一个数字大，需要枚举
  for(int i=1;i<=n;i++) ans=max(ans,dp[i]);
  cout<<ans<<endl;
  return 0;
}
```

### 最长公共子序列

```c++
int dp[N][N];// 表示在a中的第i个位置和b中的第j个位置的最长公共子序列长度
signed main(){
  int n,m;
  cin>>n>>m;
  string a,b;
  cin>>a>>b;
  a=" "+a;
  b=" "+b;
  for(int i=1;i<=n;i++){
    for(int j=1;j<=m;j++){
      // 相等就取的是前一个状态+1
      if(a[i]==b[j]) dp[i][j]=dp[i-1][j-1]+1;
      // 不相等就要看是继承上方单元格还是左边的单元格，取最大的，也就是分别对应最长上升子序列包含ai不包含bj和包含bj不包含ai
      else dp[i][j]=max(dp[i-1][j],dp[i][j-1]);
    }
  }
  cout<<dp[n][m]<<endl;
}
```

## 杂项

### 随机数生成

```c++
// 随机数生成器（使用当前时间作为种子）
// 原理：mt19937 是梅森旋转算法，周期长达 2^19937-1，比 rand() 更均匀
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
// 生成 [l, r] 范围内的随机整数
// 公式：uniform_int_distribution<int>(l, r)(rng)
int randint(int l, int r) {
  return uniform_int_distribution<int>(l, r)(rng);
}
// 生成 [l, r] 范围内的随机浮点数（double）
// 公式：uniform_real_distribution<double>(l, r)(rng)
double randdouble(double l, double r) {
  return uniform_real_distribution<double>(l, r)(rng);
}
// 生成 0 或 1 的随机布尔值
bool randbool() {
  return randint(0, 1);
}
// 随机打乱数组（使用 shuffle，比 random_shuffle 更安全）
// 原理：Fisher-Yates 洗牌算法
template<typename T>
void shuffle(vector<T>& a) {
  shuffle(a.begin(), a.end(), rng);
}
// 从数组中随机选择一个元素
template<typename T>
T randchoice(const vector<T>& a) {
  return a[randint(0, a.size() - 1)];
}
// 生成随机排列（1~n 的排列）
vector<int> randperm(int n) {
  vector<int> res(n);
  for (int i = 0; i < n; i++) res[i] = i + 1;
  shuffle(res);
  return res;
}
```



### STL

**基础容器：queue/priority_queue/stack/deque**

1. `queue` 队列
    - `size()`
    - `empty()`
    - `push()` 向队尾插入一个元素
    - `front()` 返回队头元素
    - `back()` 返回队尾元素
    - `pop()` 弹出队头元素
2. `priority_queue` 优先队列（默认是大根堆）
    - `size()`
    - `empty()`
    - `push()` 插入一个元素
    - `top()` 返回堆顶元素
    - `pop()` 弹出堆顶元素
    - 定义成小根堆的方式：`priority_queue<int, vector<int>, greater<int>> q;`
3. `stack` 栈
    - `size()`
    - `empty()`
    - `push()` 向栈顶插入一个元素
    - `top()` 返回栈顶元素
    - `pop()` 弹出栈顶元素
4. `deque` 双端队列
    - `size()`
    - `empty()`
    - `clear()`
    - `front()/back()`
    - `push_back()/pop_back()`
    - `push_front()/pop_front()`
    - `begin()/end()`
    - `[]`

------

**有序关联容器：set/map/multiset/multimap**

基于平衡二叉树（红黑树），动态维护有序序列

- `size()`
- `empty()`
- `clear()`
- `begin()/end()`
- `++, --` 返回前驱和后继，时间复杂度 O (logn)

1. `set/multiset`

    - `insert()` 插入一个数

    - `find()` 查找一个数

    - `count()` 返回某一个数的个数

    - `erase()`

        1. 输入是一个数 x，删除所有 x，复杂度 `O(k + logn)`

        2. 输入一个迭代器，删除这个迭代器

          

    - `lower_bound(x)` 返回大于等于 x 的最小的数的迭代器

    - `upper_bound(x)` 返回大于 x 的最小的数的迭代器

2. `map/multimap`

    - `insert()` 插入的数是一个 pair

    - `erase()` 输入的参数是 pair 或者迭代器

    - `find()`

    - `[]` 注意 multimap 不支持此操作，时间复杂度是 O (logn)

    - `lower_bound()/upper_bound()`

3. 无序关联容器：`unordered_set, unordered_map, unordered_multiset, unordered_multimap`

    - 和上面类似，增删改查的时间复杂度是 O (1)

    - 不支持 `lower_bound()/upper_bound()`，迭代器的 `++`、`--`

------

**bitset 位集**

```cpp
bitset<100005> s;
```

- `count()` 返回有多少个 1
- `any()` 判断是否至少有一个 1
- `none()` 判断是否全为 0
- `set()` 把所有位置成 1
- `set(k, v)` 将第 k 位变成 v
- `reset()` 把所有位置成 0
- `flip()` 等价于 `~`
- `flip(k)` 把第 k 位取反
- 支持位运算：`-, &, |, ^, ~, >>, <<, ==, !=`

------

**其他 STL 库：vector/pair/string**

1. `vector` 变长数组（倍增的思想）

    - `size()` 返回元素个数
    - `empty()` 返回是否为空
    - `clear()` 清空
    - `front()/back()`
    - `push_back()/pop_back()`
    - `begin()/end()`
    - `[]` 下标访问   

2. `pair<int, int>`

    - `first` 第一个元素
    - `second` 第二个元素
    - 支持比较运算，以`first`为第一关键字，以`second`为第二关键字（字典序）

3. `string` 字符串

    - `size()/length()` 返回字符串长度
    - `empty()`
    - `clear()`
    - `substr(起始下标, 子串长度)` 返回子串
    - `c_str()` 返回字符串所在字符数组的起始地址

**array/tuple**

**array**

所有元素都是一个类型，支持下标访问

```cpp
// 初始化和赋值
array<int, 3> arr1 = {1, 2, 3};
array<int, 3> arr2 = {1};
arr2 = arr1;
// 元素访问
arr[0] = 10;
// 迭代器
// 这里auto写全是 vector<int>::iterator
for(auto it = arr.begin(); it != arr.end(); ++it)
for(int& x : arr)  
// 大小
size_t sz = arr.size();
// 排序
sort(arr.begin(), arr.end());
// 所有元素设置为同一个值
fill(arr.begin(), arr.end(), 0);
arr.fill(42);
```

**tuple**

三个变量类型可以不同

```cpp
// 创建和初始化
tuple<int, double, string> t1(1, 2.3, "hello");
auto t2 = make_tuple(4, 5.6, "world");
auto t3 = tuple(7, 8.9, "!");
// 元素访问
int i = get<0>(t1);
double d = get<1>(t1);
string s = get<2>(t1);
// 结构化绑定
auto [a,b,c] = t1;
```



### 内置函数

```c++
#define all(x) (x).begin(), (x).end()
```

| **函数**             | **标准写法**                                    | **核心用途 / 注意事项**                                      |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `unique`             | `a.erase(unique(all(a)), a.end());`             | 离散化去重，使用前必须先 `sort`                              |
| `accumulate`         | `accumulate(all(a), 0LL);`                      | 区间求和，算 `long long` 务必写 `0LL`                        |
| `nth_element`        | `nth_element(a.begin(), a.begin()+k, a.end());` | 求区间第 $k$ 大，完毕后 `a[k]` 为正确值，复杂度 $O(N)$       |
| `iota`               | `iota(all(a), 1);`                              | 递增填充，常用于并查集初始化 `fa[i]=i`                       |
| `fill`               | `fill(all(a), val);`                            | 区间赋任意值                                                 |
| `reverse`            | `reverse(all(a));`                              | 翻转容器/字符串                                              |
| `__builtin_popcount` | `__builtin_popcount(x)`                         | 求二进制中 `1` 的个数（`long long` 用 `__builtin_popcountll`） |
| `__builtin_clz`      | `31 - __builtin_clz(x)`                         | 求 $\lfloor\log_2 x\rfloor$                                  |
| `to_string` / `stoi` | `to_string(num)` / `stoi(s)`                    | 数字与字符串双向极速转换                                     |
| `string::find`       | `if (s.find(sub) != string::npos)`      (-1)    | 判断 `s` 是否包含子串 `sub`                                  |
| `clamp`              | `val = clamp(val, low, high);`                  | 限幅函数，防坐标越界                                         |
| `hypot`              | `hypot(dx, dy);`                                | 计算 $\sqrt{dx^2 + dy^2}$，防中间平方溢出                    |
| `next_permutation`   | `next_permutation(all(a))`                      | 生成下一个字典序排列，用前需先升序排序                       |
|                      |                                                 |                                                              |

- **自然对数 $\ln(x)$（以 $e$ 为底）：**

  使用 `std::log(x)`

- **常用对数 $\log_{10}(x)$（以 $10$ 为底）：**

  使用 `std::log10(x)`

- **二进制对数 $\log_2(x)$（以 $2$ 为底）：**

  使用 `std::log2(x)` （C++11 及以上支持）



 **$\lfloor \log_2(x) \rfloor$ 的三种常用求法**

```c++
// 1
inline int get_log2_safe(int x){
    int k=0;
    while((1<<(k+1))<=x)k++;
    return k;
}

// 2（需 x >= 1）
inline int get_log2_clz(int x){
    return 31-__builtin_clz(x);
}

// 3
inline int get_log2_lg(int x){
    return __lg(x);
}
```

**常用内置函数适用情况与依赖说明**

- **`__builtin_clz(x)`**：仅限 GCC/Clang，计算 32 位整数前导零个数。用 `31 - __builtin_clz(x)` 在 $O(1)$ 时间内求 $\lfloor \log_2(x) \rfloor$。传入 $x = 0$ 会触发未定义行为（程序崩溃/异常）。
- **`__lg(x)`**：仅限 GCC，直接返回 $\lfloor \log_2(x) \rfloor$（MSVC 或部分 Clang 环境不支持）。
- **`__gcd(a, b)` 与 `gcd(a, b)`**：`__gcd` 仅限 GCC/Clang（属于 GNU 拓展，非标准库）；`gcd` 需要 **C++17** 标准（位于 `<numeric>`）。

### 快速读入

```c++
int read(){
    int ret=0;
    char c=getchar();
    while(c<'0' || c>'9') c=getchar();
    while(c>='0' && c<='9'){
        ret=ret*10+(c-'0');
        c=getchar();
    }
    return ret;
}
```

```c++
#include<bits/stdc++.h>
using namespace std;
#define int long long 
#define endl '\n'
#define pii pair<int,int>

const int MOD=998244353;
const int N=2e5+10;
int a[N];

void solve(){
    
}

signed main(){
    ios::sync_with_stdio(false),cin.tie(nullptr);
    int T=1;
    // cin>>T;
    while(T--) solve();
    return 0;
}
```

* 外面开 里面分配
* `resize` 只能调整大小，不能清空原来数据 

```c++
diff.assign(n + 2, vector<int>(m + 2, 0));
pre.assign(n + 2, vector<int>(m + 2, 0));
```

### int128

| **类型**    | **位数** | **范围（近似值）**       | **范围（精确值）**      |
| ----------- | -------- | ------------------------ | ----------------------- |
| `int`       | 32-bit   | $\pm 2 \times 10^9$      | $[-2^{31}, 2^{31}-1]$   |
| `long long` | 64-bit   | $\pm 9 \times 10^{18}$   | $[-2^{63}, 2^{63}-1]$   |
| `__int128`  | 128-bit  | $\pm 1.7 \times 10^{38}$ | $[-2^{127}, 2^{127}-1]$ |

```c++
#include <iostream>
#include <string>
#include <algorithm>
#include <functional>

using namespace std;

namespace my128 {
    using int128 = __int128_t;

    int128 abs(const int128 &x) {
        return x > 0 ? x : -x;
    }

    // 修复后的输入重载
    istream &operator>>(istream &it, int128 &j) {
        string s;
        if (!(it >> s)) return it; // 读取字符串
        
        int128 ans = 0;
        bool f = false;
        int i = 0;
        
        if (s[0] == '-') {
            f = true;
            i = 1;
        } else if (s[0] == '+') {
            i = 1;
        }
        
        for (; i < s.size(); ++i) {
            if (s[i] >= '0' && s[i] <= '9') {
                ans = ans * 10 + (s[i] - '0');
            } else {
                break; // 遇到非数字字符停止
            }
        }
        
        j = f ? -ans : ans;
        return it;
    }

    // 输出重载（保持原样，这个递归写法是对的）
    ostream &operator<<(ostream &os, const int128 &j) {
        if (j == 0) return os << "0";
        string ans;
        function<void(int128)> write = [&](int128 x) {
            if (x < 0) ans += '-', x = -x;
            if (x > 9) write(x / 10);
            ans += (char)(x % 10 + '0');
        };
        int128 temp = j;
        if (temp < 0) {
            ans += '-';
            temp = -temp;
        }
        write(temp);
        return os << ans;
    }
}
using namespace my128;
```

**函数支持**：`abs()` 这种标准库函数可能不支持 `__int128`，建议自己写：`auto my_abs = [](int128 x) { return x < 0 ? -x : x; };`。

**速度测试**：`__int128` 的乘法和加减法很快，但**除法和取模**相对较慢（比 `long long` 慢数倍），在有严格时限且大量取模的题目中要小心，并且不能直接cin/cout，需要转换成字符串（但一般只有中间过程会爆 long long，所以最后答案转成 long long 输出即可）。

### getline

* 使用 `getline` 读取整行，不要忘记吸收上一行行末换行符
* 循环內部 `getline(cin,line)` 整行读取
* `stringstream ss(line)` 把字符串 line 包装成一个输入流 ss ，ss 和 cin 一样，会跳过空格
* **`ss >> l >> r` 与 `ss >> v`**：
  * 先用 `ss >> l >> r` 提取前两个数
  * 再利用 `if (ss >> v)` 进行尝试提取：如果这一行还有第 3 个数，提取成功返回 `true`（说明是修改）

```c++
int m;
cin>>m;
string line;
getline(cin,line);

while(m--){
    int l,r,k;
    string line;
    getline(cin,line);
    stringstream ss(line);
    ss>>l>>r;

    l++;
    r++;
    // 修改
    if(ss>>k){
        if(l<=r){
            seg.add(1,l,r,k);
        }
        else{
            seg.add(1,l,n,k);
            seg.add(1,1,r,k);
        }
    }   
    // 查询
    else{
        int ans=1e18;
        if(l<=r){
            ans=seg.mn(1,l,r);
        }
        else{
            ans=min(ans,seg.mn(1,1,r));
            ans=min(ans,seg.mn(1,l,n));
        }
        cout<<ans<<endl;
    } 

}
```



### 重载比较运算符

1. **sort**
   * **排序规则**：`sort` 默认使用 `operator<`（或你提供的自定义比较器）来决定顺序。
     当 `a < b` 返回 `true` 时，表示 **`a` 应排在 `b` 的前面**（即按升序排列）。
   * **重载 `operator<` 的语义**：
     `*this` 对应左侧元素 `a`，`o` 对应右侧元素 `b`。
   * 例如，若想让解题多（`cnt` 大），罚时少（`p` 小）的队伍排在最前面（`a[0]`）：

```c++
bool operator<(const Node& o) const {
    if (cnt != o.cnt) return cnt > o.cnt; // 题多 排前面 返回true
    return p < o.p;                       // 罚时少 排前面 返回true
}
```

如果比较两个结构体元素，需要使用对应的重载符号，重载大于号就用大于号比较，反之用小于号比较

2. **priority_queue**

   `priority_queue<T>` 底层使用 `less<T>` 作为比较器（即 `operator<`），其行为与 `sort` **相反**：

   * 在优先队列中，比较器用于判断 **优先级**。
     若 `a < b` 返回 `true`，则队列认为 **`a` 的优先级低于 `b`**（即 `a` 更“小”），于是把 `a` 沉到堆底，而 `b` 浮到堆顶（`top()`）。
   * 因此，默认情况下，**堆顶是 `operator<` 意义下的“最大”元素**（因为较大的元素会被认为优先级更高，被推到顶部）。
