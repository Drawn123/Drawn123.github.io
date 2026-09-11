---
title: "CF 1101 div2 C1 C2"
date: 2026-07-17
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"
  - "三分 | Ternary Search"

difficulty: ""
platform:
  - "Codeforces"
problem_id: "CF2232C1"
weight: 10
pinned: false
draft: false
---



## CF 1101 div2 C1C2 

[Problem - C1 - Codeforces](https://codeforces.com/contest/2232/problem/C1)   [Problem - C2 - Codeforces](https://codeforces.com/contest/2232/problem/C2)

### 思路

* 题意：$n$ 个人排队入座，最多 $t$ 张桌子且每张限坐 $s$ 人。`I` 必须开新桌，`E` 必须填旧桌空缺，而 `A` 既能开新桌也能填空缺；在队列时序不可逆下，求如何抉择每个 `A` 的行为，使最终入座总人数最大。

#### C1暴力

* 因为 A 既可以开新的桌子，也可以填补旧桌子的空缺，所以我们可以枚举一下有多少的 A 当作 I 用去开辟新的桌子，直接暴力枚举每一种情况找最大值即可 
* 时间复杂度为 $O(n^2)$

```c++
void solve(){
    cin>>n>>x>>s;
    string ss;
    cin>>ss;
    ss=" "+ss;
    int cnt=0;
    for(int i=1;i<=n;i++){
        if(ss[i]=='A') cnt++;
    }
    int ans=-1e18;
    for(int j=0;j<=cnt;j++){
        int m=j;
        int cur=0;
        int t=0;// 已经用过的桌子总数
        for(int i=1;i<=n;i++){
            if(ss[i]=='I'){
                if(t<x){
                    t++;
                    cur++;
                }
            }
            else if(ss[i]=='E'){
                // 现有的桌子没有坐满就坐
                if(cur<t*s){
                    cur++;
                }
                // .
            }
            else{
                if(m>0){
                    if(t<x){
                        t++;
                        cur++;
                    }
                    m--;
                }
                else{
                    if(cur<t*s){
                        cur++;
                    }
                }
            }
        }
        ans=max(ans,cur);
    }
    cout<<ans<<endl;
}
```

#### C2

##### 法一：三分

* 本题的本质是决策队列中前 $m$ 个遇到的 `'A'` 强制作为 `'I'`（开辟新桌），而后续的 `'A'` 强制作为 `'E'`（填补空缺）。

  最终成功入座的总人数关于 $m$ 呈**单峰函数**关系：

  1. **左侧递增段**：若 $m$ 较小，开辟的桌子总数不足，总容量受限，导致后续大量的 `'E'` 无法入座；此时增加 $m$ 可以直接释放更多的座位容量，入座人数递增。
  2. **右侧递减段**：若 $m$ 过大，前面的 `'A'` 过早耗尽了上限 $t$ 张桌子的名额。当队列后方真正不可替代的 `'I'` 到达时，由于桌数已达上限，这些 `'I'` 将被迫离场，从而导致总人数下滑。

* 具体的 `check` 就按照原来暴力的写就行

* 由于 `check(mid)` 函数的返回值容易出现连续相等的“平台期”，直接用传统的 `len / 3` 三分容易在平地处割错区间导致漏掉最优解。因此这里采用**基于导数的二分法**来实现三分逻辑：通过比较 `check(m)` 和 `check(m + 1)` 的大小关系来判断当前处于上坡还是下坡，从而极其精准地逼近最值点，完美规避平地的干扰。

* 时间复杂度为 $O(n\log n)$ 

* 普通三分法是可以过的 

```c++
void solve_ternary(){
    cin>>n>>x>>s;
    cin>>ss;
    int cntA=0;
    for(char c:ss) if(c=='A') cntA++;
    
    int l=0,r=cntA;
    int ans=0;
    while(r-l>2){
        int m1=l+(r-l)/3;
        int m2=r-(r-l)/3;
        int res1=check(m1);
        int res2=check(m2);
        ans=max({ans,res1,res2});
        if(res1<res2) l=m1;
        else r=m2;
    }
    
    for(int i=l;i<=r;i++){
        ans=max(ans,check(i));
    }
    cout<<ans<<endl;
}
```

* 这个是基于导数的二分法

```c++
const int N=2e5+10;
string ss;
int n,x,s;
int check(int mid){
    int m=mid;
    int cur=0;
    int t=0;// 已经用过的桌子总数
    for(int i=0;i<n;i++){
        if(ss[i]=='I'){
            if(t<x){
                t++;
                cur++;
            }
        }
        else if(ss[i]=='E'){
            if(cur<t*s){
                cur++;
            }
        }
        else{
            if(m>0){
                if(t<x){
                    t++;
                    cur++;
                }
                m--;
            }
            else{
                if(cur<t*s){
                    cur++;
                }
            }
        }
    }
    return cur;
}
void solve_ternary(){
    cin>>n>>x>>s;
    cin>>ss;
    int cntA=0;
    for(char c:ss) if(c=='A') cntA++;
    
    int l=0,r=cntA;
    while(l<r){
        int mid=l+(r-l)/2;
        if(check(mid)<check(mid+1)){
            l=mid+1;
        }
        else{
            r=mid;
        }
    }
    cout<<check(l)<<endl;
}
```

##### 法二：二分

* 与三分法直接寻找最优决策 $m$ 不同，二分答案法直接对最终可能入座的总人数 $mid$ 进行二分搜索。

  由于能入座的人数具有明显的单调可行性（若能装下 $mid$ 个人，则一定能装下更少的人），我们可以将原问题转化为可行性判定问题：

  1. **答案范围**：最终成功入座的人数必然在 $[0, n]$ 之间，满足单调区间性质。
  2. **可行性检验**：对于当前二分出的目标人数 $mid$，通过贪心模拟队列的时序状态。在满足目标人数 $mid$ 的前提下，计算出我们至少需要消耗多少个 `'A'` 来强行开桌，以及当前桌数能否支撑该人数。如果满足要求则增大目标（$l = mid+1$），否则缩小目标（$r = mid-1$）。

  该方法将最优化问题巧妙地转变成了单调判定问题，通过 $\log(n)$ 次判定即可逼近最大入座人数。

```c++
const int N=2e5+10;
string ss;
int n,x,s;
bool check(int limit){
    int need=0;
    int cur=0;
    int t=0;
    for(int i=0;i<n;i++){
        if(ss[i]=='I'){
            if(t<x){
                t++;
                if(cur<limit) cur++;
            }
        }
        else if(ss[i]=='E'){
            if(cur<t*s && cur<limit) cur++;
        }
        else{
            if(t<x && need<limit){
                t++;
                need++;
                if(cur<limit) cur++;
            }
            else if(cur<t*s && cur<limit){
                cur++;
            }
        }
    }
    return cur>=limit;
}
void solve_binary(){
    cin>>n>>x>>s;
    cin>>ss;
    
    int l=0,r=n;
    int ans=0;
    while(l<=r){
        int mid=l+(r-l)/2;
        if(check(mid)){
            ans=mid;
            l=mid+1;
        }
        else{
            r=mid-1;
        }
    }
    cout<<ans<<endl;
}
```

##### 法三：线性规划

* 线性扫描不需要去枚举任何分界线，而是在遍历队列时，实时维护当前入座人数下**可能使用的最少桌数 `l_table`** 和 **最多桌数 `r_table`**。
  1. 遇到 `'A'` 时，若能入座，则人数加 1。如果人数超过了最少桌数能提供的容量上限（`ans > l_table * s`），说明必须多开一张桌子以维持当前人数，`l_table` 强行加 1；同时由于 `'A'` 拥有开桌能力，最大可能桌数 `r_table` 也可以加 1（不能超过全局上限 `x`）。
  2. 遇到 `'I'` 时，必须消耗一张桌子。若最少桌数已满则无法入座；否则上下限桌数均加 1，人数加 1。
  3. 遇到 `'E'` 时，不具备开桌能力，上限不变。若能入座则人数加 1，且同样在人数突破最小容量时让 `l_table` 加 1。

```c++
const int N=2e5+10;
string ss;
int n,x,s;
void solve_linear(){
    cin>>n>>x>>s;
    cin>>ss;
    
    int l_table=0,r_table=0;
    int ans=0;
    for(int i=0;i<n;i++){
        if(ss[i]=='A'){
            if(x*s==ans) continue;
            ans++;
            if(ans>l_table*s) l_table++;
            r_table=min(x,r_table+1);
        }
        else if(ss[i]=='I'){
            if(l_table==x) continue;
            ans++;
            l_table++;
            r_table=min(x,r_table+1);
        }
        else if(ss[i]=='E'){
            if(ans==r_table*s) continue;
            ans++;
            if(ans>l_table*s) l_table++;
        }
    }
    cout<<ans<<endl;
}
```

