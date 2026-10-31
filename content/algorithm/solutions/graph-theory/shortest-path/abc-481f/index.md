---
title: "ABC 481F Evil Shortest Path"
date: 2026-10-31
knowledge_id: "solution-abc-481f"
url: "/algorithm/solutions/graph-theory/shortest-path/abc-481f/"
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
platform:
  - "AtCoder"
problem_id: "ABC481F"
draft: false
---

## F - Evil Shortest Path

[F - Evil Shortest Path](https://atcoder.jp/contests/abc481/tasks/abc481_f)

### 题意

给定一个 $n$ 个点、$m$ 条边的有向图，每条边上写着一个 $1\sim9$ 的数字。沿路径依次拼接这些数字，得到这条路径的分数，允许重复经过节点和边。

求从节点 $1$ 到每个节点 $2\sim n$ 的最小分数，对 $998244353$ 取模后输出。保证所有节点都能从 $1$ 到达，图中可能有重边和自环。

$2\le n\le2\times10^5$，$n-1\le m\le2\times10^5$。

### 思路

**BFS 控制长度，分桶控制同一长度下的字典序。** 因为没有前导零，位数越少，分数越小；位数相同时，字典序越小，分数越小。

队列中存一组节点编号，同组节点的最优数字串相同。每次取出一组，将组内所有出边的终点按边上的数字放入 `bkt[1..9]`，再按 $1\sim9$ 的顺序处理。每个桶中尚未访问的节点确定答案，并组成新的一组入队，初始组为 $\{1\}$。

同一前缀按下一位从小到大扩展；不同等长前缀的大小不会因追加一位而改变。因此，队列始终先处理位数较少的组，同一层按字典序处理，每个节点第一次被访问时即可确定最优分数。注意要先收集整组的出边，再依次处理各桶。

`ans[v]` 保存最优分数的余数，初始为 $-1$ 表示未访问。取当前组的共同余数 `val=ans[cur[0]]`，追加数字 $c$ 后：

$$
\mathrm{nw}=(10\cdot\mathrm{val}+c)\bmod998244353.
$$

数值大小由访问顺序保证，不比较取模后的答案。每个节点只入队一次，每条边只扫描一次。

**时间复杂度：**$O(n+m)$，**空间复杂度：**$O(n+m)$。

### AC代码

省略头文件、命名空间和 `main`，本题调用一次 `solve()`。

```c++
#define int long long
#define endl '\n'
#define pii pair<int,int>

const int MOD=998244353;

void solve(){
    int n,m;
    cin>>n>>m;
    vector<vector<pii>> g(n+1);
    for(int i=0;i<m;i++){
        int a,b,c;
        cin>>a>>b>>c;
        g[a].push_back({b,c});
    }

    queue<vector<int>> q;
    vector<int> ans(n+1,-1);
    ans[1]=0;
    q.push({1});

    while(!q.empty()){
        auto cur=q.front();
        q.pop();

        // 同组节点的最优数字串相同
        int val=ans[cur[0]];

        vector<int> bkt[10];
        for(auto u:cur){
            for(auto [v,w]:g[u]){
                bkt[w].push_back(v);
            }
        }

        for(int c=1;c<=9;c++){
            vector<int> nxt;
            int nw=(val*10+c)%MOD;

            for(auto v:bkt[c]){
                if(ans[v]!=-1) continue;
                ans[v]=nw;
                nxt.push_back(v);
            }

            if(!nxt.empty()){
                q.push(nxt);
            }
        }
    }

    for(int i=2;i<=n;i++){
        cout<<ans[i]<<endl;
    }
}
```
