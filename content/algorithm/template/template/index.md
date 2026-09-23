---
title: "ICPC 算法模板"
date: 2025-12-23
lastmod: 2026-09-20
categories:
  - "总结 | conclusion"
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



## 数学

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
