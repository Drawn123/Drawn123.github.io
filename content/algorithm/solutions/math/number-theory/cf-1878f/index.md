---
title: "CF 1878F Vasilije Loves Number Theory"
date: 2026-08-14
knowledge_id: "solution-cf-1878f"
url: "/algorithm/solutions/math/cf-1878f/"
tags:
  - "数论 | Number Theory"
platform:
  - "Codeforces"
problem_id: "CF1878F"
draft: false
---

## CF 1878F Vasilije Loves Number Theory

[CF 1878F Vasilije Loves Number Theory](https://codeforces.com/contest/1878/problem/F)

### 题意

维护正整数 $n$，支持将 $n$ 乘以 $x$，或重置为初值。每次乘法后判断：是否存在 $a$，使 $\gcd(a,n)=1$ 且 $d(na)=n$，其中 $d$ 是正约数个数。多组测试，初始 $n,x\le10^6$，总操作数不超过 $1000$，保证始终 $d(n)\le10^9$。

### 思路

1. 因为 $a,n$ 互质，$d(na)=d(n)d(a)$，所以必须有 $d(n)\mid n$。这也充分：若 $h=n/d(n)$，选一个不整除 $n$ 的质数 $p$，取 $a=p^{h-1}$，就有 $d(a)=h$。
2. 不直接维护越乘越大的 $n$，只记录每个质因子的指数。若 $n=\prod p^{e_p}$，则 $D=d(n)=\prod(e_p+1)$。乘以 $x$ 时分解 $x$，累加指数。
3. 将 $D$ 质因数分解，逐个比较它需要的指数是否超过 $n$ 中已有的指数，即可判断 $D\mid n$。重置时清空并重新分解初始值。

题目保证 $D\le10^9$，试除分解 $D$ 即可，不需要大整数。

**时间复杂度：**单次乘法查询 $O(\sqrt{x}+\sqrt{D}+K\log K)$，$K$ 为维护的不同质因子数；重置 $O(\sqrt{n_0}+K)$。

### AC代码

```c++
void fac(int num,map<int,int>& mp){
    for(int i=2;i*i<=num;i++){
        while(num%i==0){
            mp[i]++;
            num /= i;
        }
    }
    if(num>1){
        mp[num]++;
    }
}

void solve(){
    int n,q;
    cin>>n>>q;
    int ori=n;
    map<int,int> mp;
    fac(n,mp);
    while(q--){
        int op;
        cin>>op;
        if(op==1){
            int x;
            cin>>x;
            fac(x,mp);

            int D=1;
            for(auto [k,v]:mp){
                D=D*(v+1);
            }

            // n能否被D整除
            map<int,int> d;
            fac(D,d);

            int flag=1;
            for(auto [k,v]:d){
                if(mp[k]<v){
                    flag=0;
                    break;
                }
            }

            if(flag) cout<<"YES"<<endl;
            else cout<<"NO"<<endl;
        }
        else{
            n=ori;
            mp.clear();
            fac(n,mp);
        }
    }
    cout<<endl;
}
```
