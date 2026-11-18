---
title: "P16236 LQ 聚合"
date: 2026-05-16T11:54:58+08:00
knowledge_id: "solution-lg-p16236"
url: "/algorithm/solutions/greedy/contribution/lg-p16236/"
tags:
  - "贪心 | Greedy"
  - "贡献法 | Contribution Technique"
  - "前缀和 | Prefix Sum"
  - "枚举 | Enumeration"
platform:
  - "洛谷"
problem_id: "P16236"
draft: false
---

## P16236 LQ 聚合

[题目链接](https://www.luogu.com.cn/problem/P16236)

### 题意

长度为 $n$ 的字符串只含 `L/Q/?`，把每个 `?` 换成 `L` 或 `Q`，最大化满足 $i<j$、$s_i=L,s_j=Q$ 的二元组数量。$n\le10^5$。

### 思路

先看问号之间的顺序。如果前一个问号填 `Q`、后一个填 `L`，把它们交换成 `L,Q` 不会变差：两者之间每个已知的 `L` 或 `Q` 都多出一次配对，两端这对问号也多出一次，区间外的贡献不变。因此一定存在一种最优方案，前若干个问号填 `L`，剩下的全填 `Q`。

这样只需枚举分界，把贡献分成三部分：

1. 原来已知的 `LQ`，记为 `base`，不随填法变化。
2. 问号与已知字符配对。对第 $j$ 个问号，记左边已知 `L` 数为 $l_j$，右边已知 `Q` 数为 $r_j$。前 $i$ 个填 `L` 贡献 $\sum_{j<i}r_j$，剩下填 `Q` 贡献 $\sum_{j\ge i}l_j$。
3. 问号之间配对，共有 $i(m-i)$ 对，$m$ 为问号总数。

因此答案为

$$\max_{0\le i\le m}\left(base+\sum_{j<i}r_j+\sum_{j\ge i}l_j+i(m-i)\right).$$

用前后缀和维护第二部分。枚举时也要包含所有问号都填同一个字符的两端情况。时间复杂度 $O(n)$。

### AC代码

```c++
void solve(){
    int n;
    string s;
    cin>>n>>s;
    s=" "+s;
    vector<int> pre(n+2),suf(n+2),pos;
    for(int i=1;i<=n;i++) pre[i]=pre[i-1]+(s[i]=='L');
    for(int i=n;i>=1;i--) suf[i]=suf[i+1]+(s[i]=='Q');
    int base=0;
    for(int i=1;i<=n;i++){
        if(s[i]=='L') base+=suf[i+1];
        if(s[i]=='?') pos.push_back(i);
    }
    int m=pos.size();
    vector<int> prel(m+1),sufq(m+1);
    for(int i=0;i<m;i++) prel[i+1]=prel[i]+suf[pos[i]+1];
    for(int i=m-1;i>=0;i--) sufq[i]=sufq[i+1]+pre[pos[i]-1];
    int ans=0;
    for(int i=0;i<=m;i++) ans=max(ans,base+prel[i]+sufq[i]+i*(m-i));
    cout<<ans<<endl;
}
```
