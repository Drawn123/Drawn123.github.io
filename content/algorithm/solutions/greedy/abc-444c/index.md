---
title: "ABC 444C AtCoder Riko"
date: 2026-02-08
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "贪心 | Greedy"
  - "排序 | Sorting"

difficulty: ""
platform:
  - "AtCoder"
problem_id: "ABC444C"
weight: 10
pinned: false
draft: false
---



## ABC 444 C AtCoder Riko

[C - AtCoder Riko](https://atcoder.jp/contests/abc444/tasks/abc444_c)

### 题意

原本有若干根长度相同的木棍。每根木棍操作后有两种可能：要么长度不变；要么断成两段，且两段长度之和等于原长。现在给出操作后所有木棍的长度，要求找出所有可能的原长，并按升序输出。

### 思路

1. 先将给出的所有长度排序。
2. 如果所有木棍都断成了两段，那么排序后，最小长度和最大长度、第二小长度和第二大长度……应该两两配对，并且每一对的和都相同。用双指针从两端向中间遍历，判断每一对首尾相加是否都等于同一个值；如果都相同，就把这个值加入 `set`，它就是一个可能的原长。这种情况要求数组长度为偶数。
3. 但答案可能有多个。例如 `5 5 10 10` 的答案是 `10` 和 `15`，而只判断“全部断成两段”的方法只能找到 `15`。
4. 继续考虑其他情况。操作后得到的每一段长度一定小于等于原长，所以排序后最后一个长度也可能是原长 `L`。如果最后一个长度可能是答案，就需要检查整个数组能否由若干根原长为 `L` 的木棍得到：等于 `L` 的可以看作没有断的木棍；其余部分应能首尾配对，并且每对之和都等于 `L`。如果检查通过，就把 `L` 也加入 `set`。
5. 最后把 `set` 中所有可能的原长按升序输出。

* 时间复杂度为 $O(n\log n)$

---

### AC代码

```c++
void solve(){
    cin>>n;
    for(int i=0;i<n;i++) cin>>a[i];
    sort(a,a+n);
    set<int> ans;
    // 判断最后一个是否满足
    int t=a[n-1];
    int pos=-1;
    for(int i=0;i<n;i++){
        if(a[i]!=a[n-1]) pos++;
        else break;
    }
    int l=0,r=pos;
    bool flag=true;
    while(l<=r){
        if(a[l]+a[r]!=a[n-1]) flag=false;
        if(l==r) flag=false;    // 前面是奇数个一定不满足
        l++;
        r--;
    }
    if(flag) ans.insert(a[n-1]);

    // 剩下就是长度为偶数的特例了，全部都裂成两段，其他的所有情况上面其实都能涵盖
    if(n%2==0){
        flag=true;
        int tar=a[0]+a[n-1];
        l=1,r=n-2;
        while(l<r){
            if(a[l]+a[r]!=tar) flag=false;
            l++;
            r--;
        }
        if(flag) ans.insert(tar);
    }
    for(int a:ans) cout<<a<<" ";
    cout<<endl;
}
```













