---
title: "2023山东省赛 D"
date: 2026-05-16
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"
  - "排序 | Sorting"

difficulty: ""
platform:

problem_id: 
weight: 10
pinned: false
draft: false
---



## 2023山东省赛

 [Problem - D - Codeforces](https://codeforces.com/gym/104417/problem/D)

### 题意

每人有速度vi、体重wi，一人最多背一人，被背者不能再背人。

i背j：

$wi≥wj$，速度=vi

$wi<wj$，速度=vi−(wj−wi)

团队速度为未被背负人员的最小速度，求最大团队速度。

### 思路

1. 二分答案枚举团队速度mid。

1. 若vi<mid：必须被背负，存入体重wi。

1. 若vi≥mid：可独自走，能背负的最大体重： $mxwi=max(wi, vi+wi−mid)$

1. 把待背体重、可背最大体重**降序排序**，大配大匹配，全部匹配成功则mid可行。


### AC 代码

```c++
struct p{
    int v,w;
};
int n;
vector<p> e;
bool check(int mid){
    vector<int> suf;
    vector<int> pre;
    for(int i=0;i<n;i++){
        if(e[i].v<mid){
            pre.push_back(e[i].w);
        }
        else{
            int mxw=max(e[i].w,e[i].v+e[i].w-mid);
            suf.push_back(mxw);
        }
    }
    sort(pre.begin(),pre.end(),greater<int>());
    sort(suf.begin(),suf.end(),greater<int>());

    if(pre.size()>suf.size()) return false; 
    for(int i=0;i<pre.size();i++){
        if(suf[i]<pre[i]) return false;
    }
    return true;
}
void solve(){
    cin>>n;
    e.clear();
    e.resize(n);// .
    int mx=0;
    for(int i=0;i<n;i++){
        cin>>e[i].v>>e[i].w;
        mx=max(mx,e[i].v);
    }
    // sort(e.begin(),e.end(),[](p a,p b){
    //     if(a.v+a.w==b.v+b.w) return a.v<b.v;
    //     return a.v+a.w<b.v+b.w;
    // });
    sort(e.begin(),e.end(),[](p a,p b){
        return a.v<b.v;
    });
    int l=0,r=mx;
    int ans=0;
    while(l<=r){
        int mid=(l+r)/2;
        if(check(mid)){
            ans=mid;
            l=mid+1;
        }
        else r=mid-1;
    }
    cout<<ans<<endl;
}
```