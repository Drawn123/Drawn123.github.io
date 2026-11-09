---
title: "CF 1514C Product 1 Modulo N"
date: 2026-11-05
knowledge_id: "solution-cf-1514c"
url: "/algorithm/solutions/math/cf-1514c/"
tags:
  - "数论 | Number Theory"
  - "构造 | Construction"
platform:
  - "Codeforces"
problem_id: "CF1514C"
draft: false
---

## CF 1514C Product 1 Modulo N

[CF 1514C Product 1 Modulo N](https://codeforces.com/contest/1514/problem/C)

### 题意

从 $[1,2,\ldots,n-1]$ 中选出尽量多的数，使乘积模 $n$ 等于 $1$，按升序输出。$2\le n\le10^5$。

### 思路

1. 选出的每个数都必须与 $n$ 互质，否则乘积不可能模 $n$ 余 $1$。
2. 先选出所有与 $n$ 互质的数，记乘积模 $n$ 为 `cur`。如果 `cur=1`，已经取到了全部可选元素。
3. 否则删掉 `cur` 本身。它也与 $n$ 互质，所以一定在已选集合中；删去后的乘积模 $n$ 为 $cur\cdot cur^{-1}=1$。全部选取不合法，而少一个就能做到，因此数量最大。

**时间复杂度：**$O(n\log n)$。

### AC代码

```c++
void solve(){
    int n;
    cin>>n;

    int cur=1;
    vector<int> a(n);
    for(int i=0;i<n;i++){
        a[i]=i+1;
    }
    vector<int> vis(n,0);
    int cnt=0;
    for(int i=0;i<n;i++){
        if(__gcd(a[i],n)==1){
            vis[i]=1;
            cnt++;
            cur=(cur*a[i])%n;
        }
    }

    if(cur==1){
        cout<<cnt<<endl;
        for(int i=0;i<n;i++){
            if(vis[i]){
                cout<<a[i]<<" ";
            }
        }
        cout<<endl;
    }
    else{
        for(int i=0;i<n;i++){
            if(a[i]==cur){
                cnt--;
                vis[i]=0;
            }
        }
        cout<<cnt<<endl;
        for(int i=0;i<n;i++){
            if(vis[i]){
                cout<<a[i]<<" ";
            }
        }
        cout<<endl;
    }
}
```
