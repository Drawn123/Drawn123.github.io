---
title: "2024山东省赛 A"
date: 2026-05-13
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"

difficulty: ""
platform:

problem_id: 
weight: 10
pinned: false
draft: false
---

## 2024山东省赛 

[Problem - A - Codeforces](https://codeforces.com/gym/105385/problem/A)

**标签：**`二分答案` `贪心`

### 题意

n 台打印机，每台每 ti 秒打 1 份；连续打 li 份后冷却 wi 秒。所有机器同时工作，求凑够至少 k 份的最少时间。

### 思路

1. 答案具有单调性：时间越久打印越多，直接**二分答案**枚举总时间 mid。
2. 校验函数：算每台机器在 mid 秒内能打出多少份，求和判断是否 ≥k。
3. 单台机器计算：
    - 完整周期时长：$cyc=ti⋅li+wi$
    - 完整周期数：$full=mid/cyc$，产出 $full⋅li$
    - 剩余时间：$rem=mid%cyc$，能打 $rem/ti$ 份
4. 二分缩区间，求出最小合法时间。

* 时间复杂度为 $O(n\log INF)$

### AC 代码

```c++
int n,k;
struct p{
    int t,l,w;
};
vector<p> e;

// 检查是否能在mid分钟内打完k份
// 每一台再mid时间内能打的总数是否大于等于k就行了
bool check(int mid){
    int cnt=0;
    for(int i=1;i<=n;i++){
        int tt=e[i].t*e[i].l+e[i].w;
        int rem=mid%tt;
        int c=mid/tt;

        cnt += c*e[i].l;// ...................
        if(rem>=e[i].t*e[i].l){
            cnt += e[i].l;
        }
        else{
            cnt += rem/e[i].t;
        }
        
        if(cnt>=k) return true;
    }
    return cnt>=k;
}
void solve(){
    cin>>n>>k;
    e.assign(n+1,{0,0,0});// .
    for(int i=1;i<=n;i++){
        cin>>e[i].t>>e[i].l>>e[i].w;
    }  
    int l=0,r=2e18;// .上界应该是2e18吧
    int ans=0;
    while(l<=r){
        int mid=(l+r)/2;
        if(check(mid)){
            r=mid-1;
            ans=mid;
        }
        else l=mid+1;
    }
    cout<<ans<<endl;
}
```