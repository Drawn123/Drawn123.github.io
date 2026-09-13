---
title: "P2285 打鼹鼠"
date: 2026-07-26
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "动态规划 | DP"
  - "记忆化搜索 | Memoized DFS"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P2285"
weight: 10
pinned: false
draft: false
---

## P2285 [HNOI2004] 打鼹鼠

[P2285 打鼹鼠](https://www.luogu.com.cn/problem/P2285)

**核心观察：**

1. 按出现时间排序后，若在时刻 $t_i$ 打到了位置 $(x_i,y_i)$ 的鼹鼠，那么之后能否打到第 $j$ 只只取决于时间差是否不小于曼哈顿距离：
   $$t_j-t_i\ge |x_j-x_i|+|y_j-y_i|。$$
2. 定义 `memo(i)` 表示打到第 $i$ 只鼹鼠后，从第 $i$ 只开始最多能打到多少只。枚举下一只可达的鼹鼠即可转移。
3. 棋盘上任意两点的曼哈顿距离小于 $2n$。所以当 $t_j-t_i\ge2n$ 时，从第 $i$ 只一定能到达第 $j$ 只以及之后任意一只；此时可以直接接上从 $j$ 开始的后缀最优值，不必继续枚举。

**算法步骤：**

1. 将所有鼹鼠按出现时间升序排序。
2. 从后向前计算每个 `memo(i)`，枚举下一只鼹鼠并检查时间是否足以移动到对应位置。
3. 用 `suf_mx[i]` 维护区间 $[i,m-1]$ 内 `memo` 的最大值，处理时间差达到 $2n$ 后的快速转移。
4. 所有 `memo(i)` 中的最大值即为答案。

**时间复杂度：**$O(M^2)$

**代码：**

```c++
#define int long long

int n,m;

struct mouse{
    int t,x,y;
    bool operator<(const mouse& other)const{
        return t<other.t;
    }
};

vector<int> dp;
vector<mouse> a;
vector<int> suf_mx;

// 打死第i只鼹鼠后，从i开始最多还能打死多少只
int memo(int i){
    if(dp[i]!=-1) return dp[i];
    int res=1;
    for(int j=i+1;j<m;j++){
        int diff=a[j].t-a[i].t;
        int d=abs(a[j].x-a[i].x)+abs(a[j].y-a[i].y);

        // 时间差足以跨越棋盘，可直接接上后缀最优答案
        if(diff>=2*n){
            res=max(res,1+suf_mx[j]);
            break;
        }
        if(diff>=d){
            res=max(res,1+memo(j));
        }
    }
    return dp[i]=res;
}

void solve(){
    cin>>n>>m;
    a.resize(m);
    for(int i=0;i<m;i++){
        cin>>a[i].t>>a[i].x>>a[i].y;
    }
    sort(a.begin(),a.end());

    dp.assign(m,-1);
    suf_mx.assign(m+1,0);

    int ans=0;
    for(int i=m-1;i>=0;i--){
        int cur=memo(i);
        suf_mx[i]=max(cur,suf_mx[i+1]);
        ans=max(ans,cur);
    }
    cout<<ans<<endl;
}
```
