---
title: "ABC 287E Karuta"
date: 2026-09-08
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "数据结构 | Data Structure"
  - "字典树 | Trie"

difficulty: 
platform:
  - "AtCoder"
problem_id: "ABC287E"
weight: 10
pinned: false
draft: false
---

## **E - Karuta**

[E - Karuta](https://atcoder.jp/contests/abc287/tasks/abc287_e)

核心是求每个字符串与列表中**其他某个字符串**的最长公共前缀（LCP）。

在 Trie 树上，对于字符串 $S_i$，我们沿着它的字符逐节点向下走。只要某个节点 $u$ 的 `cnt[u] >= 2`，就说明**除了 $S_i$ 自身之外，至少还有一个字符串也经过了这个节点**。

只要找到沿着 $S_i$ 路径能走到的、且满足 `cnt[u] >= 2` 的**最大深度**，这个深度就是 $S_i$ 与其他字符串能达到的最长 LCP。

```c++
struct Trie{
    int tree[N][M]; // 表示从节点u沿字符c走到的子节点编号 
    int cnt[N];     // 经过该节点的字符串总数（包含了穿过它的和在这里结尾的）
    int idx;        // 当前测试用例中分配到的最新节点编号（0为根节点）
    int max_idx;    // 历史分配过的最大节点编号

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
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
                max_idx=max(max_idx,idx); // 实时更新历史最大的节点编号
            }
            u=tree[u][c];
            cnt[u]++;
        }
    }

    // 查询s与其他字符串的lcp
    int query(string s){
        int u=0;
        int lcp=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]){
                break;
            }
            u=tree[u][c];
            if(cnt[u]>=2) lcp++;
            else break;
        }
        return lcp;
    }

}trie;

void solve(){
    int n;
    cin>>n;

    vector<string> ss(n+1);
    for(int i=1;i<=n;i++){
        cin>>ss[i];
        trie.insert(ss[i]);
    }
    
    for(int i=1;i<=n;i++){
        cout<<trie.query(ss[i])<<endl;
    }
}
```

