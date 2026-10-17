---
knowledge_id: "solution-cf-1063b"
url: "/algorithm/solutions/graph-theory/shortest-path/cf-1063b/"
title: "CF 1063 B Labyrinth"
date: 2026-09-23
lastmod: 2026-10-17
tags:
  - "图论 | Graph Theory"
  - "最短路 | Shortest Path"
  - "0-1 BFS"

difficulty: 
platform:
  - "Codeforces"
problem_id: "CF1063B"
weight: 10
pinned: false
draft: false
---

## B. Labyrinth

[B. Labyrinth](https://codeforces.com/problemset/problem/1063/B)

### 题意

给定一个 $n\times m$ 的迷宫，`.` 表示空地，`*` 表示障碍。从空地 $(r,c)$ 出发，每步可以向上、下、左、右移动一格，不能穿过障碍或走出迷宫。

其中向左移动的总次数不能超过 $x$，向右不能超过 $y$，向上和向下的次数不限。

求有多少个格子可以从起点到达，起点本身也计入答案。每个格子的可达性分别判断，不要求用同一条路线访问所有格子。

$1\le n,m\le2000$，$0\le x,y\le10^9$。

### 思路

1. 从起点 `(r, c)` 到达任意格子 `(i, j)`，设向左走了 `L` 步，向右走了 `R` 步，则必然有 `R - L = j - c`。因此，只要最小化向左的步数 `L`，向右的步数 `R` 也随之确定。
2. 移动的代价：向左走增加一次左移次数，代价为 `1`；向右、向上、向下走不增加左移次数，代价为 `0`。
3. 问题转化为：求从起点到所有格子的“最少左移次数”。由于边权只有 `0` 和 `1`，可以使用 **0-1 BFS**（双端队列 BFS）求解。

**时间复杂度：** `O(n * m)`，每个格子最多入队一次，双端队列操作均为 `O(1)`。

### AC代码

```cpp
int dx[4]={0,0,-1,1};
int dy[4]={1,-1,0,0};
int cost[4]={0,1,0,0};// 右 左 上 下 

void solve(){
    int n,m,r,c,x,y;
    cin>>n>>m>>r>>c>>x>>y;
    r--,c--;

    vector<string> s(n);
    for(int i=0;i<n;i++){
        cin>>s[i];
    }
    
    deque<pii> q;
    vector dis(n,vector<int>(m,1e18));
    dis[r][c]=0;
    q.push_front({r,c});

    while(!q.empty()){
        auto [x,y]=q.front();
        q.pop_front();

        for(int i=0;i<4;i++){
            int cx=x+dx[i],cy=y+dy[i];
            int w=cost[i];

            if(cx>=n || cy>=m || cx<0 || cy<0) continue;
            if(s[cx][cy]=='*') continue;

            if(dis[cx][cy]>dis[x][y]+w){
                dis[cx][cy]=dis[x][y]+w;
                if(i==1){
                    q.push_back({cx,cy});
                }
                else{
                    q.push_front({cx,cy});
                }
            }
        }
    }

    int ans=0;
    for(int i=0;i<n;i++){
        for(int j=0;j<m;j++){
            if(dis[i][j]==1e18) continue;
            int ll=dis[i][j];
            int rr=ll+j-c;
            if(ll<=x && rr<=y) ans++;
        }
    }
    cout<<ans<<endl;
}
```