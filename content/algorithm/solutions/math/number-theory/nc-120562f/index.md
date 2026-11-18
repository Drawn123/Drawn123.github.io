---
title: "牛客 120562F x?y?n!"
date: 2026-05-19T16:01:16+08:00
knowledge_id: "solution-nc-120562f"
url: "/algorithm/solutions/math/number-theory/nc-120562f/"
tags:
  - "数论 | Number Theory"
  - "最大公约数 | GCD"
  - "位运算 | Bit Manipulation"
  - "构造 | Construction"
platform:
  - "牛客"
problem_id: "NC120562F"
draft: false
---

## 牛客 120562F x?y?n!

[题目链接](https://ac.nowcoder.com/acm/contest/120562/F)

### 题意

给定 $1\le n<2^{31}$，构造不同的正整数 $x,y<2^{63}$，满足 $\gcd(x,y)=n$，并使 $x\oplus y$ 最小。多组测试，$T\le10^4$，输出任意最优方案。

### 思路

先找异或值的下界。设 $x>y$，两者都是 $n$ 的倍数，所以 $x-y\ge n$。由

$$x+y=(x\oplus y)+2(x\mathbin{\&}y),\qquad x\mathbin{\&}y\le y,$$

得到 $x\oplus y\ge x-y\ge n$。接下来只需构造异或值恰好为 $n$ 的两个数。

令 $k$ 为 $n$ 的二进制位数，取

$$x=n\cdot2^k,\qquad y=x+n=n(2^k+1).$$

$x$ 的低 $k$ 位全为零，$n$ 只占低 $k$ 位，相加不进位，因此 $x\oplus y=n$。同时 $2^k$ 与 $2^k+1$ 相邻，互质，所以两数的最大公约数恰好是 $n$。

最后核对范围：$k\le31$，$y\le(2^{31}-1)(2^{31}+1)=2^{62}-1$，符合要求。沿用内置最高位函数，单组时间复杂度 $O(1)$。

### AC代码

```c++
int cout_bits(int x){
    return __lg(x)+1;
}
void solve(){
    int n;
    cin>>n;
    int k=cout_bits(n);
    int x=n<<k;
    int y=x+n;
    cout<<x<<" "<<y<<endl;
}
```
