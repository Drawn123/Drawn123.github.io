---
title: "ABC 467D Concentric Circles"
date: 2026-07-18
knowledge_id: "solution-abc-467d"
url: "/algorithm/solutions/math/abc-467d/"
tags:
  - "计算几何 | Computational Geometry"
  - "数论 | Number Theory"
platform:
  - "AtCoder"
problem_id: "ABC467D"
draft: false
---

## ABC 467D Concentric Circles

[ABC 467D Concentric Circles](https://atcoder.jp/contests/abc467/tasks/abc467_d)

### 题意

给定两对点 $P\ne Q$、$R\ne S$，判断能否找到两个同心圆，分别经过 $P,Q$ 和 $R,S$，允许两圆重合。多组测试，$T\le5\times10^4$，坐标绝对值不超过 $10^9$。

### 思路

1. 经过 $P,Q$ 的圆，其圆心一定在 $PQ$ 的中垂线上；另一对点同理。因此只需判断两条中垂线是否有公共点。
2. 设圆心为 $(x,y)$，由到两点距离相等可得

   $$
   2(Q_x-P_x)x+2(Q_y-P_y)y=Q_x^2-P_x^2+Q_y^2-P_y^2.
   $$

   代码记录 $a=Q_x-P_x,b=Q_y-P_y,c=Q_x^2-P_x^2+Q_y^2-P_y^2$，对应 $2ax+2by=c$。将 $(a,b,c)$ 同除 gcd，并统一 $a,b$ 的首个非零项为正。
3. 若 $a_1b_2\ne a_2b_1$，两线相交，答案为 `Yes`；平行时只有规范化后的三个系数完全相同才有解。

不求交点坐标，也不交叉相乘比较含 $c$ 的比例。这样最大平方和不超过 $2\times10^{18}$，方向乘积不超过 $4\times10^{18}$，都在 `long long` 范围内。

**时间复杂度：**$O(\log C)$ 每组，$C$ 为系数绝对值上界。

### AC代码

```c++
void get(int x1,int y1,int x2,int y2,int &a,int &b,int &c){
    a=x2-x1;
    b=y2-y1;
    c=x2*x2-x1*x1+y2*y2-y1*y1;

    int g=gcd(a,gcd(b,c));
    a/=g,b/=g,c/=g;
    if(a<0 || (a==0 && b<0)){
        a=-a;
        b=-b;
        c=-c;
    }
}
void solve(){
    int px,py,qx,qy,rx,ry,sx,sy;
    cin>>px>>py>>qx>>qy>>rx>>ry>>sx>>sy;
    int a1,b1,c1;
    int a2,b2,c2;

    get(px,py,qx,qy,a1,b1,c1);
    get(rx,ry,sx,sy,a2,b2,c2);

    int k1=a1*b2;
    int k2=a2*b1;

    // 平行但不重合就no
    if(k1==k2){
        if(a1==a2 && b1==b2 && c1==c2){
            cout<<"Yes"<<endl;
        }
        else cout<<"No"<<endl;
    }
    else cout<<"Yes"<<endl;
}
```
