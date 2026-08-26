---
title: "链式前向星建图"
date: 2026-07-26
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "图论 | Graph Theory"
  
weight: 10
pinned: false
draft: false
---



### 链式前向星

#### 一、 什么是链式前向星？

链式前向星本质上是**用数组模拟静态链表实现的邻接表**。

在图论中，我们需要保存每个节点能到的所有“邻居节点”。传统的 `std::vector` 是动态分配内存，而在数据量极大或被严苛卡常（时间限制极紧）的竞赛题目中，链式前向星通过**预先开辟连续数组**，避免了动态内存分配与扩容开销，是目前算法竞赛中最快、最省内存的静态建图方式。

#### 二、 各个关键数组与变量的含义

无论采用结构体还是非结构体写法，链式前向星的核心都依赖以下几个关键要素：

1. **`head[u]` 数组**（存储起点信息）：
   - **含义**：保存以节点 `u` 为起点的**最后一条加进来的边**在 `edge` 数组中的下标（索引）。
   - **初值**：全设为 `-1`。若 `head[u] == -1`，说明节点 `u` 没有任何出边。
2. **`edge` 数组 / 边的属性数组**（存储边信息）：
   - **`to`**：该条边指向的目标节点（终点）。
   - **`w`**（或 `val`）：该条边的权值（如果是有权图）。
   - **`next` / `nxt`**：与当前边**起点相同**的上一条边在 `edge` 数组中的下标（索引）。
3. **`cnt` 变量**（边的全局计数器）：
   - **含义**：记录当前一共存了多少条边，同时充当新插入边的数组下标指针。初始为 `0`。

#### 三、 建图核心逻辑（头插法）

链式前向星采用的是**头插法**插入新的边 $u \to v$：

1. 把新边的终点 `v` 和权值 `w` 存入 `edge[cnt]` 中。
2. **连接链表**：让新边的 `next` 指向节点 `u` 原本的链头（即 `edge[cnt].next = head[u]`）。
3. **更新链头**：让节点 `u` 的链头更新为当前新边的下标（即 `head[u] = cnt`）。
4. **计数器递增**：`cnt++`。

> **重点**：因为是“头插法”，所以后加入节点 $u$ 的边会挂在链表最前面。这意味着在遍历节点 $u$ 的邻边时，**输出的顺序与你加入边的顺序是相反的**，但这不影响图算法逻辑。

#### 四、 两种“遍历”逻辑的区别

很多初学者容易混淆“遍历邻边”与“遍历整张图”，它们有本质不同：

1. **遍历单节点的邻边（局部遍历）**：
   - **目的**：只找节点 `u` 的**直接邻居**（一步能达到的点）。
   - **逻辑**：从 `i = head[u]` 开始，顺着 `i = edge[i].next` 一直找到 `-1` 为止。
2. **遍历整张图（全局遍历 - BFS / DFS）**：
   - **目的**：从起点出发，沿着所有可能达到的路径访问图中的**所有连通节点**。
   - **逻辑**：以 BFS（队列驱动）或 DFS（递归驱动）为主框架。**在访问每一个节点 $u$ 时，借助“遍历邻边”的循环找到它的下一个邻居 $v$**，再继续扩展下去。

#### 五、 适用场景与总结

- **适用场景**：
  1. **海量数据 / 卡常题**：对运行速度和内存限制要求极高时。
  2. **网络流 / 二分图匹配算法**：需要高效访问“反向边”（利用 `i ^ 1` 异或技巧）的场景。
  3. **树形 DP / 状态压缩图论**：不需要频繁插拔节点、图结构静态固定的题目。



**时间复杂度**

| **操作**                                         | **时间复杂度**     | **说明**                                                     |
| ------------------------------------------------ | ------------------ | ------------------------------------------------------------ |
| **1. 图的初始化 (`init`)**                       | $O(N)$ 或 $O(n)$   | 使用 `memset` 清空 `head` 数组。 全清空为 $O(N)$，按需清空为 $O(n)$。 |
| **2. 添加一条边 (`add`)**                        | $O(1)$             | **头插法**，只需修改 `e[cnt]` 的属性，以及更新 `head[u]` 和 `cnt`，全部为常数级赋值。 |
| **3. 建整个图**                                  | $O(M)$             | 插入 $M$ 条边，每条边加边复杂度为 $O(1)$，总共执行 $M$ 次。  |
| **4. 遍历节点 $u$ 的邻接边 (`print_neighbors`)** | $O(\text{deg}(u))$ | $\text{deg}(u)$ 为节点 $u$ 的出度（即 $u$ 连出去的边数）。   |
| **5. 遍历整张图 (`bfs_graph` / `dfs_graph`)**    | $O(N + M)$         | **最核心复杂度**： • 每个节点最多入队/出队 1 次（$O(N)$）； • 每条边在遍历邻居时恰好被检查 1 次（无向图为 2 次）（$O(M)$）。 |

**结构体版本**

```c++
const int N=1e5+10;// 最大节点数
const int M=2e5+10;// 最大边数（无向图开两倍）
int head[N];
int cnt;

struct edge{
    int to;
    int w;
    int next;
}e[M];

void add(int u,int v,int w){
    e[cnt].to=v;
    e[cnt].w=w;
    e[cnt].next=head[u];
    head[u]=cnt++;
}

void init(int n){
    memset(head,-1,sizeof head);
    cnt=0;
}

void print_neighbors(int u){
    cout<<"节点"<<u<<"的邻居："<<endl;;
    for(int i=head[u];i!=-1;i=e[i].next){
        int v=e[i].to;
        int w=e[i].w;
        cout<<v<<"（权："<<w<<"）"<<endl;;
    }
    cout<<endl;
}

void bfs_graph(int start,int n){
    vector<int> vis(n+1,0);
    queue<int> q;

    q.push(start);
    vis[start]=1;

    cout<<"BFS遍历图的顺序："<<endl;
    while(!q.empty()){
        int u=q.front();
        q.pop();
        cout<<u<<" ";
        for(int i=head[u];i!=-1;i=e[i].next){
            int v=e[i].to;
            if(!vis[v]){
                vis[v]=1;
                q.push(v);
            }
        }
    }
    cout<<endl;
}

void solve(){
    int n=5;
    init(n);

    add(1,2,10);
    add(1,3,5);
    add(2,4,3);
    add(3,4,8);
    add(4,5,2);

    print_neighbors(1);
    bfs_graph(1,n);
}
```

**纯数组版**

```c++
const int N=1e5+10;// 最大节点数
const int M=2e5+10;// 最大边数（无向图开两倍）
int head[N];
int cnt;

int to[M];
int weight[M];
int nxt[M];

void init(int n){
    memset(head,-1,sizeof head);
    cnt=0;
}

void add(int u,int v,int w){
    to[cnt]=v;
    weight[cnt]=w;
    nxt[cnt]=head[u];
    head[u]=cnt++;
}

void print_neighbors(int u){
    cout<<"节点"<<u<<"的邻居："<<endl;
    for(int i=head[u];i!=-1;i=nxt[i]){
        int v=to[i];
        int w=weight[i];
        cout<<v<<"（权："<<w<<"）"<<endl;
    }
    cout<<endl;
}

void bfs_graph(int start,int n){
    vector<bool> vis(n+1,false);
    queue<int> q;

    q.push(start);
    vis[start]=true;

    cout<<"BFS遍历图的顺序：";
    while(!q.empty()){
        int u=q.front();
        q.pop();
        cout<<u<<" ";

        for(int i=head[u];i!=-1;i=nxt[i]){
            int v=to[i];
            if(!vis[v]){
                vis[v]=true;
                q.push(v);
            }
        }
    }
    cout<<endl;
}

void solve(){
    int n=5;
    init(n);

    add(1,2,10);
    add(1,3,5);
    add(2,4,3);
    add(3,4,8);
    add(4,5,2);

    print_neighbors(1);
    bfs_graph(1,n);
}
```

