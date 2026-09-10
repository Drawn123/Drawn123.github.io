---
title: "ABC 474E One Time Coupon"
date: 2026-09-09
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "贪心 | Greedy"
  - "前缀和 | Prefix Sum"

difficulty: ""
platform:
  - "AtCoder"
problem_id: "ABC474E"
weight: 10
pinned: false
draft: false
---

## E - One Time Coupon

[E - One Time Coupon](https://atcoder.jp/contests/abc474/tasks/abc474_e)

### 题意

某商店出售 $N$ 种产品。每种产品可以购买任意多次。

$i$ 种产品 $(1\le i\le N)$ 可以通过以下两种方式购买：

- 不使用优惠券，以 $Ai$ 日元购买，可获得一张优惠券。
- 使用一张优惠券，以 $Bi$ 日元购买。

最初，您没有优惠券。

求至少购买一次每种商品所需的最低金额。

给你 $T$ 个测试用例，请逐个求解。



### 问题转化

题目的难点在于：**商品可以重复购买来“刷券”，且优惠券可以跨商品通用**。这导致我们无法在遍历单个商品时单独决定“它买原价还是优惠价”。

为了消除这种无后效性，我们换一个视角，把问题转化为**求最佳分界线 $k$**：

1. **按折扣排序**：我们将所有商品按照折扣力度 $\text{diff}_i = A_i - B_i$ **从大到小**排序。要用优惠券，必然优先给折扣最大（最省钱）的商品用。
2. **划定分界线 $k$**：假设我们决定**正好让前 $k$ 个商品享用优惠券**：
   - **前 $k$ 个商品**：以优惠价 $B_i$ 购买（消耗 $k$ 张券）。
   - **后 $N-k$ 个商品**：以原价 $A_i$ 购买（产生 $N-k$ 张免费券）。
3. **缺口统一兜底**：
   - 此时我们消耗了 $k$ 张券，获得了 $N-k$ 张券。
   - 优惠券缺口为 $\max(0, 2k - N)$ 张。
   - 缺少的券，统一以最低成本 $\min(A)$ 重复购买刷齐。

只要我们枚举 $k \in [0, N]$，就涵盖了所有可能的购买方案。



### 易错点

在思考这道题时，容易陷入以下三个逻辑误区：

1. **局部贪心误区（误以为 $\text{diff}_i \ge \min(A)$ 就能独立决策）**
   - *错因*：忽视了“全价购买后 $N-k$ 个商品本身会赠送免费券”。免费券的成本是 0，不需要为每个用券的商品都付出一次 $\min(A)$ 的刷券代价。
2. **时序盲区（缺券时现场加 $\min(A)$）**
   - *错因*：在遍历过程中遇到缺券就现场刷一次 $\min(A)$，导致优惠券无法在全局最优范围内调配。
3. **忽略优惠券的动态边际成本**
   - *错因*：一张优惠券的成本可能是 $0$（免费赠送）、可能是放弃折扣的差价 $A_j - B_j$，也可能是重复购买的 $\min(A)$。试图用单个 `if-else` 去匹配这种动态成本必然失败。



### AC代码

```c++
struct p{
    int a,b,diff;
    bool operator<(const p& o) const{
        return diff<o.diff;
    }
};

void solve(){
    int n;
    cin>>n;
    vector<p> c(n);

    int base=0;
    int mna=1e18;
    for(int i=0;i<n;i++){
        cin>>c[i].a>>c[i].b;
        c[i].diff=c[i].a-c[i].b;
        mna=min(mna,c[i].a);
        base += c[i].a;
    }
    sort(c.begin(),c.end());

    vector<int> suf(n+1,0);
    for(int i=n-1;i>=0;i--){
        suf[i]=suf[i+1]+c[i].diff;
    }

    /*
    前k个使用原价 一共有n-k个是优惠券
    k<n-k 一共有n-2k个用a最小的那个
    k>=n-k 直接用现有的优惠券就行 
    枚举每一个位置求最优解即可
    */
    int ans=1e18;
    for(int k=1;k<=n;k++){
        int cur=base;
        if(k<n-k){
            int mon=n-2*k;
            cur += mon*mna;
            cur -= suf[k];
        }
        else{
            cur -= suf[k];
        }
        ans=min(ans,cur);
    }
    cout<<ans<<endl;
}
```