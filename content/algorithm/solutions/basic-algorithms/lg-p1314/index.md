---
title: "洛谷 P1314 聪明的质检员"
date: 2026-03-09
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "前缀和 | Prefix Sum"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P1314"
weight: 10
pinned: false
draft: false
---

## LG P1314 聪明的质检员

[P1314 [NOIP 2011 提高组\] 聪明的质监员 - 洛谷](https://www.luogu.com.cn/problem/P1314)

### 题意

有 n 个矿石，编号 1∼n，每个矿石有重量 wi 和价值 vi。

给定 m 个区间 [li,ri] 和标准值 S。

你需要选择一个参数 W，对每个区间执行以下计算：

1. 统计区间内**重量 ≥W** 的矿石个数 cnti
2. 统计区间内**重量 ≥W** 的矿石总价值 sumi
3. 区间检验值：yi=cnti×sumi
4. 总检验值：Y=∑i=1myi

目标：找到一个 W，使得 ∣Y−S∣ 最小，输出这个最小值。

### 思路

#### 单调性分析

当参数 W**增大**时，满足重量 ≥W 的矿石数量会**减少**，最终总检验值 Y 会**单调递减**。

Y 是关于 W 的**单调递减函数**，完美适配**二分答案**算法。

#### 二分答案求解

- 二分范围：[0, max(wi)+1]（覆盖所有可能取值，全不满足时 Y=0）

- 每次取中间值 mid 作为候选 W，计算对应总检验值 Y

- 二分调整规则：

  1. 若 Y≥S：当前 W 太小，需要**增大W** 让 Y 减小
  2. 若 Y<S：当前 W 太大，需要**减小W** 让 Y 增大

- 全程记录最小的 ∣Y−S∣ 作为答案

#### 前缀和优化（关键）

直接暴力计算每个区间会超时，用**前缀和**预处理，将时间复杂度优化到可接受范围：

1. 预处理两个前缀和数组：

    - cnt[i]：前 i 个矿石中，重量 ≥W 的矿石数量
    - sum[i]：前 i 个矿石中，重量 ≥W 的矿石总价值

2. 区间查询公式（[l,r]）：

    - 个数：cnt[r]−cnt[l−1]
    - 总价值：sum[r]−sum[l−1]

3. 遍历所有区间累加计算总检验值 Y 即可

#### 时间复杂度

总复杂度：$O((N+M)\log max(w_i))$

#### 注意事项

1. **数据类型**：数值极大，必须使用 `long long` 避免溢出
2. **二分边界**：建议左边界 0，右边界 max(wi)+1，覆盖所有情况
3. **绝对值计算**：`long long` 类型用 `llabs()` 函数，不要用普通 `abs()`

### AC代码

```c++
const int N=2e5+10;
int n,m,s;
int y;
int l[N],r[N],w[N],v[N];
int p1[N],p2[N];
// W越大 y越小
// y很小 我们要增大y 减小w
// y很大 我们要减小y 增大w
bool check(int mid){
    y=0;
    memset(p1,0,sizeof p1);
    memset(p2,0,sizeof p2);
    // 先处理
    for(int i=1;i<=n;i++){
        if(w[i]>=mid) p1[i]=p1[i-1]+1;
        else p1[i]=p1[i-1];
        if(w[i]>=mid) p2[i]=p2[i-1]+v[i];
        else p2[i]=p2[i-1];
    }
    for(int i=1;i<=m;i++){
        int t1=p1[r[i]]-p1[l[i]-1];
        int t2=p2[r[i]]-p2[l[i]-1];        
        y += t1*t2;
    }
    if(y>s) return true;// y太大 要变小 就让w变大
    else return false;
}
void solve(){
    cin>>n>>m>>s;
    int mx=-1;
    for(int i=1;i<=n;i++){
        cin>>w[i]>>v[i];
        mx=max(mx,w[i]);
    }
    for(int i=1;i<=m;i++){
        cin>>l[i]>>r[i];
    }
    // 可行的w
    int L=0,R=mx;
    int ans=1e18;
    while(L<=R){
        int mid=(L+R)/2;
       
        if(check(mid)){
            L=mid+1;// 调大
        }
        else R=mid-1;
        ans=min(ans,abs(s-y));// .后面更新
    }
    cout<<ans<<endl;
}
```

