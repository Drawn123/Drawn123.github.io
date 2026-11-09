---
title: "CF 1798C Candy Store"
date: 2026-11-05
knowledge_id: "solution-cf-1798c"
url: "/algorithm/solutions/greedy/cf-1798c/"
tags:
  - "贪心 | Greedy"
  - "数论 | Number Theory"
platform:
  - "Codeforces"
problem_id: "CF1798C"
draft: false
---

## CF 1798C Candy Store

[CF 1798C Candy Store](https://codeforces.com/contest/1798/problem/C)

### 题意

第 $i$ 种糖果有 $a_i$ 个，单价 $b_i$。可以选 $d_i\mid a_i$，每包放 $d_i$ 个，包价为 $b_id_i$。连续若干种糖果包价相同就能共用一个价签，求最少价签数。多组测试，$\sum n\le2\times10^5$，$a_i\le10^9$，$b_i\le10^4$。

### 思路

1. 设一段的统一包价为 $k$，则对段内每个 $i$，都要有 $b_i\mid k$ 且 $k\mid a_ib_i$。
2. 维护 $l=\operatorname{lcm}(b_i)$、$g=\gcd(a_ib_i)$。存在这样的 $k$，当且仅当 $l\mid g$：必要性来自 $l\mid k\mid g$；充分性直接取 $k=l$。
3. 从左到右尽量延长当前段，一旦 `g%l!=0` 就在当前元素前切开，并用当前元素重置 $g,l$。一段不合法后再追加元素也不可能合法，因此每段尽量长不会增加段数。

上一段合法时 $l\le g\le10^{13}$，下一次与 $b_i$ 求 lcm 的乘积不超过 $10^{17}$，使用 `long long` 即可。

**时间复杂度：**$O(n\log A)$，$A$ 为数值上界。

### AC代码

```c++
int gcd(int a,int b){
    if(b==0) return a;
    return gcd(b,a%b);
}
int lcm(int a,int b){
    return a/gcd(a,b)*b;
}

void solve(){
    int n;
    cin>>n;
    vector<int> a(n),b(n);// 数量 价格
    for(int i=0;i<n;i++){
        cin>>a[i]>>b[i];
    }

    int g=0,l=1;
    int cnt=1;
    for(int i=0;i<n;i++){
        g=gcd(g,a[i]*b[i]);
        l=lcm(l,b[i]);
        if(g%l!=0){
            g=a[i]*b[i];
            l=b[i];
            cnt++;
        }
    }
    cout<<cnt<<endl;

}
```
