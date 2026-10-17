---
title: "CF 2275D Precision Alignment"
date: 2026-10-17
knowledge_id: "solution-cf-2275d"
url: "/algorithm/solutions/basic-algorithms/cf-2275d/"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"
platform:
  - "Codeforces"
problem_id: "CF2275D"
draft: true
---

## D. Precision Alignment

[CF 2275D Precision Alignment](https://codeforces.com/contest/2275/problem/D)

### 题意

给定 $n$ 个三元组 $(a_i,b_i,c_i)$，**三元组内的顺序固定，不能重新排序**。

每次选择一个三元组，执行以下操作之一：

$$
\begin{aligned}
c_i&\mathrel{+}=\operatorname{sgn}(a_i-b_i),\\
b_i&\mathrel{+}=\operatorname{sgn}(a_i-c_i),\\
a_i&\mathrel{+}=\operatorname{sgn}(b_i-c_i).
\end{aligned}
$$

其中 $\operatorname{sgn}(x)$ 在 $x>0$、$x=0$、$x<0$ 时分别为 $1$、$0$、$-1$，每次都根据操作时的数值判断。

总共**至多**执行 $k$ 次操作，可以反复选择同一个三元组，也可以不操作。求最终

$$
S=\min_{1\le i\le n}(a_i+b_i+c_i)
$$

的最大值。

多组测试，$n\le 2\times10^5$，$0\le k\le10^{18}$，$-10^9\le a_i,b_i,c_i\le10^9$，所有测试的 $n$ 之和不超过 $2\times10^5$。

### 思路

依旧是二分答案。先考虑一个三元组：如果想让它的和增加，需要花多少次操作？

#### 1. 有逆序对，就可以一直增加

这里的逆序对是指前面的数严格大于后面的数。

- 如果 $a>b$，就可以一直让 $c$ 加一。
- 如果 $a>c$，就可以一直让 $b$ 加一。
- 如果 $b>c$，就可以一直让 $a$ 加一。

**每次增加的都是第三个数，决定操作方向的那两个数不会变化，因此这个增加操作可以无限重复。**

所以，只要三元组原本存在逆序对，把它的和从 $s$ 提高到 $mid>s$，恰好需要 $mid-s$ 次操作。

#### 2. 没有逆序对，先花代价制造一个

没有逆序对，即 $a\le b\le c$。此时三个操作的增量都不大于零，不能直接增加总和。

先单独处理 $a=b=c$：所有增量都是零，三元组永远不会改变。代码用 `ex[i]=-1` 标记这种情况。

否则，设

$$
res=\min(b-a,c-b)+1.
$$

**制造第一个逆序对，最少需要 $res$ 次减一操作。**

在出现第一个逆序对之前，操作只能减一或不变。相邻差值 $b-a$、$c-b$ 每次最多减少一，要让其中一个变成负数，至少需要上述次数。

这个下界也能做到：

- 如果 $b-a\le c-b$，不断让 $b$ 减一。因为三元组不全相等，所以 $a<c$，操作 $b\mathrel{+}=\operatorname{sgn}(a-c)$ 始终为减一。执行 $b-a+1$ 次后得到 $a>b$。
- 否则，不断让 $c$ 减一。此时 $a<b$，操作 $c\mathrel{+}=\operatorname{sgn}(a-b)$ 始终为减一。执行 $c-b+1$ 次后得到 $b>c$。

经过这 $res$ 次操作，虽然制造了逆序对，但总和也从 $s$ 降到了 $s-res$。

接下来就可以一直加一。要到达 $mid>s$，还需要

$$
mid-(s-res)=mid-s+res
$$

次操作。因此总代价是

$$
res+(mid-s+res)=mid-s+2res.
$$

这就是代码中 `ex[i]=res*2` 的含义：**先减少 $res$ 次，再花 $res$ 次补回原来的总和，之后才是真正的提升。**

它也是最小代价：要产生净增量，必须先出现逆序对，至少已有 $res$ 次减一；这些减少都需要额外的加一补回，所以至少比净增量多花 $2res$ 次操作。

例如 $(1,3,5)$，先把 $b$ 减三次，得到 $(1,0,5)$；此后固定 $a>b$，就可以不断让 $c$ 增加。若只想把原来的总和 $9$ 提高到 $10$，也需要 $3+4=7$ 次操作。

#### 3. 二分答案

预处理每个三元组的初始和 `s[i]` 与额外代价 `ex[i]`：

$$
ex_i=
\begin{cases}
-1,&a_i=b_i=c_i,\\
2\bigl(\min(b_i-a_i,c_i-b_i)+1\bigr),&a_i\le b_i\le c_i\text{ 且不全相等},\\
0,&\text{原本存在逆序对}.
\end{cases}
$$

检查能否让所有三元组的和都至少为 $mid$：

1. 如果 `s[i]>=mid`，不操作即可，代价为零。
2. 否则，如果 `ex[i]==-1`，这个三元组无法提高，直接返回不可行。
3. 否则，需要 `mid-s[i]+ex[i]` 次操作。

各个三元组的操作互不影响，只需判断这些最小代价之和是否不超过 $k$。

目标值越大，所需的最小操作数越多，因此具有单调性，可以二分最后一个可行值。

令初始最小和为 $mn$。不操作就能取得 $mn$；而原本达到最小和的那个三元组，每次操作最多增加一，所以答案不超过 $mn+k$。二分区间取 $[mn,mn+k]$ 即可，**左边界可能为负数**。

实现时用 `rem` 维护剩余操作数，先判断 `d>rem` 再扣除，避免直接累加所有代价导致溢出。最终答案、三元组的和、二分边界均使用 64 位整数。

**时间复杂度：**$O(n\log(k+2))$，每次检查 $O(n)$，二分最多约 60 轮。**空间复杂度：**$O(n)$。

### AC代码

```cpp
int n,k;
vector<int> s,ex;

bool check(int mid){
    int rem=k;
    for(int i=1;i<=n;i++){
        if(s[i]>=mid) continue;
        if(ex[i]==-1){
            return false;
        }
        int d=mid-s[i]+ex[i];
        if(d>rem) return false;
        rem -= d;
    }
    return true;
}
void solve(){
    cin>>n>>k;
    s.resize(n+1);
    ex.resize(n+1);

    int l=1e18;
    for(int i=1;i<=n;i++){
        int a,b,c;
        cin>>a>>b>>c;
        s[i]=a+b+c;
        l=min(l,s[i]);
        if(a==b && b==c){
            ex[i]=-1;
        }
        else if(a<=b && b<=c){
            int res=min(b-a,c-b)+1;
            ex[i]=res*2;// 变成有逆序对的需要res次 总体和变成原值的还要res次
        }
        else{// 本来就有逆序对 额外需要的次数为0 
            ex[i]=0;
        }
    }
    
    int r=l+k;
    int ans=0;
    while(l<=r){
        int mid=(l+r)/2;
        if(check(mid)){
            l=mid+1;
            ans=mid;
        }
        else{
            r=mid-1;
        }
    }
    cout<<ans<<endl;
}
```
