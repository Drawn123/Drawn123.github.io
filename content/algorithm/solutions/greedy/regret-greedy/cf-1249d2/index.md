---
title: "CF 1249D2 Too Many Segments (hard version)"
date: 2026-11-07
knowledge_id: "solution-cf-1249d2"
url: "/algorithm/solutions/greedy/cf-1249d2/"
tags:
  - "贪心 | Greedy"
  - "排序 | Sorting"
platform:
  - "Codeforces"
problem_id: "CF1249D2"
draft: false
---

## CF 1249D2 Too Many Segments (hard version)

[CF 1249D2 Too Many Segments (hard version)](https://codeforces.com/contest/1249/problem/D2)

### 题意

给定 $n$ 条闭区间，删除尽量少的区间，使每个整数点最多被 $k$ 条区间覆盖。输出删除数量及原编号，方案任意。$n\le2\times10^5$。

### 思路

按左端点排序，用 `set` 维护当前仍覆盖扫描位置的区间，按右端点排序。

加入新区间前，先移除右端点小于当前左端点的区间。如果加入后数量超过 $k$，就删除右端点最远的一条。

此时至少要删一条，而删掉延伸最远的区间，对后续位置留下的覆盖压力最小。若某个方案删的是另一条，交换为删除最远的一条也不会增加之后的覆盖数。

**时间复杂度：**$O(n\log n)$。

### AC代码

```c++
struct p{
    int l,r,id;
};

void solve(){
    int n,k;
    cin>>n>>k;
    vector<p> a(n);
    for(int i=0;i<n;i++){
        cin>>a[i].l>>a[i].r;
        a[i].id=i+1;
    }

    sort(a.begin(),a.end(),[](p a,p b){
        return a.l<b.l;
    });

    set<pii> s;// 右端点 编号
    vector<int> ans;
    for(auto x:a){
        while(!s.empty() && s.begin()->first<x.l){
            s.erase(s.begin());
        }

        s.insert({x.r,x.id});

        // 删除右端点最大的
        if(s.size()>k){
            auto it=s.end();
            it--;
            ans.push_back(it->second);
            s.erase(it);
        }
    }
    cout<<ans.size()<<endl;
    for(int id:ans){
        cout<<id<<" ";
    }
    cout<<endl;
}
```
