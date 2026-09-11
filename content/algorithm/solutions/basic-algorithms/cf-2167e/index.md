---
title: "CF 1062 div4 E"
date: 2026-04-20
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"

difficulty: ""
platform:
  - "Codeforces"
problem_id: "CF2167E"
weight: 10
pinned: false
draft: false
---

## CF 1062 div4 E

[Problem - E - Codeforces](https://codeforces.com/contest/2167/problem/E)

**标签：**`二分答案` `贪心`**Binary Search / Ternary Search**

### 思路

* 题意：给了好朋友的位置， 还有传送门的数量，好朋友可以通过传送门立刻到这个人身边，让你找传送门的位置，要求最快到达这个人的时间最长（最小值最大），第一反应二分答案

* 单调性：

    - 若存在一种放置方案，使得所有朋友到最近传送点的距离都至少为 `d`，那么对于任意 `d' < d`，该方案同样满足条件
    - 因此，我们可以对目标距离 `d` 进行二分查找，寻找**最大的可行值**。 

* 二分范围：`d ∈ [0, x]`。对于每个候选的 `d`，我们通过 `check(d)` 函数判断能否在 `[0, x]` 内选出至少 `k` 个满足条件的传送点。

* `check(d)` 函数

    对于固定的 `d`，每个朋友 `a_i` 周围半径为 `d` 的区域都不能放置传送点，否则该朋友的最短距离将小于 `d`。将朋友位置排序后，安全的可放置区间由三部分组成：

    1. **左边界区间**：`[0, a[0] - d]`
    2. **相邻朋友之间的区间**：`[a_{i-1} + d, a_i - d]`，`i = 1, 2, ..., n-1`
    3. **右边界区间**：`[a_{n-1} + d, x]`

     只需统计这些区间内的整数点个数之和，若总数 `≥ k` 则 `d` 可行。

* 二分结束之后会得到一个值，这个值就是最大的 d ，我们可以根据这个最大的 d 去找满足条件的位置

* 注意：当 `d = 0` 时，相邻区间的端点会重合（如 `a_{i-1}` 同时出现在前后两个区间中），直接累加会造成重复计数，导致误判，因此，我们在遍历区间时需要维护一个变量 `last`，表示上一个已占用区间的右端点，每个新区间的有效左端点至少为 `last + 1`，保证计数不重复（wa了好几发）

* 答案构造：

    得到最大 `d` 后，我们按照与 `check` 完全相同的区间顺序选取 `k` 个点即可。用变量 `cur` 记录下一个可用的最小坐标，避免输出重复

* 时间复杂度：

    - 二分次数：`O(log x)` ≈ 30 次。
    - 每次 `check`：`O(n)`。
    - 构造输出：`O(n + k)`。
    - 总时间复杂度：`O(T * (n + k) * log x)`

---

### AC代码

```c++
int n,k,x;
vector<int> a;
// 刚才passed是我的幻觉吗 咋编译错误
// 好难写啊
// >=d检查一下每一个d是否满足能够放下k个
bool check(int d){
    int cnt=0;
    int n=a.size();
    int last=-1;

    // 前半段 
    int l=0,r=a[0]-d;
    l=max(l,last+1);// .
    if(l<=r){
        cnt += (r-l+1);
        last=r;// .
    }
    // 中间
    for(int i=1;i<n;i++){
        int l=a[i-1]+d;
        int r=a[i]-d;
        l=max(l,last+1);
        if(l<=r){
            cnt += (r-l+1);
            last=r;
        }
        if(cnt>=k) return true;
    }
    // 后半段
    l=a[n-1]+d,r=x;
    l=max(l,last+1);
    if(l<=r) cnt += (r-l+1);
    
    if(cnt>=k) return true;
    else return false;
}
void solve(){
    cin>>n>>k>>x;
    a.resize(n);
    for(int i=0;i<n;i++) cin>>a[i];
    sort(a.begin(),a.end());
    int l=0,r=x;
    int ans=0;
    while(l<=r){
        int mid=(l+r)/2;
        if(check(mid)){
            ans=mid;// 取尽可能大的
            l=mid+1;
        }
        else r=mid-1;
    }
    int d=ans;
    // 构造答案
    vector<int> res;
    int cur=0;// 下一个允许的最小坐标
    // 开头
    l=0;
    r=a[0]-d;
    for(int pos=l;pos<=r && res.size()<k;pos++){
        res.push_back(pos);
        cur=pos+1;
    }
    // 中间
    for(int i=1;i<a.size() && res.size()<k;i++){
        int l=a[i-1]+d;
        int r=a[i]-d;
        l=max({l,cur,0ll});
        r=min(r,x);
        for(int pos=l;pos<=r && res.size()<k;pos++){
            res.push_back(pos);
        }
        cur=max(cur,r+1);
    }
    // 结尾
    l=max(a[n-1]+d,cur);
    r=x;
    for(int pos=l;pos<=r && res.size()<k;pos++){
        res.push_back(pos);
    }
    for(int v:res){
        cout<<v<<" ";
    }
    cout<<endl;
}
```













