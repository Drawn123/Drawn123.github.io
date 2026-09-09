---
title: "2026 ICPC网络赛第一场 A"
date: 2026-09-07
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "栈 | Stack"
  - "贪心 | Greedy"
  - "ICPC"

difficulty: 
platform:
  
problem_id:
weight: 10
pinned: false
draft: false
---

## A. Recall

[Recall - Problem - QOJ.ac](https://qoj.ac/contest/4071/problem/20016)

### **题意**

维护一个初始为空的栈，处理由 `+ x`（压栈 $x$）、`T x`（查询 $x$ 存在）和 `F x`（查询 $x$ 不存在）构成的操作序列。需在序列中补全出栈操作 `-`，构造一个满足以下要求的完整操作序列：

* 栈内元素在任意时刻均互不相同。


* 所有 `T` 与 `F` 查询的结果必须与构造序列时的实际栈状态严格一致。


* 输出由 `+`、`?`、`-` 构成的操作字符序列。题目保证至少存在一种合法构造方案。



**错误做法分析与反例**

**错误逻辑（纯正序贪心）**

```cpp
void solve(){
	int n;
	cin>>n;
	
	stack<int> st;
	unordered_set<int> in;
	string ans="";
	while(n--){
		char op;
		int x;
		cin>>op>>x;
		if(op=='+'){
			if(in.count(x)){
				while(!st.empty() && in.count(x)){
					int t=st.top();
					st.pop();
					in.erase(t);
					ans += '-';
				}
			}
			st.push(x);
			in.insert(x);
			ans += '+';
		}
		else if(op=='T'){
			ans += '?';
		}
		else if(op=='F'){
			if(in.count(x)){
				while(!st.empty() && in.count(x)){
					int t=st.top();
					st.pop();
					in.erase(t);
					ans += '-';
				}
			}
			ans += '?';
		}
	}
	while(!st.empty()){
		st.pop();
		ans += '-';
	}
	cout<<ans<<endl;
}
```

**错误原因分析**

若仅在遇到 `+ x` 或 `F x` 且 $x$ 在栈中时才触发弹栈，会导致“误杀”有效元素。由于栈具有后进先出（LIFO）的特性，若 $x$ 位于栈底或较深位置，为将 $x$ 弹出，必须先将压在 $x$ 上方的所有元素一并弹出。

如果压在 $x$ 上方的某个元素 $y$ 在后续操作中仍需满足 `T y` 查询，被动弹栈会将 $y$ 提前弹出。当程序运行到后续的 `T y` 时，栈内已无 $y$，导致构造出的序列与原查询冲突。

**具体反例**

对于操作序列：`+ 1`, `+ 2`, `+ 1`, `T 2`

* 处理 `+ 1`：压入 1，栈状态 `[1]`。
* 处理 `+ 2`：压入 2，栈状态 `[1, 2]`（栈顶为 2）。
* 处理 `+ 1`：检测到 1 已在栈内，为了弹出 1，被动将栈顶的 2 和 1 依次弹出，再压入 1，栈状态变为 `[1]`。
* 处理 `T 2`：此时栈内仅剩 1，元素 2 已在前一步被误杀，引发逻辑错误。

### 思路

解决矛盾的核心在于**将“被动弹栈”转化为“主动垃圾回收”**。一个元素只要完成了它生命周期内最后一次 `T` 查询，继续留在栈内就仅会阻碍下方元素的弹出。因此，应在元素完成使命后立刻主动将其弹出。

**1. 预处理生命周期（记录 `las`）**

在正式模拟前进行第一次正序扫描：

* 为每个 `+ x` 操作分配唯一的入栈编号 `id`。
* 维护哈希表 `en`，记录数值 $x$ 当前最新的入栈编号 `id`。
* 遇到 `T x` 时，更新该 `idx` 对应元素的最后生效时刻：`las[idx] = i`。

**2. 模拟与主动出栈**

在第二次正序扫描中，按以下顺序维护栈状态：

* **必要冲突弹出**：若遇到 `+ x` 或 `F x` 且 $x$ 在栈中，按栈顺序弹出元素直到 $x$ 被弹出。
* **记录当前字符**：执行压栈或查询，在答案字符串中追加 `+` 或 `?`。
* **主动垃圾回收**：在每次操作结束前，检查栈顶元素。若栈顶元素的 `las <= i`（说明该元素后续再无 `T` 查询要求），将其主动弹出并记录 `-`。此举可防止无用元素在后续操作中阻塞其他元素的弹出。

时间复杂度为 $O(n)$

### **AC 代码**

```cpp
struct e{
    int val;
    int id;
};

void solve(){
	int n;
	cin>>n;
	vector<char> op(n);
	vector<int> x(n);
	for(int i=0;i<n;i++){
		cin>>op[i]>>x[i];
	}

	// 如果第i个是+ 对应入栈编号 
	vector<int> id(n,-1);

    // 编号为id的元素 最晚需要在第几次满足T操作 
	vector<int> las(n,-1);

    // 确定每个加进来的数值的终点
	unordered_map<int,int> en;
    int cnt=0;

    for(int i=0;i<n;i++){
        if(op[i]=='+'){
            id[i]=cnt;
            en[x[i]]=cnt;
            cnt++;
        }
        if(op[i]=='T'){
            int idx=en[x[i]];
            las[idx]=i;// 记录idx位置的元素必须要留到位置i
        }
    }

    stack<e> st;
    unordered_set<int> in;
    string ans="";

    for(int i=0;i<n;i++){
        char cop=op[i];
        int val=x[i];

        // 需要强行弹栈的情况 
        if(in.count(val) && (cop=='+' || cop=='F')){
            while(!st.empty() && in.count(val)){
                auto t=st.top();
                st.pop();
                in.erase(t.val);
                ans += '-';
            }
        }
        if(cop=='+'){
            in.insert(val);
            st.push({val,id[i]});
            ans  += '+';
        }
        if(cop=='T' || cop=='F'){
            ans += '?';
        }

        // 如果后面没有T操作直接全都删掉就行
        while(!st.empty()){
            auto t=st.top();
            if(las[t.id]>i){
                break;
            }
            ans += '-';
            in.erase(t.val);
            st.pop();
        }
    }
    cout<<ans<<endl;
}
```

