---
title: "2025山东省赛 A"
date: 2026-05-13
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "二分 | Binary Search"
  - "贪心 | Greedy"
  - "排序 | Sorting"

difficulty: ""
platform:

problem_id: 
weight: 10
pinned: false
draft: false
---



## 2025山东省赛 

[Problem - A - Codeforces](https://codeforces.com/gym/105930/problem/A)

### 题意

从 *n* 个员工中选出尽可能多的人组成团队，使得团队中每个被选员工 *i* 的等级高于 *ai* 的人数不超过其容忍度 *bi*

### 思路

* **职级从小到大考虑，每个职级选尽可能多的人；同一职级内，$b_i$ 越大越好**

* 我们看一下 `check` 函数怎么写

    * ##### 变量含义

        - `mid`：当前要检验的团队总人数
        - `cnt`：已经选中的总人数（所有等级累加）
        - `lcnt`：已经选中的、等级 **≤ 当前等级** 的人数（即 `cnt` 在数值上等于 `lcnt`，但语义上 `lcnt` 是处理到当前等级时的已选人数，用于判断）
        - `cur`：当前等级的所有员工（已按 `b` 降序排好）
        - `res`：当前等级最多能选的人数（不超过剩余名额和该等级总人数）
        - `f`：当前等级实际选择的人数
        - `tmp`：临时存储本次 `check` 选中的编号

    ##### 条件推导

    原约束：团队中等级高于 `a_i` 的人数 ≤ `b_i`。
    设团队总人数 `mid`，等级 ≤ `a_i` 的人数为 `lcnt + t`（`lcnt` 是之前低等级已选人数，`t` 是当前等级要选的人数，包含 `i` 自身）。
    那么等级高于 `a_i` 的人数 = `mid - (lcnt + t)`。
    条件变为：`mid - (lcnt + t) ≤ b_i`。

    对于当前等级，我们想选 `t` 个人（`t` 从大到小尝试）。这 `t` 个人中 `b` 最小的是第 `t` 个人（因为已按 `b` 降序），所以只要 `mid - (lcnt + t) ≤ cur[t-1].b` 成立，前 `t` 个人都满足（因为前 `t-1` 个人的 `b` 更大，条件更易满足）。

    ##### 贪心决策

    - 同等级内 `b` 降序，优先考虑 `b` 大的。
    - 对于当前等级，计算最多能选 `res = min(cur.size(), mid - cnt)`。
    - 从 `t = res` 往下枚举，找到第一个（即最大的）`t` 满足 `mid - (lcnt + t) ≤ cur[t-1].b`。
    - 如果找到就选 `f = t` 个人，否则 `f = 0`。
    - 将这 `f` 个人的编号加入 `tmp`，更新 `cnt += f`，`lcnt += f`。
    - 继续下一等级，直到 `cnt == mid` 或遍历完所有员工。

* 时间复杂度为 $O(n\log n)$ 

### AC代码

```c++
struct p{
    int a,b,id;
};// 职级 最多能和多少个人一起

int n;
vector<p> e;
vector<int> ans,tmp;
// 检查是否能选出mid个人
bool check(int mid){
    if(mid==0) return true;
    tmp.clear();
    int cnt=0;// 当前总共选的人数
    int lcnt=0;// 职级小于等于当前职级的人数

    // 被选中的人里至多只能有bi个职级大于 ai
    // 也就是说mid-(职级小于等于ai的人数)<=bi
    // mid-bi<=(职级小于等于ai的人数)

    int i=0;
    while(i<n && cnt<mid){
        vector<p> cur;
        int j=i;
        while(j<n && e[j].a==e[i].a){
            cur.push_back(e[j]);
            j++;
        }
        // 尝试在这一层选t个人
        int f=0;
        int res=min((int)cur.size(),mid-cnt);
        for(int t=res;t>=1;t--){
            if(mid-(lcnt+t)<=cur[t-1].b){
                f=t;
                break;
            }
        }
        for(int k=0;k<f;k++){
            tmp.push_back(cur[k].id);
        }
        cnt += f;
        lcnt += f;
        i=j;
    }
    
    return cnt==mid;
}
void solve(){
    cin>>n;
    e.assign(n,{0,0,0});// 初始化
    for(int i=0;i<n;i++){
        cin>>e[i].a>>e[i].b;
        e[i].id=i+1;
    }
    sort(e.begin(),e.end(),[](p x,p y){
        if(x.a!=y.a) return x.a<y.a;
        return x.b>y.b;
    });

    int l=0,r=n,cnt=0;
    while(l<=r){
        int mid=(l+r)/2;
        if(check(mid)){
            ans=tmp;
            cnt=mid;
            l=mid+1;
        }
        else r=mid-1;
    }
    cout<<ans.size()<<endl;
    for(int i=0;i<ans.size();i++){
        cout<<ans[i]<<" ";
    }
    cout<<endl;
}
```

