---
title: "2024山东省赛 C"
date: 2026-05-14
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "贪心 | Greedy"
  - "排序 | Sorting"
  - "ICPC"
  - "数学 | Math"

difficulty: ""
platform:
problem_id: 
weight: 10
pinned: false
draft: false
---



## 2024山东省赛

 [Problem - C - Codeforces](https://codeforces.com/gym/105385/problem/C)

### 题意

给定 n 条数轴线段，用 k 种颜色染色，要求**同颜色线段互不重叠**，求合法染色总方案数，答案对 998244353 取模。

两线段有公共点即判定为重叠。

### 思路

1. 将所有线段**按左端点从小到大排序**，从左往右依次处理。

2. 用 `multiset` 维护**当前所有与当前线段重叠的线段右端点**。

3. 遍历每条线段：

    - 不断删除集合中**右端点 < 当前线段左端点**的线段，这些线段已无重叠冲突。
    - 集合内剩余元素数量 = 当前已占用的颜色数量。
    - 当前线段可选颜色数：k− 集合大小。
    - 总方案数累乘该可选数量，再把当前线段右端点插入集合。
4. 全部处理完毕即为最终答案。

* 原理：同一时刻互相重叠的线段必须颜色互不相同，有多少条重叠线段就占用多少种颜色，剩下颜色随意选，乘法原理统计总方案。

* 复杂度：排序 $O(nlogn)$，每条线段出入集合各一次，总复杂度 $O(nlogn)$

### AC 代码

```c++
const int MOD=998244353;
struct p{
    int l,r;
};
int n,k;
vector<p> e;

/*
按右端点排序好像不对
在容器里的得全都重叠才成立  
对同一个右端点找左端点
可以按照左端点排序 维护右端点 重叠了就加进来 不重叠了就删掉
已经排好序了 只会进来一次
*/    
void solve(){
    cin>>n>>k;
    e.resize(n,{0,0});
    for(int i=0;i<n;i++){
        cin>>e[i].l>>e[i].r;
    }
    sort(e.begin(),e.end(),[](p x,p y){
        return x.l<y.l;
    });
    int ans=1;
    multiset<int> re;// 重叠的右端点 
    for(auto x:e){
        int ll=x.l,rr=x.r;
        while(!re.empty() && *re.begin()<ll){// .
            re.erase(re.begin());
        }// .
        // cout<<ll<<" "<<rr<<endl;
        int cnt=(k-re.size()+MOD)%MOD;
        ans=(ans*cnt)%MOD;
        re.insert(rr);
        // cout<<"================"<<endl;
        // cout<<cnt<<" "<<ans<<endl;
    }
    cout<<ans<<endl;
}
```