---
title: "CF 2114F Small Operations"
date: 2026-05-16T12:23:51+08:00
knowledge_id: "solution-cf-2114f"
url: "/algorithm/solutions/math/number-theory/cf-2114f/"
tags:
  - "数论 | Number Theory"
  - "最大公约数 | GCD"
  - "记忆化搜索 | Memoized DFS"
  - "因数枚举 | Divisor Enumeration"
platform:
  - "Codeforces"
problem_id: "CF2114F"
draft: false
---

## CF 2114F Small Operations

[题目链接](https://codeforces.com/contest/2114/problem/F)

### 题意

给定 $x,y,k$，一次可以乘上或整除一个 $1\sim k$ 的整数，除法必须整除。求把 $x$ 变成 $y$ 的最少次数，无解输出 $-1$。

多组测试，$x,y,k\le10^6$，所有测试的 $x$ 之和、$y$ 之和分别不超过 $10^8$。

### 思路

先除掉公共部分。令 $g=\gcd(x,y)$，$u=x/g,v=y/g$，需要去掉的质因子都在 $u$，需要补上的都在 $v$。答案可以拆成“$u$ 只做除法变成 $1$”与“$v$ 只做除法变成 $1$”的最少次数之和，后一部分倒着做就是乘法。

为什么交错乘除不会更优？把任意方案中所有乘数的积记作 $M$，所有除数的积记作 $D$，有 $uM=vD$。由于 $u,v$ 互质，必有 $u\mid D,v\mid M$。可以把 $u$ 所需的质因子分配给原来的各个除数，每份都是原除数的因子、仍不超过 $k$，所以消去 $u$ 不会比原方案的除法次数更多。$v$ 同理。两部分分开做已经能达到这个下界。

定义 `dfs(a)` 为只用除法把 $a$ 变成 $1$ 的最少次数：

$$dfs(a)=1+\min_{d\mid a,\ 2\le d\le k}dfs(a/d).$$

$a=1$ 时为零，$1<a\le k$ 时直接一步。枚举因数时成对检查 $d$ 和 $a/d$，不要从 $k$ 一直试到 $2$；相同余数用记忆化复用。没有可行转移就保留无穷大。

搜索只会访问 $u,v$ 的因数。设因数个数为 $\tau$，时间复杂度可上界为 $O(\tau(u)\sqrt u+\tau(v)\sqrt v)$。多测只清理本次真正访问的状态，避免每组清空 $10^6$ 个元素。

### AC代码

```c++
const int N=1e6+10;
const int inf=1e18;
int dp[N],k;
vector<int> used;
int dfs(int u){
    if(u==1) return 0;
    if(u<=k) return 1;
    if(dp[u]) return dp[u];
    used.push_back(u);
    int res=inf;
    for(int i=2;i*i<=u;i++) if(u%i==0){
        if(i<=k) res=min(res,dfs(u/i)+1);
        int j=u/i;
        if(j!=i && j<=k) res=min(res,dfs(u/j)+1);
    }
    return dp[u]=res;
}
void solve(){
    for(int u:used) dp[u]=0;
    used.clear();
    int x,y;
    cin>>x>>y>>k;
    int g=__gcd(x,y);
    x/=g,y/=g;
    int ans=dfs(x)+dfs(y);
    cout<<(ans>=inf?-1:ans)<<endl;
}
```
