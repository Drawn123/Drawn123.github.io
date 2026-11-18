---
title: "CF 1646C Factorials and Powers of Two"
date: 2026-11-10
knowledge_id: "solution-cf-1646c"
url: "/algorithm/solutions/basic-algorithms/subset-enumeration/cf-1646c/"
tags:
  - "枚举 | Enumeration"
  - "子集枚举 | Subset Enumeration"
  - "搜索 | Search"
  - "位运算 | Bit Manipulation"
  - "数学 | Math"
platform:
  - "Codeforces"
problem_id: "CF1646C"
draft: false
---

## CF 1646C Factorials and Powers of Two

[Factorials and Powers of Two](https://codeforces.com/contest/1646/problem/C)

### 题意

把一个正整数 $n$ 写成若干个互不相同的数之和，每个数必须是 $2$ 的非负整数次幂或某个非负整数的阶乘，求最少用几个数，无解输出 $-1$。

这里要求数值互不相同，例如 $1=0!=1!=2^0$，也只能使用一次。多组测试，$t\le100$，$1\le n\le10^{12}$。

### 思路

如果只用 $2$ 的幂，答案就是 $n$ 的二进制中 $1$ 的个数。每个二进制位只能选一次，表示也是唯一的，所以只用 $2$ 的幂一定能凑出 $n$，不会无解。

加入阶乘后，可以把问题拆开：**枚举选了哪些阶乘，剩下的部分交给二进制。**

$0!,1!,2!$ 的数值已经是 $1,2$，都由二进制部分处理，避免重复选择同一个数。只考虑 $3!\sim14!$，因为 $15!>10^{12}$，更大的阶乘不可能选。

这部分只有 $12$ 个数，每个选或不选，共 $2^{12}$ 种子集。确定子集和 $s\le n$ 后，需要的总数为

$$
\text{选中的阶乘个数}+\operatorname{popcount}(n-s).
$$

$k!$ 在 $k\ge3$ 时都含有因子 $3$，不会与 $2$ 的幂重合，因此这样组合不会违反数值互不相同的要求。

沿用搜索写法，`dfs(pos,rem)` 表示只考虑 `pos` 及其后面的阶乘，还要凑出 `rem` 时最少用几个数。分别搜索跳过当前阶乘、选取当前阶乘；阶乘用完后，返回 `rem` 的二进制中 $1$ 的个数。

这里不能先贪心拿最大的阶乘。例如 $n=32$ 本来只需一个 $2^5$，先拿 $4!=24$ 就还要补 $8$，反而用了两个数。可枚举的阶乘很少，全部枚举更直接。

**时间复杂度：** 每组 $O(2^{12}\log n)$。

### AC代码

```c++
vector<int> fac;

int dfs(int pos,int rem){
    if(pos==(int)fac.size()){
        int cnt=0;
        while(rem){
            cnt += rem&1;
            rem >>= 1;
        }
        return cnt;
    }
    int res=dfs(pos+1,rem);
    if(rem>=fac[pos]){
        res=min(res,1+dfs(pos+1,rem-fac[pos]));
    }
    return res;
}

void solve(){
    if(fac.empty()){
        int val=1;
        for(int i=1;i<=14;i++){
            val *= i;
            if(i>=3) fac.push_back(val);
        }
    }
    int n;
    cin>>n;
    cout<<dfs(0,n)<<endl;
}
```
