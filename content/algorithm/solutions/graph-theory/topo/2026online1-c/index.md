---
title: "2026 ICPC网络赛第一场 C"
date: 2026-09-07
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "ICPC"
  - "拓扑排序 | Topological Sort"
  - "图论建模 | Graph Modeling"
  - "贪心 | Greedy" 

difficulty: ""
platform:
  
problem_id: 
weight: 10
pinned: false
draft: false
---

## C. Permutation Inversions

[Permutation Inversions - Problem - QOJ.ac](https://qoj.ac/contest/4071/problem/20018)

#### 题意

给定一个长度为 $n$ 的未知排列 $p = (p_1, p_2, \dots, p_n)$ 以及 $m$ 个限制条件。 每个限制条件包含一个区间 $[l_i, r_i]$ 和该区间下标的一个**全排列** $q_{i,1}, q_{i,2}, \dots, q_{i, r_i-l_i+1}$，表示必须满足：  

$$p_{q_{i,1}} < p_{q_{i,2}} < \dots < p_{q_{i,r_i-l_i+1}}$$

要求构造出一个合法排列 $p$，使其**逆序对数量最小**。若无解，则输出 `-1`。  

#### 思路

- **关系转化（图论建模）**： 限制 $p_{q_{j}} < p_{q_{j+1}}$ 说明下标 $q_j$ 的值必须严格小于 $q_{j+1}$。我们可以将其抽象为一条有向边 $q_j \to q_{j+1}$，表示 $q_j$ 在数值上应优先分配较小的值。  
- **题目隐藏性质**： 题目给出的 $q$ 是区间 $[l_i, r_i]$ 下标的全排列，这意味着在每一个限制区间内，所有位置的相对大小顺序是被**完全锁定**的。因此，只要图无环（即有解），满足约束的合法排列在局部相对顺序上已完全确定，利用**正向拓扑排序 + 小根堆**贪心构造即可直接满足所有限制并最小化逆序对。  
- **细节处理**：**`set`处理重边**

时间复杂度为 $O(n\log n)$

####  AC 代码

```c++
const int N=1e6+10;
int d[N];

void solve(){
	set<pii> s;

	int n,m;
	cin>>n>>m;
	vector<vector<int>> g(n+1);
	
	for(int i=1;i<=n;i++) {
		d[i]=0;
	}
	
	for(int i=0;i<m;i++){
		int l,r;
		cin>>l>>r;
		int len=r-l+1;
		vector<int> a(len);
		for(int j=0;j<len;j++){
			cin>>a[j];
		}
		for(int j=0;j<len-1;j++){
			if(s.find({a[j],a[j+1]})==s.end()){
				g[a[j]].push_back(a[j+1]);
				d[a[j+1]]++;
			}
		}
	}
	
	priority_queue<int,vector<int>,greater<int>> q;

	for(int i=1;i<=n;i++){
		if(d[i]==0){
			q.push(i);
		}
	}

	vector<int> tp;
	while(!q.empty()){
		int u=q.top();
		q.pop();
		tp.push_back(u);
		for(int v:g[u]){
			if(--d[v]==0){
				q.push(v);
			}
		}
	}
	
	if(tp.size()!=n){
		cout<<-1<<endl;
		return ;
	}
	
	vector<int> ans(n+1);
	int idx=1;

	for(int i=0;i<tp.size();i++){
		ans[tp[i]]=idx++;
	}

	for(int i=1;i<=n;i++){
		cout<<ans[i]<<" ";
	}
	cout<<endl;
}
```

