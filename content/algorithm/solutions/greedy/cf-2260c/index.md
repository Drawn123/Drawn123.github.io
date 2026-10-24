---
title: "CF 2260C Maximize XOR, Minimize Operations"
date: 2026-10-24
lastmod: 2026-10-24
knowledge_id: "solution-cf-2260c"
url: "/algorithm/solutions/greedy/cf-2260c/"
tags:
  - "贪心 | Greedy"
  - "位运算 | Bit Manipulation"
platform:
  - "Codeforces"
problem_id: "CF2260C"
draft: true
---

## C - Maximize XOR, Minimize Operations

[C - Maximize XOR, Minimize Operations](https://codeforces.com/contest/2260/problem/C)

### 题意

给定两个非负整数 $x,y$，每次操作可以让 $x$ 减少 $1$，同时让 $y$ 增加 $1$。当 $x=0$ 时不能继续操作，也可以一次操作都不做。

求 $x\oplus y$ 的最大值，以及达到这个最大值所需的最少操作次数。

共有 $t$ 组测试，$1\le t\le 10^4$，$0\le x,y<2^{29}$。

### 思路

#### 最大异或值

每次操作都保持两数之和不变，记 $s=x+y$，最终两个数为 $a,b$，则 $a+b=s$。由二进制加法的恒等式：

$$
a+b=(a\oplus b)+2(a\&b)
$$

可得 $a\oplus b\le s$。执行 $x$ 次操作后得到 $(0,s)$，异或值恰好为 $s$，因此最大值就是 $x+y$。

要取得这个最大值，必须满足 $a\&b=0$。两个数没有重叠的 $1$，相加时不进位，此时：

$$
a+b=a\oplus b=s
$$

#### 最少操作次数

执行 $k$ 次操作后，第一个数为 $a=x-k$，因此：

$$
k=x-a,\qquad b=s-a
$$

任意 $0\le a\le x$ 都能通过 $x-a$ 次操作到达，所以要使操作次数最少，就要在异或值为 $s$ 的前提下，让 $a$ 尽可能大。

从减法来看，$a+b=s$ 不进位，等价于 $s-a=b$ 不退位，也就是每一位都不需要向高位借位。其条件和公式为：

$$
s\&a=a
\quad\Longleftrightarrow\quad
s-a=s\oplus a
$$

因为 $a$ 为 $1$ 的位置，$s$ 也必须为 $1$，这样每一位只会出现 $0-0$、$1-0$、$1-1$，不会出现需要借位的 $0-1$。

这说明 $a$ 的所有 $1$ 都只能从 $s$ 中选取，即 $a$ 是 $s$ 的子掩码。问题就转化为：**求不超过 $x$ 的最大的 $s$ 的子掩码 $a$，答案为 $x-a$。**

#### 高位贪心

从 $a=0$ 开始，由高位到低位枚举。令当前位的值为 $bit=2^i$，只有当这一位在 $s$ 中为 $1$，并且 $a+bit\le x$ 时，才把它选入 $a$。

一个高位的值大于所有更低位的值之和：

$$
2^i>\sum_{j=0}^{i-1}2^j=2^i-1
$$

因此，在已选高位相同的情况下，选上当前位一定比放弃它、再任意选取低位更大。若加入后不超过 $x$，其余低位全取 $0$ 就已经是合法方案，可以直接选；若已经超过 $x$，再补低位也无法使它变小，只能跳过。

代码中的 `a += bit` 就是把当前位设为 $1$。每一位只处理一次，$a$ 的当前位一定为 $0$，因此这里不会进位，与 `a |= bit` 等价。

例如 $x=6,y=4$，$s=10=(1010)_2$。先尝试选 $8$，超过 $x$，跳过；再选 $2$，得到 $a=2$。最终两个数为：

```text
a     = 0010 = 2
b     = 1000 = 8
a ^ b = 1010 = 10
```

最少操作次数为 $6-2=4$。由于 $x,y<2^{29}$，相加可能产生第 $29$ 位，循环需要从第 $29$ 位枚举到第 $0$ 位。

**时间复杂度：** 每组 $O(30)$，共 $O(30t)$

### AC代码

```c++
void solve(){
    int x,y;
    cin>>x>>y;

    int s=x+y;
    int a=0;

    for(int i=29;i>=0;i--){
        int bit=1LL<<i;
        if((s&bit) && a+bit<=x){
            a+=bit;
        }
    }
    cout<<s<<" "<<x-a<<endl;
}
```
