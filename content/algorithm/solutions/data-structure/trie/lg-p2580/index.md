---
title: "P2580 于是他错误的点名开始了"
date: 2026-07-24
lastmod:
categories:
  - "算法 | Algorithm"
tags:
  - "字符串 | String"
  - "字典树 | Trie"

difficulty: ""
platform:
  - "洛谷"
problem_id: "P2580"
weight: 10
pinned: false
draft: false
---

## P2580 于是他错误的点名开始了

[P2580 于是他错误的点名开始了](https://www.luogu.com.cn/problem/P2580)

**题意：**

先给出学生名单，再按顺序点名；对每个名字判断它是否在名单中、是否已经被点过，并分别输出对应结果。

**核心观察：**

1. 需要多次判断一个名字是否在名单中，字典树可以让每次插入和查询都只扫描一遍字符串。
2. 对每个单词结尾维护三种状态：`0` 表示名单中不存在，`1` 表示存在但尚未点名，`2` 表示已经点过名。
3. 查询时只要某个字符对应的边不存在，就能立刻判定为 `WRONG`；走到末尾后再根据结尾状态区分 `OK` 和 `REPEAT`。

**算法步骤：**

1. 将名单中的所有名字逐个插入字典树，并把对应结尾节点标记为 `1`。
2. 对每次点名沿字典树查询：不存在则输出 `WRONG`。
3. 首次查到完整名字时把状态从 `1` 改为 `2` 并输出 `OK`；之后再次查到则输出 `REPEAT`。

**时间复杂度：**$O(\sum |s|)$，其中求和包含所有插入和查询字符串。

**代码：**

```c++
#define int long long

const int N=1e6+10;
const int M=26;

struct Trie{
    int tree[N][M];// 从节点u沿字符c走到的子节点编号
    int vis[N];// 0不存在，1存在未点名，2已点名
    int idx;
    int max_idx;

    void init(){
        for(int i=0;i<=max_idx;i++){
            vis[i]=0;
            memset(tree[i],0,sizeof tree[i]);
        }
        idx=0;
        max_idx=0;
    }

    Trie(){
        max_idx=0;
        idx=0;
        init();
    }

    void insert(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]){
                idx++;
                tree[u][c]=idx;
                max_idx=max(max_idx,idx);
            }
            u=tree[u][c];
        }
        vis[u]=1;
    }

    int check(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) return 0;
            u=tree[u][c];
        }
        if(vis[u]==0) return 0;
        if(vis[u]==1){
            vis[u]=2;
            return 1;
        }
        return 2;
    }
}trie;

void solve(){
    int n;
    cin>>n;
    for(int i=0;i<n;i++){
        string s;
        cin>>s;
        trie.insert(s);
    }

    int m;
    cin>>m;
    for(int i=0;i<m;i++){
        string s;
        cin>>s;
        int ans=trie.check(s);
        if(ans==0) cout<<"WRONG"<<endl;
        else if(ans==1) cout<<"OK"<<endl;
        else cout<<"REPEAT"<<endl;
    }
}
```
