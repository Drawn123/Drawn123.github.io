---
title: "ICPC 算法模板"
date: 2026-08-23
lastmod: 2026-08-25
categories:
  - "总结 | conclusion"
tags:
difficulty: 
platform:
problem_id:
weight: 1
pinned: true
draft: false
---

## 数学

### 最大公约数

时间复杂度为 $O(log(\min{(a,b)}))$

```c++
int gcd(int a,int b){
    if(b==0) return a;
    return gcd(b,a%b);
}
```

```c++
int gcd(int a,int b){
	while(b){
        int temp=b;
        b=a%b;
        a=temp;
    }
    return a;
}
```

### 最小公倍数

```c++
int lcm(int a,int b){
    return a/gcd(a,b)*b;
}
```

### 快速幂与乘法逆元

计算  $a^b mod MOD$

```c++
int qpow(int a,int b){
    int ret=1;
    while(b){
        if(b&1) ret = ret*a%MOD;
        a=a*a%MOD;
        b >>= 1;
    }
    return ret;
}
int inv(int x){
    return qpow(x,MOD-2);
}
```

$\frac{a}{b} \bmod m \equiv a \cdot b^{m-2} \pmod{m}$

调用：`a*inv(b)%MOD`

### 埃氏筛法

时间复杂度为 $O(n \log \log n)$ 

```c++
// 筛出 [1,n] 的所有质数
vector<int> primes;
vector<int> is_prime;// 1表示质数，0表示合数

void sieve(int n){
    is_prime.assign(n+1,1);
    primes.clear();
    is_prime[0]=is_prime[1]=0;
    for(int i=2;i<=n;i++){
        if(is_prime[i]){
            primes.push_back(i);
            if(i*i<=n){
                for(int j=i*i;j<=n;j+=i){
                    is_prime[j]=0;
                }
            }
        }
    }
}
```

这个合法上界不要开太大



### 取模运算

```c++
const int MOD = 1e9 + 7;
// (a + b) % MOD
int add(int a, int b) {
  int ret = a + b;
  if (ret >= MOD) ret -= MOD;
  return ret;
}
// (a - b) % MOD
int sub(int a, int b) {
  int ret = a - b;
  if (ret < 0) ret += MOD;
  return ret;
}
// (a * b) % MOD
int mul(int a, int b) {
  return 1LL * a * b % MOD;
}
// (a / b) % MOD = a * inv(b) % MOD
int div_mod(int a, int b) {
  return mul(a, inv(b));
}
// 将任意整数 x 转为 [0, MOD-1] 范围
int norm(int x) {
  return (x % MOD + MOD) % MOD;
}
```



### 浮点数二分

```c++
// 浮点数二分求平方根
// 公式：x 的平方根满足 mid^2 <= x < (mid+eps)^2
double sqrt_binary(double x) {
  double l = 0, r = x;
  for (int i = 0; i < 100; i++) { // 固定迭代次数，保证精度
    double mid = (l + r) / 2;
    if (mid * mid < x) l = mid;  // mid^2 < x，答案在 [mid, r]
    else r = mid;         // mid^2 >= x，答案在 [l, mid]
  }
  return l;
}
```

### 三分

#### 1. 浮点三分（实数域单峰函数求极值）

假设函数 `f(x)` 在区间 `[l, r]` 上是单峰的，求极小值点（极大值只需改比较符号）。

```c++
// 浮点数三分
// 单谷函数（先减后增，求谷底）
double f(double x){
    return (x-3.14159)*(x-3.14159)+10.0;
}
double ternary_search_float(double l,double r){
    for(int i=0;i<100;i++){
        double m1=l+(r-l)/3.0;
        double m2=r-(r-l)/3.0;
        if(f(m1)<f(m2)){
            r=m2;
        }
        else l=m1;
    }
    return l;
}
void solve(){
    double ans=ternary_search_float(-1.0,100.0);
}
```

#### 2. 整数三分（离散域严格单峰函数求最值）

适用于定义在整数区间上的凸/凹函数。以**求最小值**为例（求最大值改符号）。

```c++
// 整数三分 
// 单谷函数（先减后增，求谷底）
double f(int x){
    return (x-5)*(x-5)+10;
}

int ternary_search_int(int l,int r){

    while(r-l>2){
        int m1=l+(r-l)/3;
        int m2=r-(r-l)/3;
        if(f(m1)<f(m2)){
            r=m2;
        }
        else l=m1;
    }
    int res=l;
    for(int i=l+1;i<=r;i++){
        if(f(i)<f(res)) res=i;
    }
    return res;
}
void solve(){
    int ans=ternary_search_int(0,100);
}
```

### 重载运算符

**优先队列**自定义排序方式：

```c++
// ============================================================
// 1. 单一字段：价格小的在堆顶（小根堆效果）
// ============================================================
struct Product {
    int price;

    bool operator < (const Product& other) const {
        return price > other.price;  // 价格小的在堆顶（反着写）
    }
};

// ============================================================
// 2. 单一字段：优先级高的在堆顶（大根堆效果）
// ============================================================
struct Task {
    int priority;  // 数字越大越紧急

    bool operator < (const Task& other) const {
        return priority < other.priority;  // 优先级高的在堆顶（顺着写）
    }
};

// ============================================================
// 3. 多字段：主要年级小的在堆顶 + 次要分数小的在堆顶
// ============================================================
struct Point {
    int x, y;

    bool operator < (const Point& other) const {
        if (x != other.x) return x > other.x;  // x 小的在堆顶（反着写）
        return y > other.y;                    // y 小的在堆顶（反着写）
    }
};

// ============================================================
// 4. 多字段：主要年级小的在堆顶 + 次要分数高的在堆顶
// ============================================================
struct Student {
    int grade;  // 年级
    int score;  // 分数

    bool operator < (const Student& other) const {
        if (grade != other.grade) return grade > other.grade;  // 年级小的在堆顶（反着写）
        return score < other.score;  // 分数高的在堆顶（顺着写）
    }
};

// ============================================================
// 5. 多字段：主要关卡高的在堆顶 + 次要用时短的在堆顶
// ============================================================
struct Game {
    int level;  // 关卡
    int time;   // 用时

    bool operator < (const Game& other) const {
        if (level != other.level) return level < other.level;  // 关卡高的在堆顶（顺着写）
        return time > other.time;   // 用时短的在堆顶（反着写）
    }
};

// ============================================================
// 6. 多字段：主要击杀多的在堆顶 + 次要助攻多的在堆顶
// ============================================================
struct Record {
    int kills;   // 击杀数
    int assists; // 助攻数

    bool operator < (const Record& other) const {
        if (kills != other.kills) return kills < other.kills;  // 击杀多的在堆顶（顺着写）
        return assists < other.assists;  // 助攻多的在堆顶（顺着写）
    }
};

// ============================================================
// 7. 字符串：长度短的在堆顶，同长度字典序小的在堆顶
// ============================================================
struct Word {
    string text;

    bool operator < (const Word& other) const {
        if (text.length() != other.text.length())
            return text.length() > other.text.length();  // 长度短的在堆顶（反着写）
        return text > other.text;  // 字典序小的在堆顶（反着写）
    }
};
```

1. **结构体排序的本质**：返回 `true` 代表**“前者留在前面”**
2. **优先队列的本质**：返回 `true` 的元素代表**“优先级低，被压入堆底”**（如上）
3. 优先队列
    * 多字段直接定义大根堆
    * 单一字段直接定义小根堆方便一点 `priority_queue<int,vector<int>,greater<int>>`

## 数据结构

### 二维前缀和

```c++
for(int i=1;i<=n;i++){
    for(int j=1;j<=m;j++){
        pre[i][j]=pre[i-1][j]+pre[i][j-1]-pre[i-1][j-1]+a[i][j];
    }  
} 
// 查询矩形区域内的前缀和
while(q--){
    int x1,y1,x2,y2;
    cin>>x1>>y1>>x2>>y2;
    cout<<pre[x2][y2]-pre[x2][y1-1]-pre[x1-1][y2]+pre[x1-1][y1-1]<<endl;
}
```

### 二维差分

```c++
// diff（差分矩阵）和 pre（结果前缀和矩阵）
vector<vector<int>> diff(n + 2, vector<int>(m + 2, 0));
vector<vector<int>> pre(n + 2, vector<int>(m + 2, 0)); 
// 矩阵内所有的点 +w
void add(int x1,int y1,int x2,int y2,int w){
    diff[x1][y1] += w;
    diff[x1][y2+1] -= w;
    diff[x2+1][y1] -= w;
    diff[x2+1][y2+1] += w;
}
void get(){
    for(int i = 1; i <= n; i++){
        for(int j = 1; j <= m; j++){
            pre[i][j] = pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1] + diff[i][j];
        }
    }
    // 此时的 pre[i][j] 就是差分修改后、你想要的最终原数组
}
```



### 并查集

```c++
struct DSU{
  vector<int> fa,sz;// 父节点，集合大小
  int cnt;
  DSU(int n):fa(n+1),sz(n+1,1),cnt(n){
    for(int i=1;i<=n;i++) fa[i]=i;
  }
  int find(int x){
    if(fa[x]==x) return x;
    return fa[x]=find(fa[x]);
  }
  void merge(int x,int y){
    int fx=find(x),fy=find(y);
    if(fx==fy) return ;
    if(sz[fx]<sz[fy]) swap(fx,fy);
    fa[fy]=fx;
    sz[fx] += sz[fy];
    cnt--;
  }
  bool same(int x,int y){
    return find(x)==find(y);
  }
  // x所在集合的元素个数
  int size(int x){
    return sz[find(x)];// 先找根
  }
};
```



### 树状数组

```c++
// 树状数组 (Binary Indexed Tree)
// 时间复杂度：add/query/range/kth 均为 O(log n)
// 提示：下标从 1 开始，范围 [1, n]。kth 传入的 k 代表排名
struct BIT{
    int n;
    vector<int> tr;
    BIT(int n):n(n){
        tr.resize(n+10,0);
    }
    void clear(){
        fill(tr.begin(),tr.end(),0);
    }
    inline int lowbit(int x){
        return x & -x;
    }
    // 单点修改：位置 x 加上 k
    void add(int x,int k){
        if(x<=0) return; 
        while(x<=n){
            tr[x] += k;
            x += lowbit(x);
        }
    }
    // 查询 [1, x] 前缀和
    int query(int x){
        int s=0;
        while(x>0){
            s += tr[x]; 
            x -= lowbit(x);
        }
        return s;
    }
    // 查询 [x, y] 区间和
    int range(int x,int y){
        if(y<x) return 0; 
        x=max(1LL,x); 
        return query(y)-query(x-1);
    }
    // 倍增查询全局第 k 小对应的数值（即下标）
    int kth(int k){
        int s=0;
        int i=1;
        while((i<<1)<=n) i <<= 1; 

        while(i>0){
            if(s+i<=n && tr[s+i]<k){ 
                k -= tr[s+i]; // 先扣除准备跳过的这一块的贡献
                s += i;       // 再移动指针
            }
            i >>= 1;
        }
        return s+1; 
    }
};
```

### 单调栈

1. 左进右出，大值递增站，小值递减栈
2. 根据题目要求判断是否加等号 

**STL版单调栈**

```c++
// 1. 右边第一个比当前元素大 (正向遍历 + 出栈记录)
// 原理：栈内维护单调递减。出现更大元素时，栈内比它小的元素依次出栈，它们的右边更大者就是 a[i]
vector<int> nextGreaterElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    stack<int> st;
    for(int i=0;i<n;i++){
        while(!st.empty()&&a[st.top()]<a[i]){
            res[st.top()]=a[i]; // 栈顶遇到了右边第一个比它大的 a[i]
            st.pop();
        }
        st.push(i);
    }
    return res;
}

// 2. 右边第一个比当前元素小 (正向遍历 + 出栈记录)
// 原理：栈内维护单调递增。出现更小元素时，栈内比它大的元素依次出栈，它们的右边更小者就是 a[i]
vector<int> nextSmallerElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    stack<int> st;
    for(int i=0;i<n;i++){
        while(!st.empty()&&a[st.top()]>a[i]){
            res[st.top()]=a[i]; // 栈顶遇到了右边第一个比它小的 a[i]
            st.pop();
        }
        st.push(i);
    }
    return res;
}

// 3. 左边第一个比当前元素大 (正向遍历 + 入栈前记录)
// 原理：栈内维护单调递减。弹出所有 <= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它大的
vector<int> prevGreaterElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    stack<int> st;
    for(int i=0;i<n;i++){
        while(!st.empty()&&a[st.top()]<=a[i]){
            st.pop(); // 阻挡答案的无用较小元素全部剔除
        }
        if(!st.empty()) res[i]=a[st.top()]; // 剩下的栈顶即为左边第一个更大者
        st.push(i);
    }
    return res;
}

// 4. 左边第一个比当前元素小 (正向遍历 + 入栈前记录)
// 原理：栈内维护单调递增。弹出所有 >= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它小的
vector<int> prevSmallerElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    stack<int> st;
    for(int i=0;i<n;i++){
        while(!st.empty()&&a[st.top()]>=a[i]){
            st.pop(); // 阻挡答案的无用较大元素全部剔除
        }
        if(!st.empty()) res[i]=a[st.top()]; // 剩下的栈顶即为左边第一个更小者
        st.push(i);
    }
    return res;
}
```

**数组模拟单调栈**

```c++
// 1. 右边第一个比当前元素严格大 (vector 模拟数组版本)
// 原理：栈内维护单调递减。出现更大元素时，栈内比它小的元素依次出栈，它们的右边更大者就是 a[i]
vector<int> nextGreaterElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    vector<int> stk(n+1); // vector 模拟栈
    int top=0; // top == 0 表示栈空
    
    for(int i=0;i<n;i++){
        while(top>0&&a[stk[top]]<a[i]){
            res[stk[top]]=a[i]; // 栈顶遇到了右边第一个比它大的 a[i]
            top--; // 出栈
        }
        stk[++top]=i; // 进栈
    }
    return res;
}

// 2. 右边第一个比当前元素严格小 (vector 模拟数组版本)
// 原理：栈内维护单调递增。出现更小元素时，栈内比它大的元素依次出栈，它们的右边更小者就是 a[i]
vector<int> nextSmallerElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    vector<int> stk(n+1);
    int top=0;
    
    for(int i=0;i<n;i++){
        while(top>0&&a[stk[top]]>a[i]){
            res[stk[top]]=a[i]; // 栈顶遇到了右边第一个比它小的 a[i]
            top--; // 出栈
        }
        stk[++top]=i; // 进栈
    }
    return res;
}

// 3. 左边第一个比当前元素严格大 (vector 模拟数组版本)
// 原理：栈内维护单调递减。弹出所有 <= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它大的
vector<int> prevGreaterElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    vector<int> stk(n+1);
    int top=0;
    
    for(int i=0;i<n;i++){
        while(top>0&&a[stk[top]]<=a[i]){
            top--; // 剔除无用的较小或相等元素
        }
        if(top>0) res[i]=a[stk[top]]; // 剩下的栈顶即为左边第一个严格更大者
        stk[++top]=i; // 进栈
    }
    return res;
}

// 4. 左边第一个比当前元素严格小 (vector 模拟数组版本)
// 原理：栈内维护单调递增。弹出所有 >= a[i] 的元素，剩下还在栈顶的就是左边第一个严格比它小的
vector<int> prevSmallerElement(const vector<int>& a){
    int n=a.size();
    vector<int> res(n,-1);
    vector<int> stk(n+1);
    int top=0;
    
    for(int i=0;i<n;i++){
        while(top>0&&a[stk[top]]>=a[i]){
            top--; // 剔除无用的较大或相等元素
        }
        if(top>0) res[i]=a[stk[top]]; // 剩下的栈顶即为左边第一个严格更小者
        stk[++top]=i; // 进栈
    }
    return res;
}
```



### 单调队列

**STL版单调队列**

```c++
// 单调队列：滑动窗口最小值 (STL 版本)
// 原理：维护双端队列，队首始终是窗口内最小值，队内元素单调递增
vector<int> slidingWindowMin(const vector<int>& a,int k){
    int n=a.size();
    vector<int> mn;
    deque<int> q; // 存放下标

    for(int i=0;i<n;i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标
        while(!q.empty() && q.front()<i-k+1){
            q.pop_front();
        }
        // 移除队尾所有大于 a[i] 的元素，保持单调递增
        while(!q.empty() && a[q.back()]>a[i]){
            q.pop_back();
        }
        q.push_back(i);
        // 窗口形成后，队首就是最小值
        if(i>=k-1) mn.push_back(q.front());
    }
    return mn;
}

// 单调队列：滑动窗口最大值 (STL 版本)
// 原理：维护双端队列，队首始终是窗口内最大值，队内元素单调递减
vector<int> slidingWindowMax(const vector<int>& a,int k){
    int n=a.size();
    vector<int> mx;
    deque<int> q; // 存放下标

    for(int i=0;i<n;i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标
        while(!q.empty() && q.front()<i-k+1){
            q.pop_front();
        }
        // 移除队尾所有小于 a[i] 的元素，保持单调递减
        while(!q.empty() && a[q.back()]<a[i]){
            q.pop_back();
        }
        q.push_back(i);
        // 窗口形成后，队首就是最大值
        if(i>=k-1) mx.push_back(q.front());
    }
    return mx;
}
```

**数组模拟单调队列**

```c++
// 单调队列：滑动窗口最小值 (vector 模拟数组版本)
// 原理：用 head 和 tail 指针维护 vector 队列，队首始终是窗口内最小值
vector<int> slidingWindowMin(const vector<int>& a,int k){
    int n=a.size();
    vector<int> mn;
    vector<int> q(n+1); // vector 模拟队列空间
    int head=1,tail=0; // 初始化：head > tail 表示队空

    for(int i=0;i<n;i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标 (队头出队)
        while(head<=tail&&q[head]<i-k+1){
            head++;
        }
        // 移除队尾所有大于 a[i] 的元素，保持单调递增 (队尾出队)
        while(head<=tail&&a[q[tail]]>a[i]){
            tail--;
        }
        q[++tail]=i; // 进队尾
        // 窗口形成后，队首就是最小值
        if(i>=k-1) mn.push_back(q[head]);
    }
    return mn;
}

// 单调队列：滑动窗口最大值 (vector 模拟数组版本)
// 原理：用 head 和 tail 指针维护 vector 队列，队首始终是窗口内最大值
vector<int> slidingWindowMax(const vector<int>& a,int k){
    int n=a.size();
    vector<int> mx;
    vector<int> q(n+1);
    int head=1,tail=0; // 初始化：head > tail 表示队空

    for(int i=0;i<n;i++){
        // 移除超出窗口左边界 [i-k+1, i] 的下标 (队头出队)
        while(head<=tail&&q[head]<i-k+1){
            head++;
        }
        // 移除队尾所有小于 a[i] 的元素，保持单调递减 (队尾出队)
        while(head<=tail&&a[q[tail]]<a[i]){
            tail--;
        }
        q[++tail]=i; // 进队尾
        // 窗口形成后，队首就是最大值
        if(i>=k-1) mx.push_back(q[head]);
    }
    return mx;
}
```



### 字典树

#### 字符串字典树

```c++
const int N=1e5+10;
const int M=26;

struct Trie{
    int tree[N][M]; // 表示从节点u沿字符c走到的子节点编号 
    int cnt[N];     // 经过该节点的字符串总数（包含了穿过它的和在这里结尾的）
    int endcnt[N];  // 恰好以该节点结尾的字符串数量
    bool have[N];   // 标记是否有单词以该节点结尾
    int idx;        // 当前测试用例中分配到的最新节点编号（0为根节点）
    int max_idx;    // 历史分配过的最大节点编号

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
            endcnt[i]=0;
            have[i]=false;
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

    // 1.插入字符串
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
        have[u]=true;
        endcnt[u]++;
    }

    // 2.查询s的前缀包含了多少已经插入的字符串 
    // 即：沿着s的路径走，累加沿途所有的endcnt[u]
    int query_prefix(const string& s){
        int u=0;
        int sum_endcnt=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) break;
            u=tree[u][c];
            sum_endcnt += endcnt[u];
        }
        return sum_endcnt;
    }

    // 3.查询以s为前缀的字符串有多少个
    int query_pre(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) return 0;
            u=tree[u][c];
        }
        return cnt[u];
    }

    // 4.查询字典树里面有多少个完全相同的s
    int query_cnt(const string& s){
        int u=0;
        for(char ch:s){
            int c=ch-'a';
            if(!tree[u][c]) return 0;
            u=tree[u][c];
        }
        return endcnt[u];
    }

    // 5.删除一个字符串
    void delet(const string& s){
        int u=0;
        if(query_cnt(s)==0) return ;
        for(char ch:s){
            int c=ch-'a';
            u=tree[u][c];
            cnt[u]--;
        }
        endcnt[u]--;
        if(endcnt[u]==0){
            have[u]=false;
        }
    }

    // 6.字典树上的dfs回溯搜索（按照字典序输出所有字符串）
    void dfs(int u,string& path){
        if(have[u]){
            cout<<"Found word:"<<path<<"(count:"<<endcnt[u]<<")\n";
        }
        for(int i=0;i<M;i++){
            if(tree[u][i]){
                path.push_back((char)('a'+i));
                dfs(tree[u][i],path);
                path.pop_back();
            }
        }
    }

    void print_all(){
        string path="";
        dfs(0,path);
    }
}trie;

void solve(){
    trie.init();

    trie.insert("apple");
    trie.insert("app");
    trie.insert("app");

    cout<<trie.query_cnt("app")<<endl;  // 输出 2 (完全匹配 app 的数量)
    cout<<trie.query_pre("app")<<endl;  // 输出 3 (以 app 为前缀的数量: apple*1 + app*2)

    trie.delet("app");
    cout<<trie.query_cnt("app")<<endl;  // 输出 1 (删掉一个后剩余的 app 数量)
    
}
```

#### 01字典树

```c++
const int MOD=998244353;
const int N=2e5+10; // 元素个数
const int BITS=30;  // 对应 0 ~ 2^30-1 的范围，即最高到第 29 位
const int M=N*BITS+10; // 静态数组总结点数上限

struct Trie01{
    int tree[M][2]; // 01 分支
    int cnt[M];     // 经过该节点的数值数量
    int endcnt[M];  // 恰好在该节点结尾的数值数量
    int idx;        // 当前分配的节点编号
    int max_idx;    // 历史分配过的最大节点编号（用于多组数据快速清空）

    void init(){
        for(int i=0;i<=max_idx;i++){
            cnt[i]=0;
            endcnt[i]=0;
            tree[i][0]=tree[i][1]=0;
        }
        idx=0;
        max_idx=0;
    }

    Trie01(){
        max_idx=0;
        idx=0;
        init();
    }

    // 1.插入数值 x
    void insert(int x){
        int u=0;
        cnt[u]++;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            if(!tree[u][bit]){
                idx++;
                tree[u][bit]=idx;
                max_idx=max(max_idx,idx); // 实时更新历史最大的节点编号
            }
            u=tree[u][bit];
            cnt[u]++;
        }
        endcnt[u]++;
    }

    // 2.删除数值 x（必须保证 x 已存在于 Trie 中）
    void delet(int x){
        int u=0;
        cnt[u]--;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            u=tree[u][bit];
            cnt[u]--;
        }
        endcnt[u]--;
    }

    // 3.查询与 x 异或【最大】所对应的数值本身
    int query_max(int x){
        int u=0,res=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            int wish=bit^1; // 优先走不同方向 (0->1, 1->0)
            if(tree[u][wish]&&cnt[tree[u][wish]]>0){
                u=tree[u][wish];
                res|=(wish<<i);
            }else{
                u=tree[u][bit];
                res|=(bit<<i);
            }
        }
        return res;
    }

    // 4.查询与 x 异或【最小】所对应的数值本身
    int query_min(int x){
        int u=0,res=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            int wish=bit; // 优先走相同方向 (0->0, 1->1)
            if(tree[u][wish]&&cnt[tree[u][wish]]>0){
                u=tree[u][wish];
                res|=(wish<<i);
            }else{
                u=tree[u][bit^1];
                res|=((bit^1)<<i);
            }
        }
        return res;
    }

    // 5.查询数字 x 出现的完整次数
    int query_cnt(int x){
        int u=0;
        for(int i=BITS-1;i>=0;i--){
            int bit=(x>>i)&1;
            if(!tree[u][bit]) return 0;
            u=tree[u][bit];
        }
        return endcnt[u];
    }

    // 6.字典树上的 dfs 遍历（按从小到大的顺序遍历树中存在的所有数值）
    void dfs(int u,int depth,int val){
        if(depth<0){
            if(endcnt[u]>0){
                cout<<"Found val:"<<val<<" (count:"<<endcnt[u]<<")\n";
            }
            return;
        }
        for(int bit=0;bit<=1;bit++){
            if(tree[u][bit]&&cnt[tree[u][bit]]>0){
                dfs(tree[u][bit],depth-1,val|(bit<<depth));
            }
        }
    }

    void print_all(){
        dfs(0,BITS-1,0);
    }
}trie;
```



### 逆序对

#### 归并排序解法

```c++
int find(int l,int r){
  if(l>=r) return 0;
  int ret=0;
  int mid=(l+r)/2;
  ret += find(l,mid);
  ret += find(mid+1,r);
  int i=l,j=mid+1,k=0;
  while(i<=mid && j<=r){
    if(a[i]<=a[j]) temp[k++]=a[i++];
    else{
      temp[k++]=a[j++];
      ret += mid-(i-1);
    }
  }
  while(i<=mid) temp[k++]=a[i++];
  while(j<=r) temp[k++]=a[j++];
  for(int i=l,k=0;i<=r;k++,i++){
    a[i]=temp[k];
  }
  return ret;
}
```

### 树的前中后序遍历

**栈模拟树的前后序遍历**

* 前序遍历（根->孩子）

  **思路：**栈弹出时处理节点，然后把孩子**逆序**压入栈（保证最左边的孩子先被弹出处理）

  ```c++
  vector<int> preorder;
  vector<int> st={root};
  while (!st.empty()) {
      int u = st.back();
      st.pop_back();
      preorder.push_back(u); // 处理根
      
      // 逆序压入孩子（保证正序弹出）
      for (int i=ch[u].size()-1;i>=0;--i) {
          st.push_back(ch[u][i]);
      }
  }
  ```

* 后序遍历（孩子->根）

  **思路：**利用“根 -> 右 -> 左”的遍历，最后把结果**反转**，就变成了“左 -> 右 -> 根”（后序）

  ```c++
  vector<int> order;
  vector<int> st={root};
  while (!st.empty()) {
      int u=st.back();
      st.pop_back();
      order.push_back(u); // 先记录根
      
      // 这里正序压入孩子即可（出栈顺序无所谓，反正最后要反转）
      for (int v:ch[u]){
          st.push_back(v); 
      }
  }
  reverse(order.begin(), order.end());
  ```

* 二叉树的中序遍历（左根右）

  **思路：**必须用一个指针 `cur` 一路向左走到底，模拟递归的压栈。

  ```c++
  vector<int> inorder;
  stack<Node*> st;
  Node* cur = root;
  
  while (cur != nullptr || !st.empty()) {
      // 1. 一路向左，把所有左孩子压栈
      while (cur != nullptr) {
          st.push(cur);
          cur = cur->left;
      }
      
      // 2. 弹出最左节点，处理它
      cur = st.top(); st.pop();
      inorder.push_back(cur->val); // 处理根
      
      // 3. 转向右子树（下次循环会处理右子树的左链）
      cur = cur->right;
  }
  ```

### 离散化

```c++
// 离散化：将原数组的值映射为 1,2,3,... 的排名
// 公式：rank = lower_bound(sorted_unique, x) - sorted_unique + 1
vector<int> discrete(vector<int>& a) {
  vector<int> b = a;
  sort(b.begin(), b.end());            // 排序
  b.erase(unique(b.begin(), b.end()), b.end());  // 去重
  for (int& x : a) {
    // lower_bound 返回第一个 >= x 的位置，+1 使排名从 1 开始
    x = lower_bound(b.begin(), b.end(), x) - b.begin() + 1;
  }
  return b; // 返回离散化值表，用于还原：原值 = b[x-1]
}
```

```c++
struct Trans
{
    vector<int> F;
    void init(const vector<int>& A)
    {
        // 可以适当调一下下标从0开始还是从1开始
        for(int i=0;i<A.size();i++) F.push_back(A[i]);
        sort(F.begin(),F.end());
        F.erase(unique(F.begin(),F.end()),F.end());
    }
    // 找到val对应离散化之后的值
    // ！！！注意val这个数必须参加过才能正确查询
    int get(int val)
    {
        int x=lower_bound(F.begin(),F.end(),val)-F.begin()+1;
        return x;
    }
    // 找到第一个>=val的离散化后的值（也就是离散化之后的排名）
    int findhigh(int val)
    {
        int x=lower_bound(F.begin(),F.end(),val)-F.begin()+1;
        return x;
    }
    // 找到最后一个<=val的离散化后的值
    int findlow(int val)
    {
        int x=upper_bound(F.begin(),F.end(),val)-F.begin();
        return x;
    }
    // 把数组A里面的数都替换成离散化之后的结果
    void change(vector<int>& A,int n)
    {
        for(int i=1;i<=n;i++) A[i]=get(A[i]);
    }
    // 取原排名为rank的原数组中的值
    int origin(int rank)
    {
        return F[rank-1];
    }
};
```



## 图论

### 链式前向星建图

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



### 最短路

| **算法类型**        | **适用场景**   | **边权限制**           | **时间复杂度**             | **核心思想**                           |
| ------------------- | -------------- | ---------------------- | -------------------------- | -------------------------------------- |
| **朴素 Dijkstra**   | 稠密图（单源） | 非负边权               | $O(n^2)$                   | 贪心：每次找未确定节点的最小值         |
| **堆优化 Dijkstra** | 稀疏图（单源） | 非负边权               | $O(m \log n)$              | 贪心 + 优先队列维护极小值              |
| **Bellman-Ford**    | 通用（单源）   | 可含负权边，可检测负环 | $O(mn)$                    | 动态规划：对所有边松弛 $n-1$ 轮        |
| **SPFA (BF优化)**   | 稀疏图（单源） | 可含负权边，可检测负环 | 平均 $O(km)$，最坏 $O(mn)$ | 队列优化：只将距离变小的节点入队松弛   |
| **Floyd-Warshall**  | 全图（多源）   | 可含负权边，不能有负环 | $O(n^3)$                   | 动态规划：依次以每个点作为中间节点松弛 |



#### Dijkstra

**单源最短路**

**不能处理负权边和负环**

- \(n\le 1000\)、稠密图 → 朴素 Dijkstra \(O(n^2)\)
- n 上万、稀疏图 → **堆优化 Dijkstra \(O(m\log n)\)**

```c++
// 朴素版 稠密图
struct edge{int v,w;};
vector<edge> e[N];
int d[N],vis[N];
void dijkstra(int s){
  	// 初始化距离
  	for(int i=0;i<=n;i++) d[i]=inf;
  	d[s]=0;
  	// 枚举次数（n-1次找到剩下n-1个点的最小距离）
  	for(int i=1;i<n;i++){
    	int u=0;
    	// 枚举点（未确定最小距离的点中找距离最小的）
    	for(int j=1;j<=n;j++){
      		if(!vis[j]&&d[j]<d[u]) u=j;
    	}
        if(u==0 || d[u]==inf) break;// 剩余点不连通
   		vis[u]=1;// 已经确定当前点的最小距离
    	// 枚举邻边
    	for(auto ed:e[u]){
      		int v=ed.v,w=ed.w;
      		if(d[v]>d[u]+w) d[v]=d[u]+w;
    	}
  	}
}

// 堆优化版 稀疏图
// Dijkstra 堆优化：单源最短路，适用于非负权图
// 原理：贪心 + 优先队列，每次取出距离最小的节点进行松弛
struct edge{int v,w;};
vector<edge> e[N];
int d[N],vis[N];
#define pii pair<int,int>  // 距离 节点编号
priority_queue<pii,vector<pii>,greater<pii>> q;

void dijkstra(int s){
    for(int i=0;i<=n;i++) d[i]=inf;
 	d[s]=0;
  	q.push({0,s});
    
  	while(!q.empty()){
    	auto t=q.top();q.pop();
    	int u=t.second;
      
    	if(vis[u]) continue;
    	vis[u]=1;
      
    	for(auto ed:e[u]){
      		int v=ed.v,w=ed.w;
      		if(d[v]>d[u]+w){
        		d[v]=d[u]+w;
        		q.push({d[v],v});
      		}
    	}
  	}
}
```

* 稠密图边数 m 接近 $n^2$
* 稀疏图边数 m 远小于 $n^2$

**如果要从点1到n的路径：**

```c++
int n,m;
struct p{
    int v,w;
};
vector<vector<p>> g;

void solve(){
    cin>>n>>m;
    g.resize(n+1,vector<p> ());
    for(int i=0;i<m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        if(v==u) continue;
        g[u].push_back({v,w});
        g[v].push_back({u,w});
    }

    priority_queue<pii,vector<pii>,greater<pii>> q;
    vector<int> fa(n+1,-1),dis(n+1,1e18),vis(n+1,0);
    dis[1]=0;
    q.push({0,1});

    while(!q.empty()){
        auto [d,u]=q.top();
        q.pop();
        
        if(vis[u]) continue;
        vis[u]=1;// .

        for(auto [v,w]:g[u]){
            if(dis[v]>dis[u]+w){
                dis[v]=dis[u]+w;
                fa[v]=u;
                q.push({dis[v],v});
            }
        }
        
    }
    if(dis[n]==1e18){
        cout<<-1<<endl;
        return ;
    }
    vector<int> path;
    for(int v=n;v!=-1;v=fa[v]){
        path.push_back(v);
    }
    reverse(path.begin(),path.end());
    for(auto x:path){
        cout<<x<<" ";
    }
    cout<<endl;
}
```



#### Floyd

**多源最短路**

**不能处理负环（最短路得存在），可以处理负权边和检测负环**

只要最后存在任意一个节点 i 使得 `dis[i][i]<0 ` 就说明图中存在负权环

加上 `if(d[i][k]<1e18 && d[k][j]<1e18)` 判断：防止负权边错误更新两个不可达的点

时间复杂度为 $O(n^3)$ 

```c++
// 初始化
for(int i=1;i<=n;i++){
    for(int j=1;j<=n;j++){
        d[i][j]=1e18;
        if(i==j) d[i][j]=0;
    }
}
// 读入邻接矩阵

// floyed
for(int k=1;k<=n;k++){// 先枚举每一个中间点
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            if(d[i][k]<1e18 && d[k][j]<1e18){
           		d[i][j]=min(d[i][j],d[i][k]+d[k][j]);     
            }
        }
    }
}
```



#### Bellman-Ford

**单源最短路**

**不能在负环图上求最短路，可以检测负环**

每一轮对每一条边进行松弛操作，当某一轮不再有松弛操作出现时停止，这里轮次 k 指的是最多经过 k 条边两点之间的最短距离，显然最多只有 n-1 轮（没有负环情况下）

**推广：可以判断某个点出发能不能到达负环**

没有负环，松弛操作轮数必然 <=n - 1 ，如果发现从点  A 出发，第 n 轮时松弛操作依然存在，说明从 A 出发能够到达负环

时间复杂度为 $O(m\times n)$

```c++
struct Edge{
    int u,v,w;
};
vector<Edge> g;

void bellman_ford(int n,int s){
    vector<int> d(n+1,1e18);
    d[s]=0;

    for(int i=1;i<n;i++){
        bool flag=0;
        for(auto e:g){
            int u=e.u,v=e.v,w=e.w;
            if(d[u]!=1e18 && d[v]>d[u]+w){
                d[v]=d[u]+w;
                flag=1;
            } 
        }
        if(!flag) break;
    }
    // 第n轮判断负环
    for(auto e:g){
        if(d[e.u]!=1e18 && d[e.v]>d[e.u]+e.w){
            cout<<"NO"<<endl;// 存在负环
            return ;
        }
    }
    for(int i=1;i<=n;i++){
        if(d[i]==1e18) cout<<-1<<" ";
        else cout<<d[i]<<" ";
    }
    cout<<endl;
}
```



#### SPFA

**Bellman-Ford算法的优化版：** 只有上一轮松驰过的节点、距离变小的节点才有可能引起下一轮松弛操作，用一个队列维护刚刚哪些节点的距离变小了即可

用cnt数组检测从一个起点能不能走到负环，cnt数组表示路径上的边数

**时间复杂度为 $O(nm)$** 

**如果想判断整张图有没有负环，需要设置虚拟源点，** 到其他所有点的边权为 0 ，判定条件改为 `cnt[v]>=n+1`

```c++
struct Edge{
    int v,w;
};
vector<vector<Edge>> g;

void spfa(int n,int s){
    vector<int> d(n+1,1e18);
    vector<int> vis(n+1,0);// 记录是否在队列里面 
    vector<int> cnt(n+1,0);// 记录路径上的边数
    queue<int> q;

    d[s]=0,vis[s]=1;
    q.push(s);

    while(!q.empty()){
        int u=q.front();q.pop();
        vis[u]=0;

        for(auto e:g[u]){
            int v=e.v,w=e.w;
            if(d[v]>d[u]+w){
                d[v]=d[u]+w;
                // 只要发生松弛，计数就增加（无论 v 是否在队列中）
                cnt[v]=cnt[u]+1; // 记录从起点到 v 的最短路包含的边数
                if (cnt[v]>=n){   // 存在负环
                    cout<<"NO"<<endl;
                    return;
                }

                // 只有不在队列时才入队
                if(!vis[v]){
                    q.push(v);
                    vis[v]=1;
                }
            }
        }
    }
    for(int i=1;i<=n;i++){
        if(d[i]==1e18) cout<<-1<<" ";
        else cout<<d[i]<<" ";
    }
    cout<<endl;
}
```



### 01 BFS

**01-BFS（0-1 广度优先搜索）** 是一种专门用来解决**边权只有 0 和 1** 的图中最短路问题的算法。

普通的 BFS 只能解决边权全部相等（或均为 1）的最短路，而当图中同时存在权重为 0 和权重为 1 的边时，普通的 BFS 就会失效。虽然我们可以用 Dijkstra 算法来跑最短路，但 Dijkstra 的时间复杂度是 $O(M \log N)$。

而 01-BFS 可以利用双端队列（`std::deque`），把时间复杂度优化到完美的 **$O(N + M)$**（即线性时间复杂度），在算法竞赛中非常实用。

------

#### 💡 核心运行机制：双端队列（Deque）

普通 BFS 使用的是先进先出的队列（`queue`），因为所有边权都一样，先被拓展到的点一定距离更近（满足两段性）。

但在 01-BFS 中，我们面临两种选择：

- **如果走了一条权重为 0 的边**：意味着到达新点的距离和当前点的距离**完全一样**。它有更高的优先级，应该尽早去拓展别的点。
- **如果走了一条权重为 1 的边**：意味着到达新点的距离比当前点**多 1**。它的优先级更低。

为了保证队列里的点永远满足“从距离小到大”的单调性，我们使用 `std::deque`：

1. 遇到 **0 权边**：把新点插入到队列的 **头部（`push_front`）**。
2. 遇到 **1 权边**：把新点插入到队列的 **尾部（`push_back`）**。

#### 🎯 典型应用场景

在网格图或迷宫题中，如果遇到以下字眼，90% 都是跑 01-BFS：

1. **开关/转向代价**：在网格图中移动，顺着当前方向走代价为 0，改变方向（旋转电路/轨道）代价为 1（例如经典题：电路维修）。
2. **翻转矩阵**：走黑格子代价为 0，走白格子需要把白格子翻转成黑格子，代价为 1。
3. **免费指定 $k$ 条边**：虽然边权各异，但如果题目允许你指定 $k$ 条边使其代价变为 0（二分答案后，大于 mid 的边权视为 1，小于等于 mid 的边权视为 0）。

#### ⚖️ 算法对比

| **算法**     | **适用边权**         | **时间复杂度** | **核心数据结构**      |
| ------------ | -------------------- | -------------- | --------------------- |
| **普通 BFS** | 只有 1（或全部相等） | $O(N + M)$     | `std::queue`          |
| **01-BFS**   | **只有 0 和 1**      | **$O(N + M)$** | `std::deque`          |
| **Dijkstra** | 任意非负数           | $O(M \log N)$  | `std::priority_queue` |

**一句话总结**：01-BFS 就是把 Dijkstra 里的“优先队列（堆）”用更轻量、更高效的“双端队列”代替了，只要边权只有 0 和 1，它就是效率最高的王者。

```c++
struct p{
    int to,w;
};
int m,n;
vector<vector<p>> g;// 邻接表存图
vector<int> dis;
vector<int> vis;
void bfs01(int start){
    dis.assign(n+1,1e18);
    vis.assign(n+1,0);
    deque<int> q;

    dis[start]=0;
    q.push_back(start);

    while(!q.empty()){
        int u=q.front();
        q.pop_front();

        if(vis[u]) continue;
        vis[u]=1;

        for(auto &[v,w]:g[u]){
            if(dis[u]+w<dis[v]){
                dis[v]=dis[u]+w;
                if(w==0) q.push_front(v);
                else q.push_back(v);
            }
        }
    }
}
```



### 拓扑排序

```c++
const int N=2e5+10;
int n,m;
vector<int> g[N];
int in[N];
vector<int> topo;
// Kahn 拓扑排序
// 时间复杂度：O(n+m)
// 若图中存在环，返回 false
bool topo_sort(){
    queue<int> q;
    for(int i=1;i<=n;i++){
        if(in[i]==0){
            q.push(i);
        }
    }
    while(!q.empty()){
        int u=q.front();
        q.pop();
        topo.push_back(u);
        for(int v:g[u]){
            if(--in[v]==0){
                q.push(v);
            }
        }
    }
    return (int)topo.size()==n;
}
void solve(){
    cin>>n>>m;

    for(int i=1;i<=m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        in[v]++;
    }
    if(!topo_sort()){
        cout<<-1<<endl;
        return;
    }
    for(int x:topo){
        cout<<x<<" ";
    }
    cout<<endl;
}
```



### 最小生成树

#### Kruskal

```c++
const int N=2e5+10;
int n,m;
int fa[N];
// Kruskal 最小生成树
// 时间复杂度：O(mlogm)
// 若图不连通，返回 -1
struct edge{
    int u,v,w;
    bool operator<(const edge& other) const{
        return w<other.w;
    }
}e[N];
int find(int x){
    if(fa[x]==x){
        return x;
    }
    return fa[x]=find(fa[x]);
}
void merge(int x,int y){
    int fx=find(x);
    int fy=find(y);
    if(fx==fy){
        return;
    }
    // Kruskal 一般不用按秩合并
    fa[fx]=fy;
}
int kruskal(){
    sort(e+1,e+m+1);
    for(int i=1;i<=n;i++) fa[i]=i;
    int ans=0,cnt=0;
    for(int i=1;i<=m;i++){
        int u=e[i].u,v=e[i].v,w=e[i].w;
        if(find(u)!=find(v)){
            merge(u,v);
            ans+=w;
            cnt++;
            if(cnt==n-1) break;
        }
    }
    if(cnt!=n-1) return -1;
    return ans;
}
void solve(){
    cin>>n>>m;
    for(int i=1;i<=m;i++){
        cin>>e[i].u>>e[i].v>>e[i].w;
    }
    cout<<kruskal()<<endl;
}
```



### LCA

```c++
const int N=5e5+10;
int n,m,s,ans;
vector<int> g[N];
int dep[N];
int fa[N][21];// 开大一点
// 预处理深度和fa
// fa[u][k]=fa[fa[u][k-1]][k-1]
void dfs(int u,int fat){
  dep[u]=dep[fat]+1;
  fa[u][0]=fat;
  for(int i=1;i<=20;i++){
    fa[u][i]=fa[fa[u][i-1]][i-1];
  }
  for(int v:g[u]){
    if(v==fat) continue;
    dfs(v,u);
  }
}
int lca(int u,int v){
  // 让u是深的
  if(dep[u]<dep[v]) swap(u,v);
  // 提升u的深度
  for(int i=20;i>=0;i--){
    if(dep[fa[u][i]]>=dep[v]){
      u=fa[u][i];
    }
  }
  if(u==v) return u;
  for(int i=20;i>=0;i--){
    if(fa[u][i]!=fa[v][i]){
      u=fa[u][i];
      v=fa[v][i];
    }
  }
  // 父节点即为lca
  return fa[u][0];
}
void solve(){
  cin>>n>>m>>s;
  for(int i=0;i<n-1;i++){
    int a,b;
    cin>>a>>b;
    g[a].push_back(b);
    g[b].push_back(a);
  }
  dep[0]=-1;// 根节点的父节点设为0，避免数组越界
  dfs(s,0);
  while(m--){
    int a,b;
    cin>>a>>b;
    cout<<lca(a,b)<<endl;
  }
}
```



### 二分图判定（染色法）

```c++
const int N=2e5+10;
vector<int> g[N];
int color[N];// 0表示未染色 1和-1表示两种不同颜色

bool dfs(int u,int c){
    color[u]=c;
    for(int v:g[u]){
        if(color[v]==0){
            if(!dfs(v,-c)) return false;
        }
        else if(color[v]==c){
            return false;
        }
    }
    return true;
}
void solve(){
    int n,m;
    cin>>n>>m;

    for(int i=1;i<=m;i++){
        int u,v;
        cin>>u>>v;
        g[u].push_back(v);
        g[v].push_back(u);
    }g
    bool flag=true;
    for(int i=1;i<=n;i++){
        if(color[i]==0){// 处理非连通图
            if(!dfs(i,1)){
                flag=false;
                break;
            }
        }
    }
    if(flag) cout<<"YES"<<endl;
    else cout<<"NO"<<endl;
}
```



## 动态规划

### 背包 DP

```c++
// 01背包二维
int w[N],v[N];
int dp[N][N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=0;j<=m;j++){
      if(v[i]<=j){
        dp[i][j]=max(dp[i-1][j],dp[i-1][j-v[i]]+w[i]);
      }
      else dp[i][j]=dp[i-1][j];
    }
  }
  cout<<dp[n][m]<<endl;
}
// 01背包一维
int dp[N];
int v[N],w[N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=m;j>=v[i];j--){
      dp[j]=max(dp[j],dp[j-v[i]]+w[i]);
    }
  }
  cout<<dp[m]<<endl;
}
// 完全背包二维
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=0;j<=m;j++){
      if(v[i]>j){
        dp[i][j]=dp[i-1][j];
      }
      else{
        dp[i][j]=max(dp[i-1][j],dp[i][j-v[i]]+w[i]);
      }
    }
  }
  cout<<dp[n][m]<<endl;
}
// 完全背包一维
int dp[N],v[N],w[N];
void solve(){
  cin>>n>>m;
  for(int i=1;i<=n;i++) cin>>v[i]>>w[i];
  for(int i=1;i<=n;i++){
    for(int j=v[i];j<=m;j++){
      dp[j]=max(dp[j],dp[j-v[i]]+w[i]);
    }
  }
  cout<<dp[m]<<endl;
}
```

### 最长上升子序列

```c++
// 二分优化
signed main(){
  int n;
  cin>>n;
  vector<int> a(n+1);
  vector<int> q;
  for(int i=1;i<=n;i++) cin>>a[i];
  q.push_back(a[1]);
  for(int i=2;i<=n;i++){
    if(a[i]>q.back()) q.push_back(a[i]);
    else{
      int pos=lower_bound(q.begin(),q.end(),a[i])-q.begin();
      q[pos]=a[i];
    }
  }
  cout<<q.size()<<endl;
}
// 朴素做法
int dp[N];// 以i结尾的上升子序列长度的最大值
signed main(){
  cin>>n;
  for(int i=1;i<=n;i++) cin>>a[i];
  // 枚举每一个可能的结尾，看一下前面能够与他组成上升序列的长度的最大值是多少
  // 看一下例子 7 8 9 3 4 5 6 7 10
  // 上面例子就可以看出首先要初始化为1，然后枚举前面的每一个位置，取最长
  for(int i=1;i<=n;i++){
    dp[i]=1;
    for(int j=1;j<=i-1;j++){
      if(a[i]>a[j]) dp[i]=max(dp[i],dp[j]+1);
    }
  }
  int ans=0;
  // 最后一个位置不一定是最大的，显然的例子是前面所有数都比最后一个数字大，需要枚举
  for(int i=1;i<=n;i++) ans=max(ans,dp[i]);
  cout<<ans<<endl;
  return 0;
}
```

### 最长公共子序列

```c++
int dp[N][N];// 表示在a中的第i个位置和b中的第j个位置的最长公共子序列长度
signed main(){
  int n,m;
  cin>>n>>m;
  string a,b;
  cin>>a>>b;
  a=" "+a;
  b=" "+b;
  for(int i=1;i<=n;i++){
    for(int j=1;j<=m;j++){
      // 相等就取的是前一个状态+1
      if(a[i]==b[j]) dp[i][j]=dp[i-1][j-1]+1;
      // 不相等就要看是继承上方单元格还是左边的单元格，取最大的，也就是分别对应最长上升子序列包含ai不包含bj和包含bj不包含ai
      else dp[i][j]=max(dp[i-1][j],dp[i][j-1]);
    }
  }
  cout<<dp[n][m]<<endl;
}
```

## 杂项

### 随机数生成

```c++
// 随机数生成器（使用当前时间作为种子）
// 原理：mt19937 是梅森旋转算法，周期长达 2^19937-1，比 rand() 更均匀
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
// 生成 [l, r] 范围内的随机整数
// 公式：uniform_int_distribution<int>(l, r)(rng)
int randint(int l, int r) {
  return uniform_int_distribution<int>(l, r)(rng);
}
// 生成 [l, r] 范围内的随机浮点数（double）
// 公式：uniform_real_distribution<double>(l, r)(rng)
double randdouble(double l, double r) {
  return uniform_real_distribution<double>(l, r)(rng);
}
// 生成 0 或 1 的随机布尔值
bool randbool() {
  return randint(0, 1);
}
// 随机打乱数组（使用 shuffle，比 random_shuffle 更安全）
// 原理：Fisher-Yates 洗牌算法
template<typename T>
void shuffle(vector<T>& a) {
  shuffle(a.begin(), a.end(), rng);
}
// 从数组中随机选择一个元素
template<typename T>
T randchoice(const vector<T>& a) {
  return a[randint(0, a.size() - 1)];
}
// 生成随机排列（1~n 的排列）
vector<int> randperm(int n) {
  vector<int> res(n);
  for (int i = 0; i < n; i++) res[i] = i + 1;
  shuffle(res);
  return res;
}
```



### STL

#### **基础容器：queue/priority_queue/stack/deque**

1. `queue` 队列
    - `size()`
    - `empty()`
    - `push()` 向队尾插入一个元素
    - `front()` 返回队头元素
    - `back()` 返回队尾元素
    - `pop()` 弹出队头元素
2. `priority_queue` 优先队列（默认是大根堆）
    - `size()`
    - `empty()`
    - `push()` 插入一个元素
    - `top()` 返回堆顶元素
    - `pop()` 弹出堆顶元素
    - 定义成小根堆的方式：`priority_queue<int, vector<int>, greater<int>> q;`
3. `stack` 栈
    - `size()`
    - `empty()`
    - `push()` 向栈顶插入一个元素
    - `top()` 返回栈顶元素
    - `pop()` 弹出栈顶元素
4. `deque` 双端队列
    - `size()`
    - `empty()`
    - `clear()`
    - `front()/back()`
    - `push_back()/pop_back()`
    - `push_front()/pop_front()`
    - `begin()/end()`
    - `[]`

------

#### **有序关联容器：set/map/multiset/multimap**

基于平衡二叉树（红黑树），动态维护有序序列

- `size()`
- `empty()`
- `clear()`
- `begin()/end()`
- `++, --` 返回前驱和后继，时间复杂度 O (logn)

1. `set/multiset`

    - `insert()` 插入一个数

    - `find()` 查找一个数

    - `count()` 返回某一个数的个数

    - `erase()`

        1. 输入是一个数 x，删除所有 x，复杂度 `O(k + logn)`

        2. 输入一个迭代器，删除这个迭代器

          

    - `lower_bound(x)` 返回大于等于 x 的最小的数的迭代器

    - `upper_bound(x)` 返回大于 x 的最小的数的迭代器

2. `map/multimap`

    - `insert()` 插入的数是一个 pair

    - `erase()` 输入的参数是 pair 或者迭代器

    - `find()`

    - `[]` 注意 multimap 不支持此操作，时间复杂度是 O (logn)

    - `lower_bound()/upper_bound()`

3. 无序关联容器：`unordered_set, unordered_map, unordered_multiset, unordered_multimap`

    - 和上面类似，增删改查的时间复杂度是 O (1)

    - 不支持 `lower_bound()/upper_bound()`，迭代器的 `++`、`--`

------

#### **bitset 位集**

```cpp
bitset<100005> s;
```

- `count()` 返回有多少个 1
- `any()` 判断是否至少有一个 1
- `none()` 判断是否全为 0
- `set()` 把所有位置成 1
- `set(k, v)` 将第 k 位变成 v
- `reset()` 把所有位置成 0
- `flip()` 等价于 `~`
- `flip(k)` 把第 k 位取反
- 支持位运算：`-, &, |, ^, ~, >>, <<, ==, !=`

------

#### **其他 STL 库：vector/pair/string**

1. `vector` 变长数组（倍增的思想）

    - `size()` 返回元素个数
    - `empty()` 返回是否为空
    - `clear()` 清空
    - `front()/back()`
    - `push_back()/pop_back()`
    - `begin()/end()`
    - `[]` 下标访问   

2. `pair<int, int>`

    - `first` 第一个元素
    - `second` 第二个元素
    - 支持比较运算，以`first`为第一关键字，以`second`为第二关键字（字典序）

3. `string` 字符串

    - `size()/length()` 返回字符串长度
    - `empty()`
    - `clear()`
    - `substr(起始下标, 子串长度)` 返回子串
    - `c_str()` 返回字符串所在字符数组的起始地址

### 内置函数

```c++
#define all(x) (x).begin(), (x).end()
```

| **函数**             | **标准写法**                                    | **核心用途 / 注意事项**                                      |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `unique`             | `a.erase(unique(all(a)), a.end());`             | 离散化去重，使用前必须先 `sort`                              |
| `accumulate`         | `accumulate(all(a), 0LL);`                      | 区间求和，算 `long long` 务必写 `0LL`                        |
| `nth_element`        | `nth_element(a.begin(), a.begin()+k, a.end());` | 求区间第 $k$ 大，完毕后 `a[k]` 为正确值，复杂度 $O(N)$       |
| `iota`               | `iota(all(a), 1);`                              | 递增填充，常用于并查集初始化 `fa[i]=i`                       |
| `fill`               | `fill(all(a), val);`                            | 区间赋任意值                                                 |
| `reverse`            | `reverse(all(a));`                              | 翻转容器/字符串                                              |
| `__builtin_popcount` | `__builtin_popcount(x)`                         | 求二进制中 `1` 的个数（`long long` 用 `__builtin_popcountll`） |
| `__builtin_clz`      | `31 - __builtin_clz(x)`                         | 求 $\lfloor\log_2 x\rfloor$                                  |
| `to_string` / `stoi` | `to_string(num)` / `stoi(s)`                    | 数字与字符串双向极速转换                                     |
| `string::find`       | `if (s.find(sub) != string::npos)`      (-1)    | 判断 `s` 是否包含子串 `sub`                                  |
| `clamp`              | `val = clamp(val, low, high);`                  | 限幅函数，防坐标越界                                         |
| `hypot`              | `hypot(dx, dy);`                                | 计算 $\sqrt{dx^2 + dy^2}$，防中间平方溢出                    |
| `next_permutation`   | `next_permutation(all(a))`                      | 生成下一个字典序排列，用前需先升序排序                       |
|                      |                                                 |                                                              |

- **自然对数 $\ln(x)$（以 $e$ 为底）：**

  使用 `std::log(x)`

- **常用对数 $\log_{10}(x)$（以 $10$ 为底）：**

  使用 `std::log10(x)`

- **二进制对数 $\log_2(x)$（以 $2$ 为底）：**

  使用 `std::log2(x)` （C++11 及以上支持）

### 快速读入

```c++
int read(){
    int ret=0;
    char c=getchar();
    while(c<'0' || c>'9') c=getchar();
    while(c>='0' && c<='9'){
        ret=ret*10+(c-'0');
        c=getchar();
    }
    return ret;
}
```

```c++
#include<bits/stdc++.h>
using namespace std;
#define int long long 
#define endl '\n'
#define pii pair<int,int>

const int MOD=998244353;
const int N=2e5+10;
int a[N];

void solve(){
    
}

signed main(){
    ios::sync_with_stdio(false),cin.tie(nullptr);
    int T=1;
    // cin>>T;
    while(T--) solve();
    return 0;
}
```

// vp的时候忘记怎么开快读了

* 外面开 里面分配

```c++
diff.assign(n + 2, vector<int>(m + 2, 0));
pre.assign(n + 2, vector<int>(m + 2, 0));
```

### int128

| **类型**    | **位数** | **范围（近似值）**       | **范围（精确值）**      |
| ----------- | -------- | ------------------------ | ----------------------- |
| `int`       | 32-bit   | $\pm 2 \times 10^9$      | $[-2^{31}, 2^{31}-1]$   |
| `long long` | 64-bit   | $\pm 9 \times 10^{18}$   | $[-2^{63}, 2^{63}-1]$   |
| `__int128`  | 128-bit  | $\pm 1.7 \times 10^{38}$ | $[-2^{127}, 2^{127}-1]$ |

```c++
namespace my128{
	using int128 = __int128_t;
	int128 abs(const int128 &x) {
		return x > 0 ? x : -x;
	}
	istream &operator>>(istream &it,int128 &j){
		string val;
		it >> val;
		reverse(val.begin(),val.end());
		int128 ans = 0;
		bool f = false;
		char c = val.back();
		val.pop_back();
		for(;c<'0'||c>'9';c=val.back(),val.pop_back()){
			if(c=='-') f = 1;
		}
		for(;c>='0'&&c<='9';c=val.back(),val.pop_back()){
			ans = ans * 10 + c - '0';
		}
		j = f ? -ans : ans;
		return it;
	}
	ostream &operator<<(ostream &os,const int128 &j){
		string ans;
		function<void(int128)> write = [&](int128 x){
			if(x<0) ans += '-',x = -x;
			if(x>9) write(x/10);
			ans += x % 10 + '0';
		};
		write(j);
		return os << ans;
	}
}
using namespace my128;
using int = int128;
```

**函数支持**：`abs()` 这种标准库函数可能不支持 `__int128`，建议自己写：`auto my_abs = [](int128 x) { return x < 0 ? -x : x; };`。

**速度测试**：`__int128` 的乘法和加减法很快，但**除法和取模**相对较慢（比 `long long` 慢数倍），在有严格时限且大量取模的题目中要小心，并且不能直接cin/cout，需要转换成字符串（但一般只有中间过程会爆 long long，所以最后答案转成 long long 输出即可）。

