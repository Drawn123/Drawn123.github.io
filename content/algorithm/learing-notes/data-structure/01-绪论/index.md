---
title: "【数据结构】 第一章 绪论"
date: 2026-09-14
lastmod: 
categories:
  - "学习笔记 | Learning Notes"
tags:
  - "notes: 数据结构"

weight: 10
pinned: false
draft: false
---



### 数据结构研究内容

不是做加减乘除这类数学计算，而是研究数据本身、数据之间的联系，以及能对数据做什么操作（增、删、查、改等）。



### 数据结构的两个层次

1. 逻辑结构

   * 线性结构：线性表、栈、队列、串
   * 非线性结构：树、图

   * 也可以划分为集合、线性结构、树形结构、图形结构

2. 存储结构

   * 顺序存储结构：相邻的元素内存也相邻
   * 链式存储结构：用地址的指针表示逻辑关系，相邻元素内存中物理地址不一定相邻



### 抽象数据类型的表示

1. 预定义常量及类型

   ```c++
   #define OK 1
   #define ERROR 0
   #define OVERFLOW -2
   
   typedef int Status
   ```

   `Status` 是函数返回值类型，其值是函数结果状态

2. 数据元素被约定为 `ElemType` 类型，根据情况自定义

3. 内存的动态分配与释放

   * 使用 `new` 和 `delete` 动态分配和释放内存空间
   * 分配：指针变量=new 数据类型
   * 释放：delete 指针变量



### 时间复杂度

时间复杂度是由嵌套最深层语句的频度决定的

#### 例

```
for( i=1; i<=n; i++)
    for (j=1; j<=i; j++)
        for (k=1; k<=j; k++)
            x=x+1;
```

#### 定理

若$f(n)=a_mn^m+a_{m-1}n^{m-1}+\dots +a_1n+a_0$是$m$次多项式，则$T(n)=O(n^m)$。

> 忽略所有低次幂项和最高次幂系数，体现出增长率的含义

#### 语句频度推导

* 频度：精确执行次数 $\frac{n(n+1)(n+2)}{6}$    
* 时间复杂度：只看最高次 $O(n^3)$

$$
\begin{align*}
\text{语句频度} &= \sum_{i=1}^{n}\sum_{j=1}^{i}\sum_{k=1}^{j}1 \\
&=\sum_{i=1}^{n}\sum_{j=1}^{i}j \\
&=\sum_{i=1}^{n}\frac{i(i+1)}{2}\\
&=\frac12\left(\sum_{i=1}^{n}i^2+\sum_{i=1}^{n}i\right)\\
&=\frac12\left(\frac{n(n+1)(2n+1)}{6}+\frac{n(n+1)}{2}\right)\\
&=\frac{n(n+1)(n+2)}{6}
\end{align*}
$$

#### 时间复杂度T(n)按数量级递增顺序

$$O(1) < O(\log n) < O(n) < O(n\log n) < O(n^2) < O(n^3) < \dots < O(2^n) < O(n!)$$
