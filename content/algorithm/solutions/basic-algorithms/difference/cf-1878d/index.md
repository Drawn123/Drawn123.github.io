---
title: "CF 1878D Reverse Madness"
date: 2026-08-12
knowledge_id: "solution-cf-1878d"
url: "/algorithm/solutions/basic-algorithms/cf-1878d/"
tags:
  - "差分 | Difference Array"
  - "字符串 | String"
  - "二分 | Binary Search"
platform:
  - "Codeforces"
problem_id: "CF1878D"
draft: false
---

## CF 1878D Reverse Madness

[CF 1878D Reverse Madness](https://codeforces.com/contest/1878/problem/D)

### 题意

字符串被 $k$ 个首尾相接、互不重叠的区间 $[l_i,r_i]$ 覆盖。每次给出位置 $x$，在其所属区间 $[L,R]$ 内反转 $[\min(x,L+R-x),\max(x,L+R-x)]$。求所有操作后的字符串。多组测试，$\sum n,\sum q\le2\times10^5$。

### 思路

每次反转都关于所属区间的中点对称，相当于交换其中所有对称位置。对同一对位置，交换偶数次还原，奇数次才需要交换，因此这些操作可以按次数合并。

二分找到 $x$ 所属区间，用差分记录反转范围的覆盖次数。最后求前缀和，只扫描每段左半边：若该位置覆盖次数为奇数，就与对称位置交换一次。

若先将每个位置所属的区间编号预处理出来，查询归属可以从二分改成 $O(1)$，总时间可降至 $O(n+q)$。

**时间复杂度：**$O(n+q\log k)$。

### AC代码

```c++
void solve(){
    int n,k,q;
    string s;
    cin>>n>>k;
    cin>>s;
    s=" "+s;
    vector<int> l(k+1),r(k+1);
    for(int i=1;i<=k;i++) cin>>l[i];
    for(int i=1;i<=k;i++) cin>>r[i];

    cin>>q;
    vector<int> diff(n+2,0);
    while(q--){
        int x;
        cin>>x;
        int idx=upper_bound(l.begin()+1,l.end(),x)-l.begin()-1;
        int L=l[idx],R=r[idx];
        int a=min(x,L+R-x);
        int b=max(x,L+R-x);

        diff[a]++;
        diff[b+1]--;
    }

    vector<int> pre(n+2,0);
    for(int i=1;i<=n;i++){
        pre[i]=pre[i-1]+diff[i];
    }

    for(int i=1;i<=k;i++){
        int L=l[i],R=r[i];
        int mid=(L+R)/2;

        for(int j=L;j<=mid;j++){
            int m=L+R-j;
            if(pre[j]%2!=0){
                swap(s[j],s[m]);
            }
        }
    }
    cout<<s.substr(1)<<endl;
}
```
