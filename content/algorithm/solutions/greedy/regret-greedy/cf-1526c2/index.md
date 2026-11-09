---
title: "CF 1526C2 Potions (Hard Version)"
date: 2026-11-06
knowledge_id: "solution-cf-1526c2"
url: "/algorithm/solutions/greedy/cf-1526c2/"
tags:
  - "贪心 | Greedy"
  - "堆 | Heap"
platform:
  - "Codeforces"
problem_id: "CF1526C2"
draft: false
---

## CF 1526C2 Potions (Hard Version)

[CF 1526C2 Potions (Hard Version)](https://codeforces.com/contest/1526/problem/C2)

### 题意

初始血量为 $0$，按顺序遇到 $n$ 瓶药水，每瓶可以喝或跳过，喝下后血量增加 $a_i$，且任何时候都不能为负。求最多能喝多少瓶。$n\le2\times10^5$。

### 思路

先把每瓶都喝下，用小根堆记录已经选择的药水。如果血量变成负数，就撤销数值最小的一瓶。

出现负数时至少要少喝一瓶，撤销最小值能让剩余血量最大。之前的血量不会因此变小，之后也更容易继续喝。加入当前药水前血量非负，所以每次最多撤销一瓶。最终堆的大小就是答案。

**时间复杂度：**$O(n\log n)$。

### AC代码

```c++
void solve(){
    int n;
    cin>>n;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin>>a[i];

    priority_queue<int,vector<int>,greater<int>> q;
    int cur=0;
    for(int i=0;i<n;i++){
        q.push(a[i]);
        cur += a[i];
        if(cur<0){
            int t=q.top();
            q.pop();
            cur -= t;
        }
    }
    cout<<q.size()<<endl;

}
```
