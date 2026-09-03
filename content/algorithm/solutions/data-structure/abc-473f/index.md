---
title: "ABC 473F A/AB Insertion"
date: 2026-09-01
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "数据结构 | Data Structure"
  - "线段树 | Segment Tree"
  - "前缀和 | Prefix Sum"

difficulty: ""
platform:
  - "AtCoder"
problem_id: "ABC473F"
weight: 10
pinned: false
draft: false
---

## F - A/AB Insertion

[F - A/AB Insertion](https://atcoder.jp/contests/abc473/tasks/abc473_f)

**核心观察：**

1. 令 `A=+1`、`B=-1`。插入单个 `A` 会让从插入位置起的部分前缀和 $+1$；插入 `AB` 相当于在该处先 $+1$ 再 $-1$，任何前缀和都不会变小。所以能构造出的串，所有前缀和都非负。
2. 反过来，若所有前缀和都非负，看第一个 `B`：它左边全是 `A`，且它前面至少有一个 `A`（否则到这里前缀和已经为 $-1$），因此它左边相邻的字符一定是 `A`，删掉这个相邻的 `AB` 后其他前缀和都不变；重复到没有 `B`，再删掉所有 `A`。删除过程倒过来就是插入过程，所以「所有前缀和都非负」也是充分条件。
3. 对子串 $S[l..r]$，设 `pre[i]` 为全局前缀和，子串内部前缀和为 $pre[t]-pre[l-1]$，合法当且仅当 $pre[t]$ 在 $t\in[l-1,r]$ 内的最小值等于 $pre[l-1]$。

**算法步骤：**

1. 建出前缀和数组，用线段树维护区间最小值。
2. 类型 1 把位置 $i$ 的字符改掉时，只有 $pre[i..N]$ 会整体变化，做一次区间加。
3. 类型 2 查询 $[l-1,r]$ 的最小值，与 $pre[l-1]$ 比较后输出 `Yes`/`No`。

**时间复杂度：**$O((N+Q)\log N)$

```c++
// 支持单点/区间的加、乘、覆盖与查询
struct SegTree {
    struct Node {
        int l,r;              
        int mn;          
        int lazy_add; 
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
        tree[p].mn=min(tree[ls(p)].mn,tree[rs(p)].mn);
    }

    // 应用“加法”修改
    void apply_add(int p,int val) {
        tree[p].mn+=val;

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
            tree[p].mn=arr[l];
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

    // 区间/单点最小值查询
    int mn(int p,int ql,int qr) {
        if(ql<=tree[p].l && tree[p].r<=qr) return tree[p].mn;
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        int res=LLONG_MAX;
        if(ql<=mid) res=min(res,mn(ls(p),ql,qr));
        if(qr>mid) res=min(res,mn(rs(p),ql,qr));
        return res;
    }
};

void solve(){
    int n;
    string s;
    cin>>n>>s;
    s=" "+s;
    vector<int> pre(n+1);

    for(int i=1;i<=n;i++){
        int k;
        if(s[i]=='A') k=1;
        else k=-1;
        pre[i]=pre[i-1]+k;
    }
    
    SegTree seg(pre);

    int q;
    cin>>q;
    while(q--){
        int op;
        cin>>op;
        if(op==1){
            int i;
            char c;
            cin>>i>>c;
            int od,nw;
            if(s[i]=='A') od=1;
            else od=-1;
            if(c=='A') nw=1;
            else nw=-1;
            seg.add(1,i,n,nw-od);
            s[i]=c;// .
        }
        else{
            int l,r;
            cin>>l>>r;
            int res=seg.mn(1,l,r);
            int ll;
            if(l>1) ll=seg.mn(1,l-1,l-1);
            else ll=0;
            if(res<ll){
                cout<<"No"<<endl;
                continue;
            }
            cout<<"Yes"<<endl;
        }
    }

}
```

