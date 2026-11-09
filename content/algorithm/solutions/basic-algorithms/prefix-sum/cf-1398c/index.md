---
title: "CF 1398C Good Subarrays"
date: 2026-11-02
knowledge_id: "solution-cf-1398c"
url: "/algorithm/solutions/basic-algorithms/cf-1398c/"
tags:
  - "前缀和 | Prefix Sum"
platform:
  - "Codeforces"
problem_id: "CF1398C"
draft: false
---

## CF 1398C Good Subarrays

[CF 1398C Good Subarrays](https://codeforces.com/contest/1398/problem/C)

### 题意

给定一个长度为 $n$ 的数字串，将每位看作 $0\sim9$ 的整数。统计元素和等于区间长度的连续子数组数量。多组测试，$\sum n\le10^5$。

### 思路

把每个数字减一，就变成统计区间和为 $0$ 的子数组。若处理后的前缀和为 `cur`，每个之前出现过的相同前缀都能与它组成一个合法区间，因此边扫边做 `ans+=cnt[cur]`，再增加计数。

空前缀先计一次。前缀和可能为负，代码用偏移量 $10^5$ 存入数组；每组结束后沿原路径清空访问过的位置，避免反复清空整个计数数组。

**时间复杂度：**$O(n)$，计数数组只初始化一次。

### AC代码

```c++
vector<int> cnt(1e6);
void solve(){
    int n;
    cin>>n;
    string s;
    cin>>s;
    s=" "+s;

    int ans=0;
    int cur=0;
    int of=1e5;
    cnt[0+of]=1;// 空前缀一次
    for(int i=1;i<=n;i++){
        int x=s[i]-'0'-1;
        cur += x;

        ans += cnt[cur+of];
        cnt[cur+of]++;
    }
    cout<<ans<<endl;

    cnt[0+of]=0;
    cur=0;
    for(int i=1;i<=n;i++){
        cur += s[i]-'0'-1;
        cnt[cur+of]=0;
    }

}
```
