---
title: "P1839 Play with Power"
date: 2026-07-21
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "博弈论 | Game Theory"
  - "记忆化搜索 | Memoized DFS"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1839"
weight: 10
pinned: false
draft: false
---

## P1839 Play with Power

[P1839 Play with Power](https://www.luogu.com.cn/problem/P1839)

**核心观察：**

1. 用状态 $(a,b)$ 表示当前数为 $a^b$。一次操作只能把 $a$ 或 $b$ 增加 $1$，并且操作后的幂不能超过 $n$。
2. 若当前玩家能走到一个必败状态，则当前状态必胜；若所有合法后继都是必胜状态，或根本无路可走，则当前状态必败；其余情况为平局。
3. 当 $a=1$ 且 $2^b>n$ 时，底数无法增加，而指数可以一直增加，游戏不会结束，因此是平局。
4. 当 $b=1$ 且 $(a+1)^2>n$ 时，之后只能不断增加底数。剩余操作次数为 $n-a$，可以直接根据奇偶性判断胜负，避免搜索过长的一次链。

**算法步骤：**

1. 用 `check(a,b)` 通过逐次乘法判断 $a^b\le n$，一旦超过 $n$ 就立即停止，避免继续递归。
2. 定义 `dfs(a,b)` 返回当前状态为必败、必胜还是平局，并用 `f[a][b]` 记忆化。
3. 分别尝试 $(a+1,b)$ 和 $(a,b+1)$：存在必败后继就返回必胜；所有后继均必胜则返回必败；否则返回平局。
4. 对每组询问输出对应的玩家名或 `Missing`。

**时间复杂度：**设实际访问的底数上界为 $A$、指数上界为 $B$，复杂度为 $O(AB^2+t)$，空间复杂度为 $O(AB)$；代码中取 $A=10^5$、$B=32$。

**代码：**

```c++
#define int long long

int n,a,b;
const int N=1e5+10;
vector<vector<int>> f;

// 判断a^b是否不超过n，逐次乘法可以及时停止
bool check(int a,int b){
    int res=1;
    for(int i=1;i<=b;i++){
        res*=a;
        if(res>n) return false;
    }
    return true;
}

// -1未访问，0必败，1必胜，2平局
int dfs(int a,int b){
    if(a==1 && !check(2,b)) return 2;
    if(b==1){
        if((a+1)>n/(a+1)){
            if((n-a)%2!=0) return 1;
            else return 0;
        }
    }
    if(a>n) return 0;

    if(f[a][b]!=-1) return f[a][b];

    f[a][b]=2;
    bool can=false;
    bool win=true;

    if(check(a+1,b)){
        can=true;
        int res=dfs(a+1,b);
        if(res==0) return f[a][b]=1;
        if(res!=1) win=false;
    }
    if(check(a,b+1)){
        can=true;
        int res=dfs(a,b+1);
        if(res==0) return f[a][b]=1;
        if(res!=1) win=false;
    }

    if(win) return f[a][b]=0;
    if(!can) return f[a][b]=0;
    return f[a][b]=2;
}

void solve(){
    cin>>n;
    int t;
    cin>>t;
    f.assign(N,vector<int>(33,-1));
    while(t--){
        cin>>a>>b;
        int res=dfs(a,b);
        if(res==0) cout<<"Stas"<<endl;
        else if(res==1) cout<<"Masha"<<endl;
        else cout<<"Missing"<<endl;
    }
}
```
