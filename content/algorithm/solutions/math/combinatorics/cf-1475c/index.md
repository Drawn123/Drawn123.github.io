---
title: "CF 1475C Ball in Berland"
date: 2026-11-04
knowledge_id: "solution-cf-1475c"
url: "/algorithm/solutions/math/cf-1475c/"
tags:
  - "组合数学 | Combinatorics"
platform:
  - "Codeforces"
problem_id: "CF1475C"
draft: false
---

## CF 1475C Ball in Berland

[CF 1475C Ball in Berland](https://codeforces.com/contest/1475/problem/C)

### 题意

有 $a$ 个男生、$b$ 个女生，以及 $k$ 对愿意搭档的男女组合，每对只出现一次。选两对且不能有重复的人，求方案数。多组测试，$\sum a,\sum b,\sum k\le2\times10^5$。

### 思路

先算所有两对组合，再减去共用男生或共用女生的情况：

$$
\binom{k}{2}-\sum_i\binom{cnta_i}{2}-\sum_j\binom{cntb_j}{2}.
$$

由于每对男女组合只出现一次，两条不同组合不可能同时共用男生和女生，所以不会重复减。答案用 `long long`。

**时间复杂度：**$O(a+b+k)$。

### AC代码

```c++
void solve(){
    int a,b,k;
    cin>>a>>b>>k;

    vector<int> cnta(a+1);
    vector<int> cntb(b+1);

    for(int i=0;i<k;i++){
        int x;
        cin>>x;
        cnta[x]++;
    }
    for(int i=0;i<k;i++){
        int x;
        cin>>x;
        cntb[x]++;
    }

    int ans=k*(k-1)/2;
    for(int i=1;i<=a;i++){
        ans -= cnta[i]*(cnta[i]-1)/2;
    }
    for(int i=1;i<=b;i++){
        ans -= cntb[i]*(cntb[i]-1)/2;
    }

    cout<<ans<<endl;
}
```
