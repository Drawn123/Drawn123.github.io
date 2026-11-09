---
title: "CF 1878E Iva & Pav"
date: 2026-08-12
knowledge_id: "solution-cf-1878e"
url: "/algorithm/solutions/basic-algorithms/cf-1878e/"
tags:
  - "二分 | Binary Search"
  - "前缀和 | Prefix Sum"
  - "位运算 | Bit Manipulation"
platform:
  - "Codeforces"
problem_id: "CF1878E"
draft: false
---

## CF 1878E Iva & Pav

[CF 1878E Iva & Pav](https://codeforces.com/contest/1878/problem/E)

### 题意

给定正整数数组，每次询问 $l,k$，求最大的 $r\ge l$，使 $a_l\&a_{l+1}\&\cdots\&a_r\ge k$，不存在输出 $-1$。多组测试，$\sum n,\sum q\le2\times10^5$，$a_i,k\le10^9$。

### 思路

固定左端点后，向右扩展区间，按位与只会丢失二进制位，数值不会增大，因此可以二分最远的合法右端点。

用 `pre[i][b]` 记录前 $i$ 个数第 $b$ 位为 $1$ 的数量。若区间内这一位的数量等于区间长度，则区间与的这一位为 $1$，每次检查枚举 $30$ 位即可。

若用 ST 表维护区间与，每次检查可降到 $O(1)$，每个询问就是 $O(\log n)$；这里保留按位前缀和的实现。

**时间复杂度：**预处理 $O(30n)$，每次询问 $O(30\log n)$。

### AC代码

```c++
int n,q;
vector<int> a;
vector<vector<int>> pre;// 前i个数的第b位是1的个数

int get(int l,int r){// [l,r]的&值
    int len=r-l+1;
    int res=0;
    for(int b=0;b<30;b++){
        if(pre[r][b]-pre[l-1][b]==len){
            res |= (1<<b);
        }
    }
    return res;
}

void solve(){
    cin>>n;
    a.resize(n+1);
    pre.assign(n+1,vector<int> (30,0));
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=n;i++){
        for(int b=0;b<30;b++){
            pre[i][b]=pre[i-1][b]+((a[i]>>b)&1);
        }
    }

    cin>>q;
    while(q--){
        int L,k;
        cin>>L>>k;
        int l=L,r=n;
        int ans=-1;
        while(l<=r){
            int mid=(l+r)/2;
            if(get(L,mid)>=k){
                ans=mid;
                l=mid+1;
            }
            else{
                r=mid-1;
            }
        }
        cout<<ans<<" ";
    }
    cout<<endl;
}
```
