---
title: "CF 52C Circular RMQ"
date: 2026-08-31
lastmod: 
categories:
  - "算法 | Algorithm"
tags:
  - "数据结构 | Data Structure"
  - "线段树 | Segment Tree"
  
difficulty: ""
platform:
  - "Codeforces"
problem_id: ""
weight: 10
pinned: false
draft: false
---

## CF 52C Circular RMQ 

[Problem - C - Codeforces](https://codeforces.com/contest/52/problem/C)

​	线段树板子题，但需要注意以下几点：

1. 题目是环形修改和查询，要加左右边界大小判断

2. 输入形式
   * 使用 `getline` 读取整行，不要忘记吸收上一行行末换行符
   * 循环內部 `getline(cin,line)` 整行读取
   * `stringstream ss(line)` 把字符串 line 包装成一个输入流 ss ，ss 和 cin 一样，会跳过空格
   * **`ss >> l >> r` 与 `ss >> v`**：
     * 先用 `ss >> l >> r` 提取前两个数
     * 再利用 `if (ss >> v)` 进行尝试提取：如果这一行还有第 3 个数，提取成功返回 `true`（说明是修改）

3. 原题本身就是 0-Based 下标

```c++
struct SegTree {
	...
};

void solve(){
    int n;
    cin>>n;
    vector<int> a(n+1);
    for(int i=1;i<=n;i++) cin>>a[i];

    SegTree seg(a);
    int m;
    cin>>m;
    string line;
    getline(cin,line);

    while(m--){
        int l,r,k;
        string line;
        getline(cin,line);
        stringstream ss(line);
        ss>>l>>r;

        l++;
        r++;
        // 修改
        if(ss>>k){
            if(l<=r){
                seg.add(1,l,r,k);
            }
            else{
                seg.add(1,l,n,k);
                seg.add(1,1,r,k);
            }
        }   
        // 查询
        else{
            int ans=1e18;
            // 也可能跨界
            if(l<=r){
                ans=seg.mn(1,l,r);
            }
            else{
                ans=min(ans,seg.mn(1,1,r));
                ans=min(ans,seg.mn(1,l,n));
            }
            cout<<ans<<endl;
        } 

    }
}
```

