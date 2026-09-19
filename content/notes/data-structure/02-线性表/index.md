---
title: "【数据结构】 第二章 线性表"
date: 2026-09-16
lastmod: 
categories:
  - "学习笔记 | Learning Notes"
tags:
  - "notes: 数据结构"

weight: 10
pinned: false
draft: false
---

## 线性表

#### 定义和特点

- 线性表：由n个数据元素组成的有限序列，记为 `(a1,a2,...,an)`。
- 逻辑特征：有且仅有一个开始结点、一个终端结点；除首尾外，每个结点最多一个直接前驱和一个直接后继。
- n=0时为空表，n为表长。
- 同一线性表中元素具有相同特性。
- 线性结构反映结点间一对一关系。

#### 类型定义

- 基本操作：初始化、销毁、清空、求长、判空、取值、查找、插入、删除。
- 存储结构分为：顺序存储结构、链式存储结构。

#### 案例

- 一元多项式运算：系数数组表示，指数隐含在下标中。
- 稀疏多项式：用 `(系数,指数)` 二元组表示，适合链式存储。
- 图书信息管理系统：查找、插入、删除、修改、排序、计数。
- 抽象数据类型：从具体应用中抽象逻辑结构和基本操作。



### 顺序表

* **顺序存储定义：** 把逻辑上相邻的数据元素存储在物理上相邻的存储单元中的存储结构。简言之，逻辑上相邻，物理上也相邻
* **顺序存储方法：** 用一组地址连续的存储单元依次存储线性表的元素，可通过数组来实现。

#### 顺序表类型定义

```c++
#define MAXSIZE 100	// 最大长度
typedef struct{
    ElemType *elem;	// 指向数据元素的基地址
    int length;		// 线性表的当前长度
}SqList;
```



#### 初始化

##### 参数用引用

```c++
#include<iostream>
using namespace std;
#define OK 1
#define ERROR 0
#define OVERFLOW -1
typedef int Status;

Status InitList_Sq(SqList &L){	// 构造一个空的顺序表L
    L.elem=new ElemType[MAXSIZE];	// 为顺序表分配空间
    if(!L.elem) exit(OVERFLOW);		// 存储分配失败
    L.length=0;
    return OK;
}
```

##### 参数用指针

```c++
Status InitList_Sq(SqList *L){	// 构造一个空的顺序表L
    L->elem=new ElemType[MAXSIZE];	// 为顺序表分配空间
    if(!L->elem) exit(OVERFLOW);	// 存储分配失败
    L->length=0;
    return OK;
}
```



#### 销毁、清空、求长度、判空

```c++
void DestroyList(SqList&L){
    if(L.elem)delete L.elem;// 释放存储空间
}

void ClearList(SqList&L){
    L.length=0;
}

int GetLength(SqList L){
    return L.length;
}

int IsEmpty(SqList L){
    if(L.length==0)return 1;
    else return 0;
}
```



#### 取值

（按位号取元素）

```c++
Status GetElem(SqList L,int i,ElemType&e){
    if(i<1 || i>L.length)return ERROR; // 释放存储空间
    e=L.elem[i-1]; // 第i个元素存储在下标i-1
    return OK;
}
```



#### 查找

（按值查找元素）

```c++
int LocateElem(SqList L,ElemType e){
    for(int i=0;i<L.length;i++)
        if(L.elem[i]==e)return i+1; // 返回位置序号
    return 0; // 查找失败
}
```



#### 插入元素

```c++
Status ListInsert_Sq(SqList&L,int i,ElemType e){
    if(i<1 || i>L.length+1)return ERROR; // i不合法
    if(L.length==MAXSIZE)return ERROR; // 空间已满
    for(int j=L.length-1;j>=i-1;j--){
        L.elem[j+1]=L.elem[j]; // 后移
    }
    L.elem[i-1]=e; // 插入e
    ++L.length; // 表长加1
    return OK;
}
```

**插入平均移动次数**
$$
ASL_{\text{插入}} = \frac{1}{n+1} \sum_{i=1}^{n+1} (n-i+1) = \frac{n}{2}
$$



#### 删除元素

```c++
Status ListDelete_Sq(SqList&L,int i){
    if(i<1 || i>L.length)return ERROR; // i不合法
    for(int j=i;j<=L.length-1;j++){
        L.elem[j-1]=L.elem[j]; // 前移
    }
    --L.length; // 表长减1
    return OK;
}
```

**删除平均移动次数**
$$
ASL_{\text{删除}} = \frac{1}{n} \sum_{i=1}^{n} (n-i) = \frac{n-1}{2}
$$

#### 顺序表地址计算

$$
Loc(a_i) = L_0 + (i-1) \times m
$$

其中：
- $L_0$：第一个元素的存储地址
- $m$：每个元素占用的存储单元数
- $i$：元素序号，从 $1$ 开始



### 单链表

#### 单链表类型定义
```c
typedef struct LNode{
    ElemType data; // 数据域
    struct LNode*next; // 指针域
}LNode,*LinkList;
```

#### 初始化单链表
```c
Status InitList_L(LinkList&L){
    L=new LNode; // 生成头结点
    L->next=NULL; // 头结点指针域置空
    return OK;
}
```

#### 销毁单链表
```c
Status DestroyList_L(LinkList&L){
    LinkList p;
    while(L){
        p=L;
        L=L->next;
        delete p;
    }
    return OK;
}
```

#### 清空单链表
```c
Status ClearList(LinkList&L){
    LinkList p,q;
    p=L->next; // p指向第一个结点
    while(p){
        q=p->next;
        delete p;
        p=q;
    }
    L->next=NULL; // 头结点指针域为空
    return OK;
}
```

#### 求单链表长度
```c
int ListLength_L(LinkList L){
    LinkList p=L->next; // p指向第一个结点
    int i=0;
    while(p){
        i++;
        p=p->next;
    }
    return i;
}
```

#### 判断单链表是否为空
```c
int ListEmpty(LinkList L){
    if(L->next)return 0; // 非空
    else return 1; // 空表
}
```

#### 单链表取值
```c
Status GetElem_L(LinkList L,int i,ElemType&e){
    LinkList p=L->next;
    int j=1;
    while(p&&j<i){ // 向后扫描直到第i个或p为空
        p=p->next;
        ++j;
    }
    if(!p||j>i)return ERROR; // 第i个不存在
    e=p->data;
    return OK;
}
```

#### 单链表查找：返回结点地址
```c
LNode*LocateElem_L(LinkList L,ElemType e){
    LinkList p=L->next;
    while(p&&p->data!=e)
        p=p->next;
    return p; // 失败返回NULL
}
```

#### 单链表查找：返回位置序号
```c
int LocateElem_L_Pos(LinkList L,ElemType e){
    LinkList p=L->next;
    int j=1;
    while(p&&p->data!=e){
        p=p->next;
        j++;
    }
    if(p)return j;
    else return 0;
}
```

#### 单链表插入
```c
Status ListInsert_L(LinkList&L,int i,ElemType e){
    LinkList p=L;
    int j=0;
    while(p&&j<i-1){ // 寻找第i-1个结点
        p=p->next;
        ++j;
    }
    if(!p||j>i-1)return ERROR;
    LinkList s=new LNode; // 生成新结点
    s->data=e;
    s->next=p->next;
    p->next=s;
    return OK;
}
```

#### 单链表删除
```c
Status ListDelete_L(LinkList&L,int i){
    LinkList p=L;
    int j=0;
    while(p->next&&j<i-1){ // 寻找第i个结点的前驱
        p=p->next;
        ++j;
    }
    if(!(p->next)||j>i-1)return ERROR;
    LinkList q=p->next; // 临时保存被删结点
    p->next=q->next;
    delete q;
    return OK;
}
```

#### 头插法建立单链表
```c
void CreateList_F(LinkList&L,int n){
    L=new LNode;
    L->next=NULL; // 先建立带头结点的空链表
    for(int i=n;i>0;--i){
        LinkList p=new LNode;
        cin>>p->data;
        p->next=L->next;
        L->next=p; // 插入到表头
    }
}
```

#### 尾插法建立单链表
```c
void CreateList_L(LinkList&L,int n){
    L=new LNode;
    L->next=NULL;
    LinkList r=L; // 尾指针指向头结点
    for(int i=0;i<n;++i){
        LinkList p=new LNode;
        cin>>p->data;
        p->next=NULL;
        r->next=p; // 插入到表尾
        r=p; // r指向新的尾结点
    }
}
```



### 循环链表

#### 循环链表合并
```c
LinkList Connect(LinkList Ta,LinkList Tb){
    LinkList p=Ta->next; // p存Ta表头结点
    Ta->next=Tb->next->next; // Tb表头链接Ta表尾
    delete Tb->next; // 释放Tb表头结点
    Tb->next=p; // 修改指针
    return Tb;
}
```

##### 指针操作

```c
p = Ta->next;
Ta->next = Tb->next->next;
delete Tb->next;
Tb->next = p;
return Tb;
```

对应关系：

$$
p = Ta \rightarrow next
$$

$$
Ta \rightarrow next = Tb \rightarrow next \rightarrow next
$$

$$
Tb \rightarrow next = p
$$



#### 约瑟夫问题核心代码
```c
void Josephus(int n,int m){
    Firster();
    for(int i=0;i<n-1;i++){
        for(int j=0;j<m-1;j++)Next(); // 循环m次使current指向被删结点
        cout<<"出列的人是"<<GetElem_L()<<endl;
        ListDelete();
    }
}
```



### 双向链表

#### 双向链表类型定义
```c
typedef struct DuLNode{
    ElemType data;
    struct DuLNode*prior;
    struct DuLNode*next;
}DuLNode,*DuLinkList;
```

#### 双向链表插入
```c
Status ListInsert_DuL(DuLinkList&L,int i,ElemType e){
    DuLinkList p=GetElemP_DuL(L,i);
    if(!p)return ERROR;
    DuLinkList s=new DuLNode;
    s->data=e;
    s->prior=p->prior;
    p->prior->next=s;
    s->next=p;
    p->prior=s;
    return OK;
}
```

##### 核心指针操作

```c
s->prior = p->prior;
p->prior->next = s;
s->next = p;
p->prior = s;
```

对应指针变化关系：

$$
s \rightarrow prior = p \rightarrow prior
$$

$$
p \rightarrow prior \rightarrow next = s
$$

$$
s \rightarrow next = p
$$

$$
p \rightarrow prior = s
$$

##### 

#### 双向链表删除
```c
Status ListDelete_DuL(DuLinkList&L,int i,ElemType&e){
    DuLinkList p=GetElemP_DuL(L,i);
    if(!p)return ERROR;
    e=p->data;
    p->prior->next=p->next;
    p->next->prior=p->prior;
    delete p;
    return OK;
}
```

##### 核心指针操作

```c
p->prior->next = p->next;
p->next->prior = p->prior;
```

对应指针变化关系：

$$
p \rightarrow prior \rightarrow next = p \rightarrow next
$$

$$
p \rightarrow next \rightarrow prior = p \rightarrow prior
$$



### 线性表应用

#### 线性表合并（集合求并）
```c
void union(List&La,List Lb){
    int La_len=ListLength(La);
    int Lb_len=ListLength(Lb);
    for(int i=1;i<=Lb_len;i++){
        ElemType e;
        GetElem(Lb,i,e);
        if(!LocateElem(La,e))
            ListInsert(&La,++La_len,e);
    }
}
```

#### 有序顺序表合并
```c
void MergeList_Sq(SqList LA,SqList LB,SqList&LC){
    ElemType*pa=LA.elem;
    ElemType*pb=LB.elem;
    LC.length=LA.length+LB.length;
    LC.elem=new ElemType[LC.length];
    ElemType*pc=LC.elem;
    ElemType*pa_last=LA.elem+LA.length-1;
    ElemType*pb_last=LB.elem+LB.length-1;
    while(pa<=pa_last&&pb<=pb_last){
        if(*pa<=*pb)*pc++=*pa++;
        else *pc++=*pb++;
    }
    while(pa<=pa_last)*pc++=*pa++;
    while(pb<=pb_last)*pc++=*pb++;
}
```

#### 有序链表合并
```c
void MergeList_L(LinkList&La,LinkList&Lb,LinkList&Lc){
    LinkList pa=La->next;
    LinkList pb=Lb->next;
    LinkList pc=Lc=La; // 用La的头结点作为Lc的头结点
    while(pa&&pb){
        if(pa->data<=pb->data){
            pc->next=pa;
            pc=pa;
            pa=pa->next;
        }else{
            pc->next=pb;
            pc=pb;
            pb=pb->next;
        }
    }
    pc->next=pa?pa:pb; // 插入剩余段
    delete Lb; // 释放Lb头结点
}
```

#### 稀疏多项式类型定义
```c
typedef struct PNode{
    float coef; // 系数
    int expn; // 指数
    struct PNode*next; // 指针域
}PNode,*Polynomial;
```

#### 稀疏多项式创建
```c
void CreatePolyn(Polynomial&P,int n){
    P=new PNode;
    P->next=NULL;
    for(int i=1;i<=n;++i){
        Polynomial s=new PNode;
        cin>>s->coef>>s->expn;
        Polynomial pre=P;
        Polynomial q=P->next;
        while(q&&q->expn<s->expn){
            pre=q;
            q=q->next;
        }
        s->next=q;
        pre->next=s;
    }
}
```

#### 稀疏多项式相加
```c
void AddPolyn(Polynomial&Pa,Polynomial&Pb){
    Polynomial p1=Pa->next;
    Polynomial p2=Pb->next;
    Polynomial p3=Pa;
    while(p1&&p2){
        if(p1->expn==p2->expn){
            float sum=p1->coef+p2->coef;
            if(sum!=0){
                p1->coef=sum;
                p3->next=p1;
                p3=p1;
                p1=p1->next;
                Polynomial q=p2;
                p2=p2->next;
                delete q;
            }else{
                Polynomial q1=p1;
                Polynomial q2=p2;
                p1=p1->next;
                p2=p2->next;
                delete q1;
                delete q2;
            }
        }else if(p1->expn<p2->expn){
            p3->next=p1;
            p3=p1;
            p1=p1->next;
        }else{
            p3->next=p2;
            p3=p2;
            p2=p2->next;
        }
    }
    p3->next=p1?p1:p2;
    delete Pb;
}
```



### 图书信息管理系统类型定义

#### 图书结构
```c
#define MAXSIZE 10000
typedef struct{
    char no[20]; // ISBN
    char name[50]; // 书名
    float price; // 价格
}Book;
```

#### 图书顺序表
```c
typedef struct{
    Book*elem; // 存储空间基地址
    int length; // 当前图书个数
}SqList;
```

#### 图书链表
```c
typedef struct LNode{
    Book data;
    struct LNode*next;
}LNode,*LinkList;
```



### 补充

#### C/C++动态存储与参数传递

##### C语言动态分配
```c
// malloc(m)：开辟m字节地址空间，返回首地址
// sizeof(x)：计算变量x长度
// free(p)：释放指针p所指空间
```

##### C++动态分配
```c
int*p1=new int; // 申请int空间
int*p2=new int(10); // 申请并赋初值
delete p1; // 释放
delete p2;
```



#### 传值、传指针、传地址、引用

下面用几个例子区分值传递、指针传递、引用传递

##### 值传递 ，交换失败

```c++
void swap(float m,float n){
    float t;
    t=m;
    m=n;
    n=t;
}
int main(){
    float a=2, b=3;
    swap(a,b);   // 把a里面的值复制一份给m，b的值复制一份给n
    cout<<"a="<<a<<" b="<<b<<endl;
    return 0;
}
```

##### 指针传递，交换成功

```c++
void swap(float *m,float *n){
    float t;
    t=*m;   // *m 是 m 指向的变量，也就是main里的a
    *m=*n;	// 把n地址指向的值赋值给m地址指向的值 
    *n=t;
}
int main(){
    float a,b,*p1,*p2;
    cin>>a>>b;
    p1=&a; p2=&b;
    swap(p1,p2);
    cout<<a<<endl<<b<<endl;
}
```

* 关于指针变量
  * `float *m ` 代表声明了一个指向`float` 的指针变量，m 的值表示一个地址
  * `*m` 可以表示解引用，拿 m 里面存的地址，找到这个地址对应的内存，访问这块内存里面存的值

* 关于变量 a、b
  * 变量a、b有两样东西，一个是变量地址，一个是变量的值
  * 变量a、b创建后，地址是不会变的，但是里面存的值可能会变
  * 当我们输出a的时候，编译器会帮我们找到a的地址，读取地址里面的值

##### 指针传递，交换失败

```c++
void swap(float *m,float *n){
    float *t;
    t=m;    // 只是交换 m、n 这两张纸条上的门牌号
    m=n;	
    n=t;
}
int main(){
    float a,b,*p1,*p2;
    cin>>a>>b;
    p1=&a; p2=&b;
    swap(p1,p2);
    cout<<a<<endl<<b<<endl;
}
```

* 这里交换的是 **形参 m、n 里面存放的地址（门牌号） 但是 a、b 房间里面存的数据没变** 

##### 引用传递，交换成功

```c++
void swap(float&m,float&n){// float &m 代表 m 是实参的别名
    float t;
    t=m;
    m=n;
    n=t;
}

int main(){
    float a=2,b=3;
    swap(a,b);
    cout<<"a="<<a<<",b="<<b<<endl;
    return 0;
}
```

```c++
int i=5;
int &j=i;   // j 是 i 的别名（外号）
i=7;
cout<<"i="<<i<<" j="<<j;
```

* `&` 写在`int`后面是引用声明，在这里不是取地址，表示给 i 起了一个别名叫 j ，这里没有开辟新的内存
* j 可以直接表示 i 地址里面的数据



### 时间复杂度

#### 顺序表

- 按位置取值：$O(1)$
- 查找：$O(n)$
- 插入：$O(n)$
- 删除：$O(n)$
- 空间复杂度：$S(n)=O(1)$

#### 链表

- 查找：$O(n)$
- 取值：$O(n)$
- 插入：确定位置后 $O(1)$，但查找前驱需要 $O(n)$
- 删除：确定位置后 $O(1)$，但查找前驱需要 $O(n)$

#### 有序链表合并

$$
T(n) = O(\text{ListLength}(LA) + \text{ListLength}(LB))
$$

$$
S(n) = O(1)
$$

