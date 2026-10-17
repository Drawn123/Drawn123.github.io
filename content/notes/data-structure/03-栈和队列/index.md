---
knowledge_id: "notes-data-structure-03"
url: "/notes/data-structure/03-栈和队列/"
series_id: "data-structure"
series_order: 3
title: "【数据结构】 第三章 栈和队列"
date: 2026-09-27
lastmod: 2026-10-17
description: "栈与队列的操作限制，顺序栈、链栈、循环队列和链队列的实现，以及表达式求值与递归。"
tags:
  - "notes: 数据结构"
prerequisites:
  - "notes-data-structure-02"
weight: 30
pinned: false
draft: false
---

## 栈和队列

### 本章重点

- 区分栈的**后进先出**和队列的**先进先出**，会判断合法的出栈序列。
- 掌握顺序栈、链栈的入栈、出栈和取栈顶，明确栈顶指针的含义。
- 掌握循环队列的判空、判满、长度公式，以及链队列的指针修改。
- 理解函数递归时的入栈与返回过程，会分析阶乘和汉诺塔。
- 掌握数制转换、括号匹配和表达式求值中使用栈的原因。

本章沿用[线性表](knowledge:notes-data-structure-02)中的顺序存储、链式存储和引用参数写法。栈和队列仍属于线性结构，变化的是**允许插入、删除的位置**。

### 定义和特点

| 结构 | 插入位置 | 删除位置 | 元素处理顺序 |
| --- | --- | --- | --- |
| 一般线性表 | 任意合法位置 | 任意合法位置 | 按具体操作决定 |
| 栈（Stack） | 栈顶 | 栈顶 | 后进先出，LIFO |
| 队列（Queue） | 队尾 | 队头 | 先进先出，FIFO |

- **栈顶：** 栈中允许插入和删除的一端。另一端称为**栈底**。
- **入栈 / 出栈：** 向栈顶插入元素 / 删除栈顶元素，也称压栈、弹栈。
- **队头 / 队尾：** 队列中允许删除 / 插入的一端。

例如依次放入 `a、b、c`，全部放完后再依次取出：栈的取出顺序是 `c、b、a`，队列的取出顺序是 `a、b、c`。

两者都可以使用数组或链表实现。**后进先出、先进先出是运算规则，顺序存储、链式存储是存储方式。**

### 基本操作

| 操作 | 栈 | 队列 |
| --- | --- | --- |
| 初始化 | `InitStack` | `InitQueue` |
| 判空 | `StackEmpty` | `QueueEmpty` |
| 求长度 | `StackLength` | `QueueLength` |
| 读取但不删除 | `GetTop` | `GetHead` |
| 插入 | `Push` | `EnQueue` |
| 删除并取出 | `Pop` | `DeQueue` |
| 清空 / 销毁 | `ClearStack` / `DestroyStack` | `ClearQueue` / `DestroyQueue` |

**取栈顶、取队头不改变元素个数；出栈、出队会删除元素。** 空栈或空队列不能读取、删除元素。

下面的自定义存储结构统一使用以下约定，各节代码可以放在同一份 C++ 文件中：

```c++
#include <iostream>
#include <stack>
#include <string>
#include <cctype>
#include <stdexcept>
using namespace std;

typedef int ElemType;
typedef int Status;
const Status OK = 1;
const Status ERROR = 0;
const int MAXSIZE = 100;
```

操作成功返回 `OK`，失败返回 `ERROR`；通过 `ElemType &e` 带回取出的值。动态分配使用普通 `new`，分配失败时由 C++ 抛出异常，省去与本章核心无关的异常处理。

### 出栈序列的判断

入栈次序固定时，可以让入栈、出栈交替进行，因此出栈次序不一定是入栈次序的完全逆序。

判断方法：按给定次序把元素入栈，每次检查栈顶是否等于下一个需要输出的元素；相等就出栈，否则继续入栈。若所有元素都已入栈，栈顶仍不符合要求，则该序列不合法。

例如入栈序列为 `1、2、3、4、5、6`：

- `1、3、5、4、2、6` 可以实现：`1` 立即出栈，压入 `2、3` 后弹出 `3`，压入 `4、5` 后依次弹出 `5、4、2`，最后压入并弹出 `6`。
- `4、3、5、6、1、2` 不能实现：输出 `4、3、5、6` 后，栈中还剩 `1、2`，栈顶为 `2`，无法先取出 `1`。

若入栈序列为 `1、2、…、n`，且第一个出栈的是 `n`，则其余元素必须按 `n-1、…、2、1` 出栈。


## 顺序栈

### 类型定义与栈顶约定

顺序栈使用一段连续空间保存元素。本节与课件一致，使用 `base` 和 `top` 两个指针：

- `base` 指向存储空间的起始位置。
- `top` 指向**栈顶元素的下一个位置**，也就是下一次入栈时写入的位置。
- `stacksize` 表示分配的容量。

```c++
typedef struct{
    ElemType *base;
    ElemType *top;
    int stacksize;
}SqStack;
```

假设依次入栈 `10、20、30`，则 `base[0..2]` 中保存这三个元素，`top == base + 3`，真正的栈顶元素是 `*(top - 1)`。

| 状态或操作 | 表达式 |
| --- | --- |
| 空栈 | `top == base` |
| 满栈 | `top - base == stacksize` |
| 当前元素个数 | `top - base` |
| 栈顶元素 | `*(top - 1)`，前提是非空 |

`top - base` 是两个指针之间相隔的**元素个数**，不用再除以 `sizeof(ElemType)`。

### 初始化、判空和求长度

```c++
Status InitStack(SqStack &S){
    S.base = new ElemType[MAXSIZE];
    S.top = S.base;
    S.stacksize = MAXSIZE;
    return OK;
}

bool StackEmpty(const SqStack &S){
    return S.top == S.base;
}

int StackLength(const SqStack &S){
    return static_cast<int>(S.top - S.base);
}
```

### 入栈、出栈和取栈顶

```c++
Status Push(SqStack &S, ElemType e){
    if(S.top - S.base == S.stacksize) return ERROR;
    *S.top = e; // 先存入当前空位
    ++S.top;    // 再让top指向下一个位置
    return OK;
}

Status Pop(SqStack &S, ElemType &e){
    if(StackEmpty(S)) return ERROR;
    --S.top;    // 先退回真正的栈顶
    e = *S.top;
    return OK;
}

Status GetTop(const SqStack &S, ElemType &e){
    if(StackEmpty(S)) return ERROR;
    e = *(S.top - 1); // 只读，不移动top
    return OK;
}
```

入栈两句可以合写为 `*S.top++ = e`，相当于 `*(S.top++) = e`；出栈两句可以合写为 `e = *--S.top`。

**入栈先存后移，出栈先移后取。** 满栈时继续入栈称为**上溢**，空栈时继续出栈称为**下溢**。这里固定容量，满栈时返回失败；若需要自动扩容，应另行分配空间并迁移元素。

### 清空和销毁

```c++
void ClearStack(SqStack &S){
    S.top = S.base; // 保留存储空间
}

void DestroyStack(SqStack &S){
    delete[] S.base;
    S.base = S.top = nullptr;
    S.stacksize = 0;
}
```

- **清空：** 将逻辑长度变为 `0`，之后还可以直接入栈。
- **销毁：** 释放存储空间，再使用前需要重新初始化。
- `new ElemType[MAXSIZE]` 必须配对 `delete[]`。
- 修改结构体中的指针需要使用引用参数，`ClearStack(SqStack S)` 只修改副本。

以上求长度、入栈、出栈、取栈顶和清空均为 $O(1)$，不需要移动其他元素。

### 不同的 top 定义

题目可能把 `top` 定义成整数下标。写代码前先确认它指向哪里：

| `top` 的含义 | 空栈 | 满栈 | 入栈 | 出栈 |
| --- | --- | --- | --- | --- |
| 栈顶元素的下标 | `top == -1` | `top == MAXSIZE - 1` | `data[++top] = e` | `e = data[top--]` |
| 下一个空位的下标 | `top == 0` | `top == MAXSIZE` | `data[top++] = e` | `e = data[--top]` |
| 下一个空位的指针，本节采用 | `top == base` | `top - base == stacksize` | `*top++ = e` | `e = *--top` |

如果题目规定从高地址向低地址增长，入栈时指针应递减。不能脱离指针定义直接背 `top++`。


## 共享栈

两个栈共用一个数组，栈底分别位于数组两端，栈顶向中间增长。一个栈空闲的空间可以供另一个栈使用。

这里 `top[0]`、`top[1]` 都表示**实际栈顶元素的下标**，与上一节的指针约定不同：

- 栈 `0` 为空：`top[0] == -1`。
- 栈 `1` 为空：`top[1] == MAXSIZE`。
- 共享空间已满：`top[0] + 1 == top[1]`。

```c++
typedef struct{
    ElemType data[MAXSIZE];
    int top[2];
}DblStack;

void InitStack(DblStack &S){
    S.top[0] = -1;
    S.top[1] = MAXSIZE;
}

bool StackEmpty(const DblStack &S, int i){
    return i == 0 ? S.top[0] == -1 : S.top[1] == MAXSIZE;
}

bool StackFull(const DblStack &S){
    return S.top[0] + 1 == S.top[1];
}

Status Push(DblStack &S, ElemType e, int i){
    if(i < 0 || i > 1 || StackFull(S)) return ERROR;
    if(i == 0) S.data[++S.top[0]] = e;
    else S.data[--S.top[1]] = e;
    return OK;
}

Status Pop(DblStack &S, ElemType &e, int i){
    if(i < 0 || i > 1 || StackEmpty(S, i)) return ERROR;
    if(i == 0) e = S.data[S.top[0]--];
    else e = S.data[S.top[1]++];
    return OK;
}
```

`i` 只能取 `0` 或 `1`。两个栈的总容量是 `MAXSIZE`，不需要各自预留一半；只有两个栈的栈顶相邻时才算满。各操作均为 $O(1)$。


## 链栈

### 类型定义

链栈通常使用**不带头结点的单链表**，把链表头部作为栈顶，`S` 直接指向栈顶元素。

```c++
typedef struct StackNode{
    ElemType data;
    StackNode *next;
}StackNode, *LinkStack;

void InitStack(LinkStack &S){
    S = nullptr;
}

bool StackEmpty(LinkStack S){
    return S == nullptr;
}
```

单链表头部插入、删除都只需修改常数个指针。若把栈顶放在单链表尾部，出栈时要查找前驱，时间复杂度会变成 $O(n)$。

### 入栈、出栈和取栈顶

```c++
Status Push(LinkStack &S, ElemType e){
    StackNode *p = new StackNode{e, S};
    S = p;
    return OK;
}

Status Pop(LinkStack &S, ElemType &e){
    if(StackEmpty(S)) return ERROR;
    StackNode *p = S;
    e = p->data;
    S = p->next;
    delete p;
    return OK;
}

Status GetTop(LinkStack S, ElemType &e){
    if(StackEmpty(S)) return ERROR;
    e = S->data;
    return OK;
}

void ClearStack(LinkStack &S){
    while(S){
        StackNode *p = S;
        S = S->next;
        delete p;
    }
}
```

入栈时先让新结点指向原栈顶，再修改 `S`；出栈时先保存原结点及其后继，再释放原结点。**不能先 `delete p`，再访问 `p->next`。**

链栈不预先分配固定容量，通常不单独判断栈满，但仍受可用内存限制。入栈、出栈和取栈顶为 $O(1)$；求长度需要遍历，为 $O(n)$，若额外维护计数则可降为 $O(1)$。清空需要逐个释放结点，为 $O(n)$。


## 栈的典型应用

### 数制转换

十进制非负整数转为 $d$ 进制时，反复除以 $d$，得到的余数按**低位到高位**产生，输出却需要按**高位到低位**排列，正好适合用栈逆序。

例如把 $1348$ 转为八进制：

| 当前数 | 除以 $8$ 的商 | 余数 |
| ---: | ---: | ---: |
| 1348 | 168 | 4 |
| 168 | 21 | 0 |
| 21 | 2 | 5 |
| 2 | 0 | 2 |

余数依次入栈 `4、0、5、2`，出栈得到 $(2504)_8$。

```c++
string ConvertBase(unsigned int n, int d){
    if(d < 2 || d > 16) throw invalid_argument("invalid base");
    const string digits = "0123456789ABCDEF";
    stack<int> S;
    do{
        S.push(n % d);
        n /= d;
    }while(n); // do-while保证n=0时也输出0

    string ans;
    while(!S.empty()){
        ans += digits[S.top()];
        S.pop();
    }
    return ans;
}
```

时间与辅助空间均为 $O(\log_d n)$（$n>0$）。这里使用 STL 的 `stack` 表达算法，`top()` 只读取，`pop()` 只删除且不返回元素。

### 括号匹配

**最近遇到、尚未匹配的左括号，应该最先与右括号匹配。** 只统计左右括号数量不够，例如 `([)]` 的数量正确，但嵌套关系错误。

扫描字符串时：

1. 左括号入栈。
2. 右括号到来时，若栈空或与栈顶类型不同，匹配失败；否则弹出左括号。
3. 扫描结束时，栈为空才算匹配成功。

```c++
bool Match(char l, char r){
    return (l == '(' && r == ')') ||
           (l == '[' && r == ']') ||
           (l == '{' && r == '}');
}

bool BracketMatch(const string &s){
    stack<char> S;
    for(char ch : s){
        if(ch == '(' || ch == '[' || ch == '{') S.push(ch);
        else if(ch == ')' || ch == ']' || ch == '}'){
            if(S.empty() || !Match(S.top(), ch)) return false;
            S.pop();
        }
    }
    return S.empty(); // 防止剩余左括号
}
```

时间复杂度 $O(n)$，最坏辅助空间 $O(n)$。这段代码忽略非括号字符，适用于检查表达式中的括号。

### 中缀、后缀和前缀表达式

| 表达形式 | 运算符位置 | `A+B*C` 的表示 |
| --- | --- | --- |
| 中缀表达式 | 两个操作数之间 | `A+B*C` |
| 后缀表达式（逆波兰式） | 两个操作数之后 | `A B C * +` |
| 前缀表达式（波兰式） | 两个操作数之前 | `+ A * B C` |

中缀表达式依赖优先级和括号，后缀、前缀表达式通过排列顺序表达运算次序，不需要括号。多个数字之间应保留分隔，例如 `12 3 +` 不能写成含义不清的 `123+`。

#### 中缀转后缀

从左向右扫描，使用一个运算符栈：

1. 遇到操作数，直接输出。
2. 遇到左括号，入栈。
3. 遇到右括号，弹出并输出运算符，直到左括号；丢弃这一对括号。
4. 遇到运算符，先弹出并输出栈内优先级**不低于当前运算符**的运算符，遇到左括号停止，再将当前运算符入栈。
5. 扫描完毕，依次弹出并输出剩余运算符。

这里讨论的是左结合的二元运算 `+、-、*、/`。同优先级也要先弹出，例如 `A-B-C` 应转换成 `A B - C -`，对应 `(A-B)-C`。

例如 `3*(7-2)` 转换后为 `3 7 2 - *`。

#### 后缀表达式求值

从左向右扫描，遇到操作数就入栈，遇到运算符就弹出两个数计算，再把结果压回栈。

**先弹出右操作数 `b`，再弹出左操作数 `a`，计算 `a op b`。** 对减法和除法，顺序尤其不能颠倒。

| 读入 | 操作数栈，从栈底到栈顶 |
| --- | --- |
| `3` | `3` |
| `7` | `3, 7` |
| `2` | `3, 7, 2` |
| `-` | 弹出 `2、7`，压入 `7-2=5`，得到 `3, 5` |
| `*` | 弹出 `5、3`，压入 `3*5=15`，得到 `15` |

合法的二元后缀表达式中，每次运算前至少有两个操作数，处理完毕后栈内恰好剩下一个结果。前缀表达式则通常从右向左扫描，先弹出的数作为左操作数。

### 表达式求值：双栈法

课件使用两个栈直接处理中缀表达式：

- `OPND`：保存操作数和中间结果。
- `OPTR`：保存尚未执行的运算符。

遇到数字就压入 `OPND`。遇到新运算符时，检查 `OPTR` 栈顶：**能够先执行的运算先执行，结果压回 `OPND`，再重新比较。**

课件用 `#` 标记表达式边界，比较的是“栈顶运算符”和“当前输入符号”的优先关系：

| 关系 | 处理方式 | 是否读下一个输入符号 |
| --- | --- | --- |
| `<` | 当前符号入 `OPTR` | 是 |
| `>` | 弹出一个运算符和两个操作数，计算后结果入栈 | **否，要继续比较当前符号** |
| `=` | 匹配并消去括号或边界符号 | 是，或结束 |

这里的 `=` 表示界限符配对，如 `(` 与 `)`，不表示两个普通运算符的优先级相同。同优先级的左结合运算应先执行栈顶运算。

下面将字符串结束作为边界，因此输入不需要带 `#`。假设输入是**合法表达式**，只包含非负整数、空白、圆括号及二元 `+、-、*、/`，不处理一元负号、小数和幂运算；运算使用 `double`，例如 `7/2` 得到 `3.5`。

```c++
int Priority(char op){
    if(op == '+' || op == '-') return 1;
    if(op == '*' || op == '/') return 2;
    return 0;
}

double Apply(double a, double b, char op){
    if(op == '+') return a + b;
    if(op == '-') return a - b;
    if(op == '*') return a * b;
    if(op == '/' && b != 0) return a / b;
    throw runtime_error("invalid operation or division by zero");
}

double EvaluateExpression(const string &s){
    stack<double> OPND;
    stack<char> OPTR;
    auto Calculate = [&](){
        double b = OPND.top(); OPND.pop(); // 右操作数
        double a = OPND.top(); OPND.pop(); // 左操作数
        char op = OPTR.top(); OPTR.pop();
        OPND.push(Apply(a, b, op));
    };

    for(size_t i = 0; i < s.size();){
        char ch = s[i];
        if(isspace(static_cast<unsigned char>(ch))){
            ++i;
        }else if(isdigit(static_cast<unsigned char>(ch))){
            double x = 0;
            while(i < s.size() && isdigit(static_cast<unsigned char>(s[i])))
                x = x * 10 + (s[i++] - '0');
            OPND.push(x); // 连续读入多位整数
        }else if(ch == '('){
            OPTR.push(ch);
            ++i;
        }else if(ch == ')'){
            while(OPTR.top() != '(') Calculate();
            OPTR.pop(); // 丢弃左括号
            ++i;
        }else{
            while(!OPTR.empty() && OPTR.top() != '(' &&
                  Priority(OPTR.top()) >= Priority(ch))
                Calculate();
            OPTR.push(ch);
            ++i;
        }
    }
    while(!OPTR.empty()) Calculate();
    return OPND.top();
}
```

例如 `EvaluateExpression("3*(7-2)")` 返回 `15`。每个数字或运算符只入栈、出栈常数次，时间复杂度为 $O(n)$，最坏辅助空间为 $O(n)$。


## 栈与递归

### 递归的条件与执行过程

函数直接或间接调用自身，称为递归调用。常见场景包括递归定义的数学函数、树等递归结构，以及汉诺塔、回溯搜索等问题。

一个能够结束的递归过程需要：

- **递归出口：** 规模足够小时直接给出结果。
- **递归关系：** 将当前问题转化为更小或更接近终止状态的同类问题。

函数嵌套调用遵循**后调用先返回**。在通常的调用栈模型中，每次调用保存返回位置、参数和局部状态，返回时恢复上一层，因此递归与栈相对应。

```c++
long long Fact(int n){ // 约定0 <= n <= 20，避免long long溢出
    if(n == 0) return 1;
    return n * Fact(n - 1);
}
```

计算 `Fact(4)` 时：

| 阶段 | 过程 |
| --- | --- |
| 逐层调用 | `Fact(4)`、`Fact(3)`、`Fact(2)`、`Fact(1)`、`Fact(0)` |
| 到达出口 | `Fact(0)` 返回 `1` |
| 逐层返回 | `Fact(1)=1`、`Fact(2)=2`、`Fact(3)=6`、`Fact(4)=24` |

每层都在等待下一层的结果，局部变量属于各自的调用，互不替代。阶乘递归执行 $n+1$ 次调用，时间复杂度为 $O(n)$，最大递归深度及辅助空间为 $O(n)$。

### 汉诺塔

将 `n` 个圆盘从 `A` 借助 `B` 移到 `C`，每次只能移动一个盘，且大盘不能放在小盘上。

1. 将上面的 `n-1` 个盘从 `A` 借助 `C` 移到 `B`。
2. 将最大的盘从 `A` 移到 `C`。
3. 将 `B` 上的 `n-1` 个盘借助 `A` 移到 `C`。

```c++
void Hanoi(int n, char A, char B, char C){
    if(n == 0) return;
    Hanoi(n - 1, A, C, B);
    cout << A << " -> " << C << '\n';
    Hanoi(n - 1, B, A, C);
}
```

约定 `n>=0`，其中 `B` 始终表示本次调用的辅助柱，参数位置随着子问题改变。

设移动次数为 $M(n)$，则：

$$
M(0)=0,\qquad M(n)=2M(n-1)+1
$$

因此：

$$
M(n)=2^n-1
$$

时间复杂度为 $O(2^n)$，递归栈空间为 $O(n)$。**总调用次数看整棵调用树，栈空间看同一时刻的最大调用深度**，不能因为调用了两次自身，就把空间也写成指数级。

### 递归改为非递归

- 阶乘等过程可以改写为循环，逐步累乘，辅助空间降为 $O(1)$。
- 斐波那契数列的朴素递归有大量重复子问题，改用循环或记忆化能减少重复计算。
- 需要保留“返回后继续做什么”的过程，可以用显式栈保存参数、局部状态和处理进度。

`return n * Fact(n-1)` 在递归返回后仍要做乘法，所以它不是尾递归。尾递归要求递归调用是函数返回前的最后一步，且不再加工调用结果。

递归写法通常简洁，但递归太深可能耗尽调用栈。分析时要分别考虑调用次数、每次调用的工作量和最大递归深度。

### 迷宫与回溯

迷宫求解可以用栈保存当前路径。每个栈元素除坐标外，还需要记录**下一次应尝试的方向**：

1. 从当前位置尝试相邻的可行位置，进入后入栈。
2. 走到死路就出栈，回到上一个位置，继续尝试尚未检查的方向。
3. 到达出口则找到路径，栈空仍未到达出口则无路可走。

需要标记已访问位置，防止绕圈。若只要求找到任意一条路，可以保留全局访问标记；若枚举所有简单路径，则需要在回退时撤销当前路径上的标记。


## 队列与循环队列

### 顺序队列的假溢出

普通顺序队列使用数组，约定 `front` 指向队头元素，`rear` 指向队尾元素的下一个位置：

- 入队：`base[rear++] = e`。
- 出队：`e = base[front++]`。
- 队空：`front == rear`。

若 `rear` 已到数组末端，即使前面因出队而出现空位，也无法直接继续入队，这称为**假溢出**。例如容量为 `6`，`front=4、rear=6` 时实际只有两个元素，前面四个位置却无法利用。

每次出队都把所有元素前移可以利用空间，但出队代价会变成 $O(n)$。循环队列通过下标回绕复用这些空位。

### 循环队列的指针约定

把数组看成首尾相接，位置移动一格统一写成：

$$
\operatorname{next}(i)=(i+1)\bmod MAXSIZE
$$

本节采用**少用一个存储单元**的方案：

- `front` 指向队头元素。
- `rear` 指向下一次入队的位置。
- 有效元素从 `front` 开始沿循环方向排列，直到 `rear` 之前。

如果允许所有位置都存满，`rear` 绕一圈后也会等于 `front`，就无法只靠二者判断空满。保留一个空位后，队尾再前进一步就会碰到队头，此时禁止入队。

| 状态或操作 | 表达式 |
| --- | --- |
| 队空 | `front == rear` |
| 队满 | `(rear + 1) % MAXSIZE == front` |
| 长度 | `(rear - front + MAXSIZE) % MAXSIZE` |
| 最大可存元素个数 | `MAXSIZE - 1` |
| 入队后移动 | `rear = (rear + 1) % MAXSIZE` |
| 出队后移动 | `front = (front + 1) % MAXSIZE` |

“少用一个单元”不是固定丢弃某个数组下标，而是让队头、队尾之间始终留出一个空位。

### 类型定义和基本操作

```c++
typedef struct{
    ElemType *base;
    int front;
    int rear;
}SqQueue;

Status InitQueue(SqQueue &Q){
    Q.base = new ElemType[MAXSIZE];
    Q.front = Q.rear = 0;
    return OK;
}

bool QueueEmpty(const SqQueue &Q){
    return Q.front == Q.rear;
}

bool QueueFull(const SqQueue &Q){
    return (Q.rear + 1) % MAXSIZE == Q.front;
}

int QueueLength(const SqQueue &Q){
    return (Q.rear - Q.front + MAXSIZE) % MAXSIZE;
}

Status EnQueue(SqQueue &Q, ElemType e){
    if(QueueFull(Q)) return ERROR;
    Q.base[Q.rear] = e;
    Q.rear = (Q.rear + 1) % MAXSIZE;
    return OK;
}

Status DeQueue(SqQueue &Q, ElemType &e){
    if(QueueEmpty(Q)) return ERROR;
    e = Q.base[Q.front];
    Q.front = (Q.front + 1) % MAXSIZE;
    return OK;
}

Status GetHead(const SqQueue &Q, ElemType &e){
    if(QueueEmpty(Q)) return ERROR;
    e = Q.base[Q.front];
    return OK;
}

void ClearQueue(SqQueue &Q){
    Q.front = Q.rear = 0;
}

void DestroyQueue(SqQueue &Q){
    delete[] Q.base;
    Q.base = nullptr;
    Q.front = Q.rear = 0;
}
```

这些操作在初始化后的队列上执行，销毁后应重新初始化。入队、出队、取队头和求长度均为 $O(1)$，不移动其他元素。

### 长度公式与回绕示例

当 `rear >= front` 时，长度为 `rear-front`；当 `rear < front` 时，说明跨过了数组末端，长度为 `MAXSIZE-front+rear`。二者可以统一写成：

$$
\text{length}=(rear-front+MAXSIZE)\bmod MAXSIZE
$$

例如 `MAXSIZE=6、front=4、rear=1` 时，有效元素依次位于下标 `4、5、0`，长度为：

$$
(1-4+6)\bmod 6=3
$$

此时再入队写入下标 `1`，然后令 `rear=2`；出队读取下标 `4`，然后令 `front=5`。两种操作分别移动不同的下标。

也可以额外维护元素个数 `size` 或空满标志 `tag`，从而利用所有 `MAXSIZE` 个位置，但判空、判满、长度公式都必须与所选方案一致。增加 `size` 时，空为 `size==0`，满为 `size==MAXSIZE`，长度直接取 `size`。


## 链队列

### 类型定义与空队列

链队列通常使用**带头结点的单链表**，同时维护队头、队尾指针：

- `front` 始终指向头结点，头结点不存放有效队列元素。
- 非空时，`front->next` 指向队头元素，`rear` 指向最后一个数据结点。
- 空队列时，`front == rear`，且头结点的 `next` 为 `nullptr`。

```c++
typedef struct QNode{
    ElemType data;
    QNode *next;
}QNode, *QueuePtr;

typedef struct{
    QueuePtr front;
    QueuePtr rear;
}LinkQueue;

Status InitQueue(LinkQueue &Q){
    Q.front = Q.rear = new QNode{0, nullptr};
    return OK;
}

bool QueueEmpty(const LinkQueue &Q){
    return Q.front == Q.rear;
}
```

链栈不带头结点，空时 `S==nullptr`；本节链队列带头结点，空时仍保留一个结点。判空条件来自各自的结构约定。

### 入队、出队和取队头

```c++
Status EnQueue(LinkQueue &Q, ElemType e){
    QueuePtr p = new QNode{e, nullptr};
    Q.rear->next = p; // 原队尾连接新结点
    Q.rear = p;       // 更新队尾
    return OK;
}

Status DeQueue(LinkQueue &Q, ElemType &e){
    if(QueueEmpty(Q)) return ERROR;
    QueuePtr p = Q.front->next;
    e = p->data;
    Q.front->next = p->next;
    if(Q.rear == p) Q.rear = Q.front;
    delete p;
    return OK;
}

Status GetHead(const LinkQueue &Q, ElemType &e){
    if(QueueEmpty(Q)) return ERROR;
    e = Q.front->next->data;
    return OK;
}
```

**删除最后一个数据结点时，必须令 `rear=front`。** 此时 `p` 同时也是队尾，如果直接释放，`rear` 会成为悬空指针，下一次入队时访问 `rear->next` 就会出错。

### 清空和销毁

```c++
void ClearQueue(LinkQueue &Q){
    QueuePtr p = Q.front->next;
    while(p){
        QueuePtr next = p->next;
        delete p;
        p = next;
    }
    Q.front->next = nullptr; // 清空后保留头结点
    Q.rear = Q.front;
}

void DestroyQueue(LinkQueue &Q){
    ClearQueue(Q);
    delete Q.front;
    Q.front = Q.rear = nullptr;
}
```

清空、销毁均在已初始化且尚未销毁的队列上执行。链队列的入队、出队、取队头为 $O(1)$；未维护计数时，求长度和清空为 $O(n)$。使用 `new` 分配的结点应配对 `delete`，不能混用 `free`。


## 队列的典型应用

### 舞伴配对

分别用两个队列保存等待配对的人员，每次从两个队头各取一人，直到某个队列为空。

例如两队为 `A1、A2、A3` 和 `B1、B2`，配对结果依次为 `(A1,B1)`、`(A2,B2)`，余下的 `A3` 成为下一轮优先配对的人。队列保留了各组内部的先来先服务顺序。

### 缓冲区和层次遍历

- **打印缓冲区：** 主机依次写入打印数据，打印机按先入先出的顺序读取，协调二者速度差异。固定大小的缓冲区可以使用循环队列。
- **层次遍历、广度优先搜索：** 用队列保存已经发现、尚未处理的结点。先发现的先处理，从而逐层向外扩展。

队列适用于“较早进入的对象应较早处理”的任务；需要按其他规则安排任务时，应明确是否仍满足 FIFO。

### 双端队列和优先队列

这部分作为概念补充，先区分操作规则即可：

| 结构 | 操作规则 |
| --- | --- |
| 普通队列 | 队尾入，队头出，FIFO |
| 双端队列 | 两端都可以插入、删除 |
| 输入受限的双端队列 | 只允许一端插入，两端都能删除 |
| 输出受限的双端队列 | 两端都能插入，只允许一端删除 |
| 优先队列 | 按优先级取出元素，先入者不一定先出 |

优先队列常用堆实现，插入和删除最优先元素一般为 $O(\log n)$，读取最优先元素为 $O(1)$。优先级越高对应数值越大还是越小，要由题目约定。


## 易错点与复杂度总结

| 结构 | 判空 | 判满或容量限制 | 最关键的约定 |
| --- | --- | --- | --- |
| 顺序栈 | `top == base` | `top-base == stacksize` | `top` 指向栈顶的下一个位置 |
| 共享栈 | `top[0]==-1` / `top[1]==MAXSIZE` | `top[0]+1 == top[1]` | 两个栈顶向中间增长 |
| 链栈 | `S == nullptr` | 受可用内存限制 | 不带头结点，表头是栈顶 |
| 循环队列 | `front == rear` | `(rear+1)%MAXSIZE == front` | 本文保留一个空位 |
| 链队列 | `front == rear` | 受可用内存限制 | 带头结点，最后出队要重置 `rear` |

| 操作 | 顺序栈 | 链栈 | 循环队列 | 链队列 |
| --- | --- | --- | --- | --- |
| 插入、删除、取顶或取头 | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| 求长度 | $O(1)$ | $O(n)$ | $O(1)$ | $O(n)$ |
| 清空 | $O(1)$ | $O(n)$ | $O(1)$ | $O(n)$ |

表中链式结构未额外维护长度。容量为 $m$ 的顺序结构占用 $O(m)$ 存储空间；链式结构存放 $n$ 个元素时占用 $O(n)$ 空间，另有指针开销。这是结构本身的存储开销，与单次基本操作所需的 $O(1)$ 辅助空间要区分。

复习时重点检查：

1. **先看指针定义。** `top` 指向实际元素还是下一个空位？`front` 指向头结点还是队头元素？
2. **读取和删除分开。** `GetTop`、`GetHead` 不能改变结构，`Pop`、`DeQueue` 才删除元素。
3. **顺序受限。** 出栈只能取当前栈顶，表达式减除运算先弹出右操作数。
4. **循环队列公式成套使用。** 本文容量是 `MAXSIZE-1`，长度为 `(rear-front+MAXSIZE)%MAXSIZE`。
5. **边界结点单独处理。** 空结构不能删除，链队列删到空时必须让 `rear` 回到头结点。
6. **递归次数与深度分开。** 汉诺塔时间为 $O(2^n)$，递归栈空间为 $O(n)$。

### 一道综合例题

元素 `1、2、3、4、5、6` 依次通过栈 `S`，出栈后立即进入普通队列 `Q`。若最终出队序列为 `2、4、3、6、5、1`，栈至少需要多大容量？

普通队列不会改变元素相对次序，因此出队序列也就是出栈序列。按目标输出模拟：

| 下一步输出 | 操作 | 此阶段最大栈长 |
| --- | --- | ---: |
| `2` | 压入 `1、2`，弹出 `2` | 2 |
| `4、3` | 压入 `3、4`，弹出 `4、3` | 3 |
| `6、5、1` | 压入 `5、6`，弹出 `6、5、1` | 3 |

全过程最多同时保存 `3` 个元素，因此栈的最小容量为 **3**。
