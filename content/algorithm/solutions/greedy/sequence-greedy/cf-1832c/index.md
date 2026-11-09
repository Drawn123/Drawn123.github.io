---
title: "CF 1832C Contrast Value"
date: 2026-10-28
knowledge_id: "solution-cf-1832c"
url: "/algorithm/solutions/greedy/cf-1832c/"
tags:
  - "贪心 | Greedy"
platform:
  - "Codeforces"
problem_id: "CF1832C"
draft: false
---

## CF 1832C Contrast Value

[CF 1832C Contrast Value](https://codeforces.com/contest/1832/problem/C)

### 题意

数组的对比值为相邻元素差的绝对值之和。删除若干元素，保持对比值不变，求剩余非空子序列的最小长度。多组测试，$\sum n\le3\times10^5$。

### 思路

先合并相邻相同的数。对于一段单调序列，中间元素可以直接删除，因为

$$
|x-y|+|y-z|=|x-z|.
$$

但跨过严格的峰或谷会让上式变成严格大于，对比值就会减少。因此保留首尾和所有转折点即可；合并后只剩一个数时，答案为 $1$。

**时间复杂度：**$O(n)$。

### AC代码

```c++
void solve(){
    int n;
    cin>>n;
    vector<int> a;
    for(int i=0;i<n;i++){
        int x;
        cin>>x;
        if(a.empty() || a.back()!=x) a.push_back(x);
    }

    int m=a.size();
    if(m==1){
        cout<<1<<endl;
        return ;
    }

    int ans=2;
    // 保留转折点
    for(int i=1;i<m-1;i++){
        if(a[i]>a[i-1] && a[i]>a[i+1]) ans++;
        if(a[i]<a[i-1] && a[i]<a[i+1]) ans++;
    }

    cout<<ans<<endl;
}
```
