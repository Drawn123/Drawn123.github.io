---
title: "CF edu194 B"
date: 2026-09-09
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "数论 | Number Theory"


difficulty:
platform:
  - "Codeforces"
problem_id: "CF2260B"
weight: 10
pinned: false
draft: false
---

## B. Monocarp and Projects

[Problem - B - Codeforces](https://codeforces.com/contest/2260/problem/B)

### 题意

Monocarp 经营一家公司，需要规划未来 $k$ 个月的工作：

- **初始状态（第 1 个月）：** 有 $x$ 名员工，要做 $y$ 个项目。
- **每月递增：** 接下来每个月，员工数和项目数都同时增加 $1$。即第 $i$ 个月（从第 0 个月开始算）有 $x+i$ 名员工，需要完成 $y+i$ 个项目。
- **分配规则：**
  - 所有项目优先**平分**给员工，每位员工分到的项目数必须相同。
  - Monocarp 自己完成**剩下无法平分**的项目（即分配后的余数）。
  - 每个人都尽可能多拿，以让 Monocarp 自己做的项目最少。

**求解目标：**

求 Monocarp 在接下来的 $k$ 个月中，自己**总共**需要完成的项目数量。



### **数学原理**

在第 $i$ 个月（从 $i = 0$ 开始），员工数为 $x+i$，项目数为 $y+i$。

Monocarp 自己完成的项目数即为：

$$(y+i) \bmod (x+i)$$

根据取模的代数定义 $A \bmod B = A - \left\lfloor \frac{A}{B} \right\rfloor \cdot B$，令固定差值 $d = y - x$：

$$\begin{aligned} (y+i) \bmod (x+i) &= (y+i) - \left\lfloor \frac{y+i}{x+i} \right\rfloor \cdot (x+i) \\ &= (x+i+d) - \left\lfloor \frac{x+i+d}{x+i} \right\rfloor \cdot (x+i) \\ &= (x+i+d) - \left(1 + \left\lfloor \frac{d}{x+i} \right\rfloor\right) \cdot (x+i) \\ &= d - \left\lfloor \frac{d}{x+i} \right\rfloor \cdot (x+i) \end{aligned}$$

从这个公式可以得出两个关键数学结论：

1. **常数截断性质：** 当员工数 $x+i > d$ 时，$\left\lfloor \frac{d}{x+i} \right\rfloor = 0$，此时每月余数恒等于常数 $d$。
2. **分段等差性质：** 当 $x+i \le d$ 时，下取整项 $L = \left\lfloor \frac{d}{x+i} \right\rfloor$ 会在连续的一段区间内保持不变。在 $L$ 不变期间，余数呈现为一个**公差为 $-L$ 的等差数列**。



### **法一**

**基于 $y \le 10^6$ 范围（暴力模拟 + 截断）**

在 $y \le 10^6$ 时，差值 $d = y - x$ 最多为 $10^6$。

- 只要员工数 $x+i \le d$，商就不为 $1$。由于 $d \le 10^6$，这个过程最多只会持续 $10^6$ 次循环。
- 一旦 $x+i > d$，商必定降为 $1$，余数永久变为 $d$。此时直接用乘法计算剩下的 $k - pos - 1$ 个月并退出循环。

- **时间复杂度：** $O(\min(k, y - x))$。最坏情况下循环 $10^6$ 次。

```c++
void solve(){
    int x,y,k;
    cin>>x>>y>>k;
    int ans=0;
    int pos=-1;
    int diff=y-x;

    for(int i=0;i<k;i++){
        if((y+i)/(x+i)==1){
            ans+=(y+i)%(x+i);
            pos=i;
            break;
        }else{
            ans+=(y+i)%(x+i);
        }
    }

    if(pos!=-1){
        ans+=diff*(k-pos-1);
    }

    cout<<ans<<endl;
}
```



### **法二**

**基于 $y \le 10^{12}$ 范围（数论分块跳跃）**

当 $y \le 10^{12}$ 时，$d = y - x$ 最大可达 $10^{12}$。逐月循环会导致 TLE，必须采用数论分块（整除分块）思想：

1. **确定相同商的边界：** 设当前员工数为 $x' = x + i$，当前的商为 $L = \left\lfloor \frac{d}{x'} \right\rfloor$。使下取整结果依然为 $L$ 的最大员工数为 $max\_x = \left\lfloor \frac{d}{L} \right\rfloor$。
2. **批量处理等差数列：** 在员工数从 $x'$ 增加到 $max\_x$ 的这段时间内（共 $cnt = \min(k, max\_x - x' + 1)$ 个月），余数是一个首项为 $ft = d - L \cdot x'$，末项为 $ed = d - L \cdot (x' + cnt - 1)$ 的等差数列。利用公式 $\frac{(ft + ed) \times cnt}{2}$ 进行快速累加。
3. **快速跳跃：** 每次计算后，将 $k$ 扣除 $cnt$，$x'$ 增加 $cnt$，直接“跳”到下一个不同的商。当 $x' > d$ 时，剩余月份一次性乘上 $d$。

- **时间复杂度：** $O(\sqrt{y - x})$。数论分块的不同商最多只有 $2\sqrt{d}$ 个。当 $d = 10^{12}$ 时，循环最多跑 $2 \times 10^6$ 次。



```c++
void solve(){
    int x,y,k;
    cin>>x>>y>>k;
    int ans=0;
    int diff=y-x;

    while(k && x<=diff){
        int l=diff/x;
        int c=diff/l;
        int cnt=min(k,c-x+1);

        int ft=diff-l*x;
        int ed=diff-l*(x+cnt-1);

        ans += (ft+ed)*cnt/2;
        
        k -= cnt;
        x += cnt;
    }

    if(k){
        ans += k*diff;
    }
    cout<<ans<<endl;
}
```

