---
title: "2026 ICPC网络赛第一场 L"
date: 2026-09-11
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "字典树 | Trie"
  - "最长公共前缀 | LCP"
  - "数据结构 | Data Structure"

difficulty: 
platform:
 
problem_id: 
weight: 10
pinned: false
draft: false
---

## L. Longest Common Prefix

[Longest Common Prefix - Problem - QOJ.ac](https://qoj.ac/contest/4071/problem/20027)

### 题意

给定 $n$ 个字符串 $s_1, s_2, \dots, s_n$。对于每一个 $i \in [1, n]$，定义 $f_{i, j}$ 为在前 $i$ 个字符串中**挑选任意 $j$ 个字符串**时，它们的最大公共前缀（LCP）长度。

依次输出每一个 $i$ 对应的 $\sum_{j=1}^{i}(f_{i,j} \oplus j)$ 的值。

### 暴力做法

#### 思路

Trie 树正常插入。每加入第 $i$ 个串，跑一遍 $O(i)$ 的倒序循环 `mx = max(ans[j], mx)` 来维护单调性，同时累加异或和。

 $O(N \cdot \sum \vert{}s_i\vert{} + N^2)$，**TLE**。

```c++
const int N=5e5+10;
const int M=26;

int ans[N];// 前i个字符串里 正好选k个 构成的最长公共前缀是多少 

struct Trie{
    int tree[N][M]; // 表示从节点u沿字符c走到的子节点编号 
    int cnt[N];     // 经过该节点的字符串总数（包含了穿过它的和在这里结尾的）
    int idx;        // 当前测试用例中分配到的最新节点编号（0为根节点）
    int max_idx;    // 历史分配过的最大节点编号
    int dep[N];

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
            dep[i]=0;
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
                dep[idx]=dep[u]+1;// .
                max_idx=max(max_idx,idx); // 实时更新历史最大的节点编号
            }
            u=tree[u][c];
            cnt[u]++;

            // 经过u的字符串数量有的最长公共前缀
            ans[cnt[u]]=max(dep[u],ans[cnt[u]]);
        }
    }

}trie;

void solve(){
    // 直接边插入 边模拟 
    int n;
    cin>>n;
    for(int i=1;i<=n;i++){// .
        string s;
        cin>>s;
        trie.insert(s);

        int mx=0;
        int xorr=0;
        for(int j=i;j>=1;j--){
            mx=max(ans[j],mx);
            xorr += (mx^j);// .
        }
        cout<<xorr<<endl;
    } 
}
```



### AC做法

#### 思路

1. **直击更新**：走到节点 $u$ 令 $cnt[u]++$。此时恰有 $j = cnt[u]$ 个串共享长度为 $dep[u]$ 的前缀，直接尝试刷新 $f_j$。

2. **免单调性传递**：浅层节点访问次数增长快（已将左侧较小 $j$ 堆高），深层节点只需精准更新当前刚达到的 $j$，无须向左扩散。

3. **$O(1)$ 修正异或和**：插入前先加第 $i$ 项初始贡献 $0 \oplus i = i$；若 $dep[u] > f_j$，直接执行 $\text{ans} += (dep[u] \oplus j) - (f_j \oplus j)$ 并更新 $f_j = dep[u]$。

时间复杂度 $O(\sum \vert{}s_i\vert{})$

#### AC代码

```c++
const int N=5e5+10;
const int M=26;

struct Trie{
    int tree[N][M]; // 表示从节点u沿字符c走到的子节点编号 
    int cnt[N];     // 经过该节点的字符串总数（包含了穿过它的和在这里结尾的）
    int idx;        // 当前测试用例中分配到的最新节点编号（0为根节点）
    int dep[N];
    int f[N];
    int ans=0;

    // 插入字符串 s，并返回当前时刻前 i 个字符串的答案
    int insert(const string& s,int i){
        ans += i;
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]){
                idx++;
                tree[u][c]=idx;
                dep[idx]=dep[u]+1;
            }
            u=tree[u][c];
            cnt[u]++;

            int j=cnt[u];
            int d=dep[u];
            // 若深度 d 刷新了 f[j] 的纪录，O(1) 修正答案
            if(d>f[j]){
                ans -= f[j]^j;
                f[j]=d;
                ans += f[j]^j;
            }
        }
        return ans;
    }

}trie;

void solve(){
    int n;
    cin>>n;
    for(int i=1;i<=n;i++){// .
        string s;
        cin>>s;
        int ans=trie.insert(s,i);
        cout<<ans<<endl;
    }
    
}
```