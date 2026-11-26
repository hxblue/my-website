---
title: 'Java 并发中的 CAS：比较并交换'
date: '2026-11-26 12:00:00'
updated: '2026-11-26 12:00:00'
categories:
  - 后端
tags:
  - Java
  - 并发
  - CAS
description: '用两个线程同时更新计数器的例子理解 CAS，并对比 synchronized 的适用场景。'
cover: /images/covers/cover-12224794.webp
feishu_document_id: ZhFMdKZkRoUk5IxG41gcA7XJnIf
feishu_source: https://qcn7qkoanip2.feishu.cn/wiki/ZfpFwkagAiDJbzkwd09cgtAtnuh
feishu_revision: 88
---

两个线程都读到计数器是 `10`，都想把它加一。如果各自直接写入 `11`，其中一次更新就丢了。CAS（Compare and Swap，比较并交换）让线程只在当前值仍符合预期时写入。

## CAS 比较什么？

| 参数 | 含义 |
| --- | --- |
| `V`（Value） | 内存中的当前值 |
| `A`（Expected） | 预期的旧值，通常是线程先前读到的值 |
| `B`（New Value） | 想写入的新值 |

如果 `V == A`，CAS 将当前值更新为 `B` 并返回 `true`。如果两者不相等，CAS 保留当前值并返回 `false`。比较和条件写入是一个不可分割的原子操作。

![CAS 比较当前值和预期值。相等时写入新值并返回 true，不相等时保留当前值并返回 false。](/images/posts/java-cas/cas-decision.webp)

*图 1 · CAS 在一次原子操作中完成比较与条件写入。*

## 两个线程并发加一

![两个线程先读到 10。线程 A 把 10 改为 11，线程 B 首次 CAS 失败，读到 11 后重试并改为 12。](/images/posts/java-cas/cas-retry.webp)

*图 2 · 线程 B 的预期值已经过时。重新读取后，它完成第二次加一。*

1. 线程 A 和线程 B 都读到 `10`。
2. 线程 A 执行 `compareAndSet(10, 11)` 并成功，当前值变为 `11`。
3. 线程 B 仍以 `10` 为预期值。它的第一次尝试失败，当前值保持 `11`。
4. 线程 B 重新读取 `11`，计算出新值 `12` 并再次尝试，更新成功。

这次加一由调用方重试完成。一次 CAS 只返回本次更新是否成功。

## 何时用 CAS，何时加锁？

| 机制 | 工作方式与适用场景 |
| --- | --- |
| CAS | 乐观地尝试更新。比较当前值后条件写入，调用方可以在失败后重试。适合计数器等简单共享状态更新，无需为单次 CAS 显式加锁。 |
| `synchronized` | 获取锁后进入临界区，竞争时线程可能等待同一把锁释放。适合需要把多项操作作为一个整体执行的场景。 |

## CAS 的局限

- **ABA 问题。** 如果一个值从 `A` 变成 `B`，又变回 `A`，仅比较当前值的 CAS 无法察觉中间变化。需要识别这类变化时，可以用 `AtomicStampedReference` 同时比较引用与版本戳。
- **重试成本。** 在竞争激烈时，循环重试会消耗 CPU。
- **更新范围。** 一次 CAS 针对一个内存位置。多个独立变量需要共同更新时，要用能保护整组状态的方案。

## 面试时怎么回答？

> CAS 是一种原子的比较并交换操作。当前值等于预期值时，它写入新值并返回成功，否则保留当前值并返回失败。Java 的 `AtomicInteger` 提供了 `compareAndSet`。竞争时调用方可以重新读取并重试，使用时要考虑 ABA、重试开销和操作范围。
