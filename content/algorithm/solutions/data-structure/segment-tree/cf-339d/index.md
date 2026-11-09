---
title: "CF 339D Xenia and Bit Operations"
date: 2026-11-07
knowledge_id: "solution-cf-339d"
url: "/algorithm/solutions/data-structure/cf-339d/"
tags:
  - "线段树 | Segment Tree"
  - "位运算 | Bit Manipulation"
platform:
  - "Codeforces"
problem_id: "CF339D"
draft: false
---

## CF 339D Xenia and Bit Operations

[CF 339D Xenia and Bit Operations](https://codeforces.com/contest/339/problem/D)

### 题意

给定长度为 $2^n$ 的数组。先对相邻两个数按位或，再对新数组的相邻两个数按位异或，交替操作直到剩下一个数。每次单点修改后，输出这个结果。$n\le17$，修改次数 $m\le10^5$。

### 思路

整个计算过程正好是一棵满二叉树，直接用线段树维护。

叶子高度为 $0$，父节点高度加一；奇数高度做或运算，偶数高度做异或运算。单点修改后沿祖先重新合并，根节点就是答案。

**时间复杂度：**建树 $O(2^n)$，每次修改 $O(n)$。

### AC代码

```c++
// 单点覆盖修改，逐层交替或、异或运算
struct SegTree {
    // 节点定义
    struct Node {
        int l,r;
        int sum;
        int h;// 叶子高度为0，向上一层加1
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
        if(tree[p].h&1)
            tree[p].sum=tree[ls(p)].sum|tree[rs(p)].sum;
        else
            tree[p].sum=tree[ls(p)].sum^tree[rs(p)].sum;
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
        tree[p].h=tree[ls(p)].h+1;
        push_up(p);
    }

    // 单点覆盖修改，调用时传ql=qr=pos
    void set(int p,int ql,int qr,int val) {
        if(ql<=tree[p].l && tree[p].r<=qr) {
            tree[p].sum=val;
            return;
        }
        int mid=(tree[p].l+tree[p].r)>>1;
        if(ql<=mid) set(ls(p),ql,qr,val);
        if(qr>mid) set(rs(p),ql,qr,val);
        push_up(p);
    }

};
void solve(){
    int n,m;
    cin>>n>>m;
    int len=1<<n;
    vector<int> a(len+1);
    for(int i=1;i<=len;i++) cin>>a[i];

    SegTree seg(a);
    while(m--){
        int pos,val;
        cin>>pos>>val;
        seg.set(1,pos,pos,val);
        cout<<seg.tree[1].sum<<endl;
    }
}
```
