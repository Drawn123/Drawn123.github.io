---
title: "CF 2239B Decidophobia"
date: 2026-07-21T16:04:41+08:00
knowledge_id: "solution-cf-2239b"
url: "/algorithm/solutions/greedy/contribution/cf-2239b/"
tags:
  - "贪心 | Greedy"
  - "贡献法 | Contribution Technique"
  - "环形数组 | Circular Array"
  - "前缀和 | Prefix Sum"
platform:
  - "Codeforces"
problem_id: "CF2239B"
draft: false
---

## CF 2239B Decidophobia

[题目链接](https://codeforces.com/problemset/problem/2239/B)

### 题意

$n$ 个人围成一圈，第 $i$ 个人的权重为 $a_i$，每人能看到左右各 $d$ 个人。可以给任意一些人发礼物。

拿到礼物的人，幸福值为自己的权重乘上视野内没拿礼物的人数；没拿礼物的人，幸福值为自己的权重乘上视野内拿礼物的人数，再取负数。求总幸福值的最大值。

多组测试，$3\le n\le2\times10^5$，$1\le d<n/2$，$a_i\le10^8$，所有测试的 $n$ 之和不超过 $2\times10^5$。

### 思路

单独考虑给某个人发礼物，会同时改变周围很多人的幸福值。先把“发”和“不发”写进同一个式子。

令 $c_i\in\{0,1\}$ 表示是否给 $i$ 发礼物，$V_i$ 为它的视野，$p_i=\sum_{j\in V_i}c_j$。这个人的贡献是

$$H_i=c_i a_i(2d-p_i)-(1-c_i)a_i p_i=2da_ic_i-a_ip_i.$$

展开后二次项抵消了。把所有人加起来，再按礼物接收者归并第二项。由于视野对称，$j$ 能看到 $i$，当且仅当 $i$ 能看到 $j$，所以

$$\sum_i H_i=\sum_i c_i\left(2da_i-\sum_{j\in V_i}a_j\right).$$

现在每个 $c_i$ 的选择互不影响：括号里为正就发礼物，否则不发。这个系数同时算了给 $i$ 带来的收益，以及它让周围人损失的权重和。

前缀和求左右各 $d$ 人的权重和，环上的区间跨首尾时拆成两段，最后减去自己。下标先平移为从零开始，再取模转回；负数取模要先加 $n$。时间复杂度 $O(n)$。

### AC代码

```c++
void solve(){
    int n,d;
    cin>>n>>d;
    vector<int> a(n+1),pre(n+1);
    for(int i=1;i<=n;i++){
        cin>>a[i];
        pre[i]=pre[i-1]+a[i];
    }
    int ans=0;
    for(int i=1;i<=n;i++){
        int l=((i-d-1)%n+n)%n+1;
        int r=((i+d-1)%n+n)%n+1;
        int s;
        if(l<=r) s=pre[r]-pre[l-1]-a[i];
        else s=pre[n]-pre[l-1]+pre[r]-a[i];
        ans+=max(0ll,2*d*a[i]-s);
    }
    cout<<ans<<endl;
}
```
