---
title: "【数据结构】 第四章 串、数组和广义表"
date: 2026-09-28
lastmod: 
categories:
  - "学习笔记 | Learning Notes"
tags:
  - "notes: 数据结构"

weight: 40
pinned: false
draft: false
---

## 串

#### 串的定义和基本术语

- 串（String）：由零个或多个字符组成的有限序列，记为 `S = "a1a2...an"`。
- 串中的字符可以来自字母、数字、汉字或其他字符集合。
- 串的长度：串中字符的个数，记为 `|S|`。空串记为 `""`，长度为 `0`。
- 空格也是字符，不能把空格和空串混淆。
- 子串：串中任意个连续字符组成的子序列。
- 主串：包含子串的串。
- 位置：字符在串中的序号，通常从 `1` 开始。
- 非空子串的第一个字符在主串中的位置称为子串在主串中的位置。
- 串相等：长度相等，且对应位置的字符都相等。

#### 串的基本操作

- `StrAssign`：生成一个值为给定字符串的串。
- `StrCopy`：复制串。
- `StrCompare`：比较两个串的大小。
- `StrLength`：求串长。
- `Concat`：连接两个串。
- `SubString`：求子串。
- `Index`：定位子串。
- `Replace`：替换子串。
- `ClearString`：清空串。

#### 串的比较

- 通常按字典序比较：从第一个字符开始逐个比较。
- 若某一位置字符不同，则字符值较大的串较大。
- 若一个串是另一个串的前缀，则长度较大的串较大。

```c++
int StrCompare(const string& s, const string& t){
    int i = 0;
    while(i < s.size() && i < t.size() && s[i] == t[i])
        ++i;
    if(i == s.size() && i == t.size()) return 0; // 两串相等
    if(i == s.size()) return -1;                  // s 是较短的前缀
    if(i == t.size()) return 1;                   // t 是较短的前缀
    return s[i] < t[i] ? -1 : 1;                  // 比较第一个不同字符
}
```

#### 串的存储结构

##### 定长顺序存储

```c++
#define MAXLEN 255
typedef struct{
    char ch[MAXLEN + 1]; // 下标0可存放长度，也可直接从下标1存字符
    int length;           // 当前串长
}SString;
```

- 优点：随机访问快，结构简单。
- 缺点：串长受上限限制，空间可能浪费。

##### 堆分配存储

```c++
typedef struct{
    char* ch;   // 指向动态分配的字符数组
    int length; // 当前串长
}HString;
```

- 串长可动态变化，但连接、插入、删除时可能需要重新分配空间。

##### 块链存储

```c++
#define BLOCK_SIZE 4
typedef struct Chunk{
    char ch[BLOCK_SIZE]; // 一个结点存放多个字符
    struct Chunk* next;
}Chunk, *String;
```

- 每个链结点存放一组字符，适合长度变化频繁的串。
- 结点内部可能有未使用的位置，空间利用率不一定高。

#### 串的基本运算

##### 求子串

```c++
string SubString(const string& s, int pos, int len){
    // pos 从1开始，截取长度为len的连续字符
    if(pos < 1 || pos > static_cast<int>(s.size()) + 1 || len < 0)
        return "";
    if(pos - 1 + len > s.size())
        return "";
    return s.substr(pos - 1, len);
}
```

##### 串连接

```c++
string Concat(const string& s, const string& t){
    return s + t; // 结果串先放s，再放t
}
```

##### 朴素模式匹配（BF 算法）

- 目标：在主串 `S` 中查找模式串 `T` 第一次出现的位置。
- 匹配失败后，主串指针回退到本轮起点的下一个位置，模式串指针回到 `1`。
- 最坏时间复杂度：`O(nm)`，其中 `n=|S|`，`m=|T|`。

```c++
int Index_BF(const string& S, const string& T){
    int i = 0; // 主串当前位置
    int j = 0; // 模式串当前位置
    while(i < S.size() && j < T.size()){
        if(S[i] == T[j]){
            ++i;
            ++j;
        }else{
            i = i - j + 1; // 回到下一轮可能的起点
            j = 0;          // 模式串重新从头匹配
        }
    }
    return j == T.size() ? i - j + 1 : 0; // 位置从1开始，失败返回0
}
```

##### KMP 算法

- 核心思想：主串匹配失败时，主串指针不回退，只根据模式串自身的前后缀信息移动模式串。
- `next[j]`：模式串第 `j` 个字符失配时，`j` 应回退到的位置。
- 真前缀：不包含最后一个字符的前缀。
- 真后缀：不包含第一个字符的后缀。
- `next[j]` 表示 `T[1..j-1]` 的最长相等真前缀和真后缀长度加 `1` 的位置写法。
- 采用不同教材的下标约定时，`next` 数组初值可能不同，考试时要以题目约定为准。

```c++
// 模式串下标从1开始，next[1] = 0
void GetNext(const string& T, vector<int>& next){
    int m = static_cast<int>(T.size()) - 1; // T[0] 不使用
    next.assign(m + 1, 0);
    int j = 1, k = 0;
    while(j < m){
        if(k == 0 || T[j] == T[k]){
            ++j;
            ++k;
            next[j] = k;
        }else{
            k = next[k]; // 利用已经求出的前缀信息继续比较
        }
    }
}

int Index_KMP(const string& S, const string& T){
    // S、T 均在下标0前补一个占位字符，实际字符从1开始
    int n = static_cast<int>(S.size()) - 1;
    int m = static_cast<int>(T.size()) - 1;
    vector<int> next;
    GetNext(T, next);

    int i = 1, j = 1;
    while(i <= n && j <= m){
        if(j == 0 || S[i] == T[j]){
            ++i;
            ++j;
        }else{
            j = next[j]; // 主串指针不回退
        }
    }
    return j > m ? i - m : 0;
}
```

##### `nextval` 优化

- 若 `T[j] == T[next[j]]`，则 `next[j]` 位置比较后仍会失配，可以继续跳到 `nextval[next[j]]`。
- `nextval` 减少模式串内部的无效比较，最坏时间复杂度仍为 `O(n+m)`。

```c++
void GetNextVal(const string& T, vector<int>& nextval){
    int m = static_cast<int>(T.size()) - 1;
    nextval.assign(m + 1, 0);
    int j = 1, k = 0;
    while(j < m){
        if(k == 0 || T[j] == T[k]){
            ++j;
            ++k;
            // 相同字符会导致同样的失配，直接继续跳转
            nextval[j] = (T[j] == T[k]) ? nextval[k] : k;
        }else{
            k = nextval[k];
        }
    }
}
```

#### 串的重点总结

- BF：实现简单，但失配时可能反复比较，最坏 `O(nm)`。
- KMP：利用模式串前后缀关系，主串指针不回退，时间复杂度 `O(n+m)`。
- `next` 与 `nextval` 的具体数组值取决于下标和初值约定，做题时先统一定义。
- 串的连接、复制和替换要注意目标空间是否足够，以及是否允许结果与原串共用存储空间。


## 数组

#### 数组的定义和特点

- 数组是由 `n` 个相同类型的数据元素组成的有序集合。
- 一维数组可以看作线性表，二维及多维数组是线性表的推广。
- 数组元素由下标唯一确定，通常支持随机存取。
- 数组一旦声明，维数和各维长度通常固定。

#### 数组的抽象数据类型

- `InitArray`：初始化数组。
- `DestroyArray`：销毁数组。
- `Value`：按下标取值。
- `Assign`：按下标修改元素。
- `Locate`：计算元素在存储空间中的地址。

#### 数组的顺序存储

- 多维数组通常采用一维连续存储。
- 常见存储方式：行优先顺序、列优先顺序。
- C/C++ 的二维数组采用行优先顺序。

##### 二维数组行优先地址计算

设二维数组 `A[0..n-1][0..m-1]`，每个元素占 `L` 个存储单元，首地址为 `LOC(A[0][0])`，则：

$$
LOC(A[i][j]) = LOC(A[0][0]) + (i \times m + j) \times L
$$

若下标从 `1` 开始：

$$
LOC(A[i][j]) = LOC(A[1][1]) + ((i-1) \times m + (j-1)) \times L
$$

##### 二维数组列优先地址计算

$$
LOC(A[i][j]) = LOC(A[0][0]) + (j \times n + i) \times L
$$

##### 多维数组地址计算

以三维数组 `A[d1][d2][d3]` 的行优先存储为例：

$$
LOC(A[i][j][k]) = LOC(A[0][0][0]) + ((i \times d2 \times d3) + (j \times d3) + k) \times L
$$

#### 数组的基本操作代码

```c++
template<class T>
class Array2D{
private:
    int rows, cols;
    vector<T> data; // 按行优先存储二维数组

public:
    Array2D(int r, int c) : rows(r), cols(c), data(r * c) {}

    T& at(int i, int j){
        // 0 <= i < rows，0 <= j < cols
        return data[i * cols + j];
    }
};
```


## 特殊矩阵的压缩存储

#### 压缩存储的基本思想

- 若矩阵中大量元素相同或为零，可以只存储有用元素，减少空间。
- 压缩存储的关键是：根据二维下标计算元素在一维存储区中的下标。
- 访问压缩矩阵时要先判断元素属于哪一部分，再计算映射位置。

#### 对称矩阵

- 满足 `a[i][j] = a[j][i]` 的矩阵称为对称矩阵。
- 只需存储主对角线及其一侧的元素，共存储 `n(n+1)/2` 个元素。
- 常用做法：按行优先存储下三角区域。

对下三角部分，采用从 `1` 开始的下标：

$$
k = \frac{i(i-1)}{2} + j \quad (i \ge j)
$$

若 `i < j`，利用对称性令 `i`、`j` 交换后再计算。

```c++
int SymmetricIndex(int i, int j){
    if(i < j) swap(i, j); // 上三角元素映射到对应的下三角位置
    return i * (i - 1) / 2 + j; // 一维数组下标从1开始
}
```

#### 三角矩阵

##### 下三角矩阵

- 主对角线以上元素全部为同一个常数（通常为 `0`）。
- 存储下三角区域，共 `n(n+1)/2` 个元素，再额外存储一个常数元素。
- 当 `i < j` 时直接返回常数，否则按下三角公式定位。

##### 上三角矩阵

- 主对角线以下元素全部为同一个常数。
- 存储上三角区域，共 `n(n+1)/2` 个元素，再额外存储一个常数元素。

#### 对角矩阵

- 除主对角线外，其余元素均为同一个常数（通常为 `0`）。
- 只需存储主对角线上的 `n` 个元素和一个常数。
- 若 `i == j`，返回对角线元素；否则返回常数。

#### 稀疏矩阵

- 非零元素个数远少于矩阵元素总数的矩阵称为稀疏矩阵。
- 常用三元组表存储非零元素：`(行号, 列号, 元素值)`。

```c++
typedef struct{
    int i, j; // 非零元素的行号和列号
    int value;
}Triple;

typedef struct{
    Triple data[1000]; // 按行优先保存非零元素
    int rows, cols;    // 矩阵行数和列数
    int terms;         // 非零元素个数
}TSMatrix;
```

- 三元组表适合访问和转置操作，但随机访问某个元素不如普通二维数组方便。
- 三元组通常按行号、列号有序排列。

##### 稀疏矩阵转置

```c++
void FastTranspose(const TSMatrix& M, TSMatrix& T){
    T.rows = M.cols;
    T.cols = M.rows;
    T.terms = M.terms;
    if(M.terms == 0) return;

    vector<int> num(M.cols + 1, 0);  // 每一列非零元素个数
    vector<int> cpot(M.cols + 1, 0); // 每列第一个元素在T中的位置

    for(int p = 1; p <= M.terms; ++p)
        ++num[M.data[p].j];

    cpot[1] = 1;
    for(int col = 2; col <= M.cols; ++col)
        cpot[col] = cpot[col - 1] + num[col - 1];

    for(int p = 1; p <= M.terms; ++p){
        int col = M.data[p].j;
        int q = cpot[col]++; // 放入转置矩阵对应列的下一个位置
        T.data[q].i = M.data[p].j;
        T.data[q].j = M.data[p].i;
        T.data[q].value = M.data[p].value;
    }
}
```

- 普通转置可能需要反复扫描三元组，时间复杂度较高。
- 快速转置先统计每列非零元素个数，再计算各列起始位置，时间复杂度为 `O(cols + terms)`。

#### 矩阵压缩存储重点

- 对称矩阵：一半元素由另一半确定。
- 三角矩阵：三角区域存实际值，其余区域存统一常数。
- 对角矩阵：只需存主对角线。
- 稀疏矩阵：重点掌握三元组表示和快速转置。
- 做地址题时先确认：下标起点、按行还是按列、是否包含常数项。


## 广义表

#### 广义表的定义

- 广义表（Generalized List）是 `n` 个元素组成的有限序列，元素可以是原子，也可以是广义表。
- 广义表通常记为：

$$
GL = (a_1, a_2, \ldots, a_n)
$$

- 原子：不可再分的单个元素。
- 子表：作为广义表元素出现的广义表。
- 空表：不含任何元素的表，记为 `()`。
- 表头：广义表的第一个元素。
- 表尾：除去表头后由其余元素组成的广义表。

#### 广义表的递归定义

- `()` 是广义表。
- 若 `a` 是原子，则 `(a)` 是广义表。
- 若 `A`、`B` 是广义表，则 `(A,B)` 是广义表。
- 广义表允许递归定义，因此表元素可以继续是广义表。

例如：

- `A = ()`：空表。
- `B = (a, b)`：长度为 `2` 的表，两个元素都是原子。
- `C = (a, (b, c))`：长度为 `2`，第二个元素是子表。
- `D = (A, B, C)`：元素可以是其他广义表。

#### 广义表的长度和深度

- 长度：最外层元素的个数，不递归统计子表内部元素。
- 深度：广义表中括号嵌套的最大层数。
- 空表的长度为 `0`，深度通常定义为 `1`。
- 原子的深度为 `0`或按教材约定处理，考试中应以题目定义为准。

例如：

- `A = (a, (b, c), d)` 的长度为 `3`。
- `A` 的深度取决于子表的最大嵌套层数。

#### 表头和表尾

- 非空广义表一定有表头和表尾。
- 对 `A = (a, (b, c), d)`：
  - `Head(A) = a`
  - `Tail(A) = ((b, c), d)`
- 表尾仍然是广义表，即使它只含一个元素或为空表。

```c++
// 下面是广义表结点的典型表示：tag区分原子结点和表结点
typedef enum{ATOM, LIST} ElemTag;

typedef struct GLNode{
    ElemTag tag;
    union{
        char atom;          // tag == ATOM 时使用
        struct GLNode* hp;  // tag == LIST 时指向表头
    };
    struct GLNode* tp;      // 指向表尾（同层下一个元素）
}GLNode, *GList;
```

#### 广义表的存储结构

##### 头尾链表表示

- 每个结点包含 `tag`、`hp`、`tp`。
- `tag=ATOM`：结点存放原子值，`tp` 指向同一层下一个元素。
- `tag=LIST`：`hp` 指向子表表头，`tp` 指向同一层下一个元素。
- 头尾链表适合表示任意层次的嵌套结构。

##### 扩展线性链表表示

- 也可以用两个指针分别指向表头和表尾。
- 对原子结点，数据域存原子；对子表结点，指针域指向子表。
- 具体字段名称随教材和代码实现而变化，但核心都是“标志位 + 子表指针 + 同层后继指针”。

#### 广义表的基本操作

- `CreateGList`：根据括号表示创建广义表。
- `DestroyGList`：递归释放广义表空间。
- `GetHead`：求表头。
- `GetTail`：求表尾。
- `GListLength`：求最外层长度。
- `GListDepth`：求广义表深度。
- `CopyGList`：复制广义表。
- `GListEmpty`：判断是否为空表。

##### 求广义表长度

```c++
int GListLength(GList L){
    int len = 0;
    while(L){
        ++len;      // 只统计当前这一层的元素
        L = L->tp;  // 沿同层后继指针继续扫描
    }
    return len;
}
```

##### 求广义表深度

```c++
int GListDepth(GList L){
    if(!L) return 1; // 空表深度按常见约定记为1

    int maxDepth = 0;
    for(GList p = L; p; p = p->tp){
        int depth = 0;
        if(p->tag == ATOM){
            depth = 0; // 原子不再包含子表
        }else{
            depth = GListDepth(p->hp); // 递归求子表深度
        }
        maxDepth = max(maxDepth, depth);
    }
    return maxDepth + 1; // 当前层再增加一层
}
```

##### 求表头和表尾的注意点

- `GetHead` 返回的是第一个元素，可以是原子，也可以是子表。
- `GetTail` 返回的是去掉第一个元素后的广义表，不是简单的下一个原子。
- 若需要返回新表，通常要复制结点，避免直接修改原表结构。

#### 广义表与树的关系

- 广义表是一种递归结构，适合表示具有层次关系的数据。
- 一个广义表可以看作一棵树：表结点表示子表，原子结点表示叶子。
- 目录结构、表达式、层次化配置等都可以用广义表或树来描述。
- 广义表的递归处理思想与树的递归遍历相似。

#### 广义表重点总结

- 牢记：表头是第一个元素，表尾是删除第一个元素后剩下的表。
- 长度只统计最外层元素，深度统计最大嵌套层数。
- 头尾链表中的 `hp` 表示子表，`tp` 表示同层后继。
- 递归是处理广义表创建、复制、求深度和销毁的主要方法。


## 本章重点与易错点

#### 高频考点

- 串的基本概念：空串、空格、子串、主串、位置、串长。
- BF 和 KMP 模式匹配过程，尤其是失配后的指针变化。
- `next` 数组的含义，以及 `next` 与 `nextval` 的区别。
- 二维数组按行优先和列优先存储的地址计算。
- 对称矩阵、三角矩阵、对角矩阵的压缩存储下标计算。
- 稀疏矩阵三元组表示和快速转置。
- 广义表的表头、表尾、长度、深度和头尾链表结构。

#### 易错点

- 串的位置通常从 `1` 开始，C/C++ 数组下标通常从 `0` 开始，写代码时要明确转换。
- KMP 的 `next` 数组有多种教材定义，不能直接套用别人的数组结果。
- 行优先和列优先的地址公式不能混用。
- 对称矩阵压缩存储时，先把 `(i,j)` 转换为下三角区域，再计算下标。
- 稀疏矩阵的 `terms` 是非零元素个数，不是矩阵总元素个数。
- 广义表的表尾仍是表，不能把表尾误认为最后一个元素。

#### 复杂度总结

| 操作 | 典型时间复杂度 |
| --- | --- |
| 串按位置取字符 | `O(1)` |
| BF 模式匹配（最坏） | `O(nm)` |
| KMP 模式匹配 | `O(n+m)` |
| 普通数组按下标取值 | `O(1)` |
| 稀疏矩阵快速转置 | `O(cols + terms)` |
| 广义表求长度 | `O(n)`，`n` 为最外层元素个数 |
| 广义表求深度 | 与结点总数同阶，递归遍历一次 |

