---
title: "CF 1705C Mark and His Unfinished Essay"
date: 2026-11-04
knowledge_id: "solution-cf-1705c"
url: "/algorithm/solutions/implementation/cf-1705c/"
tags:
  - "字符串 | String"
  - "模拟 | Simulation"
platform:
  - "Codeforces"
problem_id: "CF1705C"
draft: false
---

## CF 1705C Mark and His Unfinished Essay

[CF 1705C Mark and His Unfinished Essay](https://codeforces.com/contest/1705/problem/C)

### 题意

初始字符串长为 $n$，依次执行 $c$ 次复制：把当前串的子串 $[l_i,r_i]$ 追加到末尾。随后询问最终串第 $k$ 个字符。多组测试，$c\le40$，$\sum n\le2\times10^5$，$\sum q\le10^4$，查询位置与复制端点不超过 $10^{18}$。

### 思路

不实际复制字符串，只记录每次操作后的长度 `len[i]`。

倒序检查操作。如果 $k>len_{i-1}$，说明字符是这次追加的，它在原复制区间中的位置为

$$
k\leftarrow l_i+(k-len_{i-1})-1.
$$

映射后的位置一定在这次操作之前的字符串中，继续向前还原。处理完所有操作，$k$ 就落在初始字符串中，输出 `s[k-1]`。

**时间复杂度：**$O(n+c+qc)$。

### AC代码

```c++
void solve(){
    int n,c,q;
    cin>>n>>c>>q;
    string s;
    cin>>s;
    vector<int> l(c+1),r(c+1),len(c+1);
    len[0]=n;
    for(int i=1;i<=c;i++){
        cin>>l[i]>>r[i];
        len[i]=len[i-1]+r[i]-l[i]+1;
    }

    while(q--){
        int k;
        cin>>k;
        for(int i=c;i>=1;i--){
            if(k>len[i-1]){
                k=l[i]+k-len[i-1]-1;
            }
        }
        cout<<s[k-1]<<endl;
    }
}
```
