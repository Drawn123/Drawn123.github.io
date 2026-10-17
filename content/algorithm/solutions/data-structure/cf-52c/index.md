---
knowledge_id: "solution-cf-52c"
url: "/algorithm/solutions/data-structure/cf-52c/"
title: "CF 52C Circular RMQ"
date: 2026-08-31
lastmod: 2026-10-17
tags:
  - "数据结构 | Data Structure"
  - "线段树 | Segment Tree"
  
difficulty: ""
platform:
  - "Codeforces"
problem_id: ""
weight: 10
pinned: false
draft: false
---

## CF 52C Circular RMQ 

[Problem - C - Codeforces](https://codeforces.com/contest/52/problem/C)

### 题意

给定一个下标为 $0\sim n-1$ 的环形数组，处理两种操作：

- 一行两个整数 $l,r$：查询环形区间 $[l,r]$ 内的最小值。
- 一行三个整数 $l,r,v$：把这个区间内的每个数都加上 $v$。

当 $l\le r$ 时，区间就是普通的 $[l,r]$；当 $l>r$ 时，区间从 $l$ 走到数组末尾，再从 $0$ 走到 $r$，即 $[l,n-1]\cup[0,r]$。

对每次查询输出最小值。$n,m\le2\times10^5$，初值和单次增量的绝对值不超过 $10^6$，累计修改后的值需要使用 `long long` 保存。

### 思路

维护区间最小值和区间加懒标记。跨越数组末尾的操作拆成两个普通区间，修改时分别加上增量，查询时取两段最小值的较小值。

​	线段树板子题，但需要注意以下几点：

1. 题目是环形修改和查询，要加左右边界大小判断

2. 输入形式
   * 使用 `getline` 读取整行，不要忘记吸收上一行行末换行符
   * 循环內部 `getline(cin,line)` 整行读取
   * `stringstream ss(line)` 把字符串 line 包装成一个输入流 ss ，ss 和 cin 一样，会跳过空格
   * **`ss >> l >> r` 与 `ss >> v`**：
     * 先用 `ss >> l >> r` 提取前两个数
     * 再利用 `if (ss >> v)` 进行尝试提取：如果这一行还有第 3 个数，提取成功返回 `true`（说明是修改）

3. 原题本身就是 0-Based 下标

**时间复杂度：**建树 $O(n)$，每次操作 $O(\log n)$，总计 $O(n+m\log n)$；空间复杂度 $O(n)$。

### AC代码

以下省略头文件、命名空间和主函数，单组输入调用一次 `solve()`。

```c++
#define int long long
#define ls(p) (p<<1)
#define rs(p) (p<<1|1)

struct SegTree {
    struct Node{
        int l,r,mn,lazy_add;
    };
    vector<Node> tree;
    vector<int> arr;

    SegTree(const vector<int>& a){
        arr=a;
        int n=a.size()-1;
        tree.resize((n+5)<<2);
        build(1,1,n);
    }

    void push_up(int p){
        tree[p].mn=min(tree[ls(p)].mn,tree[rs(p)].mn);
    }

    void apply_add(int p,int val){
        tree[p].mn+=val;
        tree[p].lazy_add+=val;
    }

    void push_down(int p){
        if(tree[p].lazy_add){
            apply_add(ls(p),tree[p].lazy_add);
            apply_add(rs(p),tree[p].lazy_add);
            tree[p].lazy_add=0;
        }
    }

    void build(int p,int l,int r){
        tree[p]={l,r,0,0};
        if(l==r){
            tree[p].mn=arr[l];
            return;
        }
        int mid=(l+r)>>1;
        build(ls(p),l,mid);
        build(rs(p),mid+1,r);
        push_up(p);
    }

    void add(int p,int ql,int qr,int val){
        if(ql<=tree[p].l && tree[p].r<=qr){
            apply_add(p,val);
            return;
        }
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        if(ql<=mid) add(ls(p),ql,qr,val);
        if(qr>mid) add(rs(p),ql,qr,val);
        push_up(p);
    }

    int mn(int p,int ql,int qr){
        if(ql<=tree[p].l && tree[p].r<=qr) return tree[p].mn;
        push_down(p);
        int mid=(tree[p].l+tree[p].r)>>1;
        int res=1e18;
        if(ql<=mid) res=min(res,mn(ls(p),ql,qr));
        if(qr>mid) res=min(res,mn(rs(p),ql,qr));
        return res;
    }
};

void solve(){
    int n;
    cin>>n;
    vector<int> a(n+1);
    for(int i=1;i<=n;i++) cin>>a[i];

    SegTree seg(a);
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
            // 也可能跨界
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
}
```

