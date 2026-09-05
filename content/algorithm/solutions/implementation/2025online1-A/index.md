---
title: "2025 ICPC网络赛第一场 A"
date: 2026-09-03
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "模拟 | Implementation"
  - "ICPC"

difficulty: ""
platform:
  
problem_id: ""
weight: 10
pinned: false
draft: false
---

## A. Who Can Win

[Who Can Win - Problem - QOJ.ac](https://qoj.ac/contest/2513/problem/14301)

### 题意

在 ICPC 比赛封榜后，部分提交的结果显示为 `Unknown`。已知所有提交记录（包含队名、题号、提交时间、结果），且每个 `Unknown` 是否通过相互独立。要求判断哪些队伍在**某种可能的解封结果下**有希望获得第一名（冠军），按字典序输出所有可能夺冠的队伍名称。

### 核心观察

1. **队伍独立性**：每个队伍的 `Unknown` 是否通过对其他队伍的题目状态没有物理约束。因此，评估队伍 $A$ 是否能夺冠时，应当为其营造**最有利环境**（让 $A$ 拿最佳成绩），同时给所有竞争对手 $B$ 赋予**最不利环境**（让 $B$ 拿最差成绩）。
2. **极值界定 (Min-Max)**：
   - **最佳成绩 ($mx$)**：封榜前已 AC 的照算；封榜前未 AC 但有 `Unknown` 的，假设其**最早**的一次 `Unknown` 变为 AC（增加 1 个解题数，罚时加上该次提交时间与之前的 Rejected 惩罚）。
   - **最差成绩 ($mn$)**：封榜前已 AC 的照算；封榜前未 AC 的，所有 `Unknown` **全部算作 Rejected**（解题数 +0）。
3. **判定法则**：队伍 $i$ 能够夺冠，当且仅当**不存在**任何其他队伍 $j$ ($j \neq i$)，使得 $j$ 的最差成绩 $mn[j]$ **严格优于** $i$ 的最佳成绩 $mx[i]$（即 $mn[j] > mx[i]$）。

### 思路

1. **数据读入与按时间排序**：

   输入数据可能乱序，需将每个队伍每道题的所有提交记录存入 `vector`，并**严格按提交时间升序排序**。

2. **单向扫描计算极限成绩**：

   按时间遍历每道题的提交：

   - 碰到第一个 `Accepted` 即锁定该题 AC 状态，记录时间与此前 `Rejected` 次数，后续提交全部忽略。

   - 若无 `Accepted` 但有 `Unknown`，收集最早的 `Unknown` 时间及此前 `Rejected` 次数。

     根据扫描结果累加算出每支队伍的 $mx[i]$ 与 $mn[i]$。

3. **两两比对淘汰**：

   双重循环枚举队伍 $i$ 和 $j$。若存在 $mn[j] > mx[i]$，说明无论局面如何变化，$j$ 的下限都能压制 $i$ 的上限，$i$ 彻底无缘冠军。通过检验的队伍即为潜在冠军。

### AC 代码

```c++
struct sub{
    int t;
    string res;
};
// 成绩 解题数和罚时
struct sco{
    int cnt=0;
    int p=0;
    bool operator>(const sco& o)const{
        if(cnt!=o.cnt) return cnt>o.cnt;
        return p<o.p;
    }
};
// 直接取最佳状态和最差状态就行

void solve(){
    int m;
    cin>>m;
    map<string,map<char,vector<sub>>> mp;
    vector<string> team;

    for(int i=0;i<m;i++){
        string name,res;
        char pid;
        int t;
        cin>>name>>pid>>t>>res;

        if(mp.find(name)==mp.end()){
            team.push_back(name);
        }
        mp[name][pid].push_back({t,res});
    }

    int n=team.size();
    vector<sco> mx(n),mn(n);
    // 预处理每一支队伍
    for(int i=0;i<n;i++){
        string name=team[i];
        for(auto& [pid,subs]:mp[name]){
            sort(subs.begin(),subs.end(),[](sub a,sub b){
                return a.t<b.t;
            });
            int ok=0;
            int act=0,rej=0;

            vector<int> unk;
            for(auto s:subs){
                if(ok) break;
                if(s.res=="Accepted"){
                    ok=1;
                    act=s.t;
                }
                else if(s.res=="Rejected"){
                    rej++;
                }
                else{
                    unk.push_back(s.t);
                }
            }
            if(ok){
                int pen=act+20*rej;
                mx[i].cnt++;
                mx[i].p += pen;
                mn[i].cnt++;
                mn[i].p += pen;
            }
            else if(!unk.empty()){
                mx[i].cnt++;
                mx[i].p += unk[0]+rej*20;
            }
        }
    }
    // 两两对比一下找所有可能的冠军
    vector<string> ans;
    for(int i=0;i<n;i++){
        int flag=1;
        for(int j=0;j<n;j++){
            if(i==j) continue;
            if(mn[j]>mx[i]){
                flag=0;
                break;
            }
        }
        if(flag) ans.push_back(team[i]);
    }
    sort(ans.begin(),ans.end());
    
    for(string x:ans){
        cout<<x<<" ";
    }
    cout<<endl;
}
```

### 时间复杂度

- **预处理排序与扫描**：设总提交数为 $M$，按时间排序的复杂度为 $O(M \log M)$，线性扫描为 $O(M)$。
- **冠军判定**：设队伍数量为 $N$，两两比对的时间复杂度为 $O(N^2)$。
- **总时间复杂度**：$O(M \log M + N^2)$。在中小型规模（$N \le 500, M \le 10^5$）下跑不满 $10^6$ 次基本运算。