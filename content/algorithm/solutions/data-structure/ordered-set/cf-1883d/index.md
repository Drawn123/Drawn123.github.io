---
title: "CF 1883D In Love"
date: 2026-11-05
knowledge_id: "solution-cf-1883d"
url: "/algorithm/solutions/data-structure/cf-1883d/"
tags:
  - "数据结构 | Data Structure"
platform:
  - "Codeforces"
problem_id: "CF1883D"
draft: false
---

## CF 1883D In Love

[CF 1883D In Love](https://codeforces.com/contest/1883/problem/D)

### 题意

维护一个允许重复的闭区间集合，支持插入区间、删除一条已存在的区间。每次操作后判断是否存在两条不相交的区间。$q\le10^5$。

### 思路

存在不相交区间，当且仅当最小右端点小于最大左端点。

用两个 `multiset` 分别维护左右端点，直接比较 `*r.begin()` 和 `*l.rbegin()`。端点相等仍算相交；删除时用迭代器只删一个，不能把重复值全部删掉。

**时间复杂度：**每次操作 $O(\log q)$。

### AC代码

```c++
void solve(){
    int q;
    cin>>q;
    multiset<int> l,r;
    while(q--){
        int ll,rr;
        char op;
        cin>>op>>ll>>rr;
        if(op=='+'){
            l.insert(ll);
            r.insert(rr);
        }
        else{
            l.erase(l.find(ll));
            r.erase(r.find(rr));
        }
        if(!l.empty() && *r.begin()<*l.rbegin()){
            cout<<"YES"<<endl;
        }
        else{
            cout<<"NO"<<endl;
        }
    }
}
```
