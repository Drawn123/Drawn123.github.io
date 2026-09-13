---
title: "P1278 单词游戏"
date: 2026-07-23
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "状压动态规划 | Bitmask DP"
  - "记忆化搜索 | Memoized DFS"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1278"
weight: 10
pinned: false
draft: false
---

## P1278 [COI 2001] 单词游戏

[P1278 单词游戏](https://www.luogu.com.cn/problem/P1278)

**核心观察：**

1. 一个单词能接在另一个单词后面，当且仅当前一个单词的末字符等于后一个单词的首字符。
2. 每个单词至多使用一次，可以用一个二进制整数 `mask` 表示已经使用过的单词集合。
3. 后续能选择哪些单词只取决于已使用集合和最后一个单词，因此定义 `memo(mask,last)` 表示当前状态下还能接出的最大额外长度。

**算法步骤：**

1. 记录每个单词的首字符、末字符和长度。
2. 枚举所有尚未使用且首字符与当前末字符相同的单词，把它加入 `mask` 后继续搜索。
3. 枚举每个单词作为第一个单词，取总长度的最大值。

**时间复杂度：**$O(N^2 2^N)$

**代码：**

```c++
#define int long long

const int N=17;
int dp[1<<N][N];
vector<char> sl;
vector<char> sr;
vector<int> len;
int n;

// 已使用mask中的单词，最后一个是last，后续还能得到的最大长度
int memo(int mask,int last){
    if(dp[mask][last]!=-1) return dp[mask][last];

    int res=0;
    for(int i=0;i<n;i++){
        if(!(mask&(1<<i)) && sr[last]==sl[i]){
            int nm=mask|(1<<i);
            int cur=len[i]+memo(nm,i);
            res=max(cur,res);
        }
    }
    return dp[mask][last]=res;
}

void solve(){
    cin>>n;
    sl.resize(n);
    sr.resize(n);
    len.resize(n);
    for(int i=0;i<n;i++){
        string s;
        cin>>s;
        sl[i]=s.front();
        sr[i]=s.back();
        len[i]=s.size();
    }

    memset(dp,-1,sizeof dp);
    int ans=0;
    for(int i=0;i<n;i++){
        int mask=1<<i;
        int res=len[i]+memo(mask,i);
        ans=max(ans,res);
    }
    cout<<ans<<endl;
}
```
