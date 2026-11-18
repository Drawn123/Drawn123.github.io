---
title: "2026CCPC成都女赛 E 可带负权的背包问题 "
date: 2026-11-18
knowledge_id: "solution-qoj-23635"
url: "/algorithm/solutions/greedy/sequence-greedy/qoj-23635/"
tags:
  - "贪心 | Greedy"
  - "数学 | Math"
  - "等比数列 | Geometric Progression"
platform:
  - "QOJ"
problem_id: "QOJ23635"
draft: false
---

## 2026CCPC成都女赛 E 可带负权的背包问题 

[可带负权的背包问题](https://qoj.ac/contest/4613/problem/23635)

### 题意

给定长度为 $n$ 的正整数序列 $a$，满足 $a_i\ge 3a_{i-1}$。有 $q$ 次独立询问，每次给出一个整数 $v$，要求为每个元素选择系数 $c_i\in\lbrace -1,0,1\rbrace$，使得

$$
\sum_{i=1}^{n}c_i a_i=v.
$$

有解时输出 `YES` 和按原序列顺序排列的一组系数，否则输出 `NO`。

多组测试，$1\le n\le 50$，$1\le a_i\le 10^{18}$，$|v|\le 2\times 10^{18}$，所有测试用例的 $nq$ 之和不超过 $5\times 10^5$。

### 思路

**从大到小确定系数，因为所有更小的数加起来，也不到当前数的一半。**

考虑当前元素 $a_i$。由相邻元素至少相差三倍，有

$$
\sum_{j=1}^{i-1}a_j
\le \frac{a_i}{3}+\frac{a_i}{3^2}+\cdots+\frac{a_i}{3^{i-1}}
<\frac{a_i}{2}.
$$

因此，无论前面这些数的系数如何选择，它们的贡献之和 $r$ 都满足 $|r|<a_i/2$。

用 $v$ 表示扣除已确定的大元素贡献后，还需要凑出的值。如果存在合法方案，就有 $v=c_i a_i+r$。按 $c_i$ 的取值分三种情况：

1. $c_i=1$ 时，$v=a_i+r>a_i/2$。
2. $c_i=0$ 时，$-a_i/2<v<a_i/2$。
3. $c_i=-1$ 时，$v=-a_i+r<-a_i/2$。

这三个范围互不相交，所以只要有解，当前系数就已经被唯一确定了。对应到代码：

- 若 $2v>a_i$，令 `ans[i]=1`，剩余目标变为 $v-a_i$。
- 若 $2v<-a_i$，令 `ans[i]=-1`，剩余目标变为 $v+a_i$。
- 否则保留 `ans[i]=0`。

这里使用严格不等号：当 $2v=\pm a_i$ 时，较小元素的贡献达不到 $\pm a_i/2$，本身就无解，继续处理后会由最终的剩余值判断出来。

每一步都取有解时必须选择的系数，因此不会错过合法方案。处理完所有元素后，若 $v=0$，记录的系数就能凑出原目标；否则不存在方案。

题目已保证序列递增，代码中的排序不会改变元素顺序。两个 `if` 也不会同时生效：第一个条件成立并减去 $a_i$ 后，新的 $v>-a_i/2$，不会再满足第二个条件。

**时间复杂度：** 每组测试 $O(n\log n+nq)$。

### AC代码

```c++
void solve(){
    int n,q;
    cin>>n;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin>>a[i];
    sort(a.begin(),a.end());

    cin>>q;
    while(q--){
        int v;
        cin>>v;
        vector<int> ans(n,0);
        for(int i=n-1;i>=0;i--){
            if(a[i]<2*v){
                ans[i]=1;
                v -= a[i];
            }
            if(-a[i]>2*v){
                ans[i]=-1;
                v += a[i];
            }
        }
        if(v) cout<<"NO"<<endl;
        else{
            cout<<"YES"<<endl;
            for(int i=0;i<n;i++){
                cout<<ans[i]<<" ";
            }
            cout<<endl;
        }
    }
}
```
