---
title: "Hello World@@@"
date: 2026-04-09
updated: 2026-04-10
categories:
  - "随笔"
tags:
  - "随笔"
description: "欢迎来到我的博客，这里将记录我的学习历程"
cover: /images/covers/cover-photo-1499750310107-5fef28a66643.webp
---
# Hello world


你好，世界！！！


```javascript
class Solution {
    public int findKthLargest(int[] nums, int k) {
        int n = nums.length;

        for (int i = n / 2 - 1; i >= 0; i--) {
            down(nums, i, n);
        }

        int count = k;
        count--;
        while (count > 0) {
            swap(nums, n - 1, 0);
            n--;
            down(nums, 0, n);

            count--;
        }
        return nums[0];

    }

    private void down(int[] nums, int index, int len) {
        int l = index * 2 + 1, r = index * 2 + 2;
        int large = index;
        if (l < len && nums[l] > nums[large]) {
            large = l;
        }

        if (r < len && nums[r] > nums[large]) {
            large = r;
        }

        if (large != index) {
            swap(nums, index, large);
            down(nums, large, len);
        }
    }

    private void swap(int[] nums, int i, int large) {
        int tmp = nums[i];
        nums[i] = nums[large];
        nums[large] = tmp;
    }
}
```


这是力扣 hot 100  **215 数组中的第K个最大元素 ，将数组模拟成一个最大堆。**


## 代码详细解释


### 题目目标


给定整数数组 `nums` 和整数 `k`，返回数组中**第 k 大**的元素。


这份实现使用**最大堆（Max-Heap）**来做：

- 先把整个数组原地建成最大堆（堆顶是当前最大值）。
- 然后执行 `k-1` 次“弹出堆顶”的操作。
- 最后堆顶元素就是第 k 大。

---


### 核心思路：数组表示堆


把数组当作完全二叉树：

- 下标为 `i` 的节点：
    - 左子节点：`l = 2*i + 1`
    - 右子节点：`r = 2*i + 2`
- **最大堆性质**：任意节点的值都 ≥ 它的两个子节点。

---


### 1）`findKthLargest` 主流程


```java
public int findKthLargest(int[] nums, int k) {
    int n = nums.length;

    // ① 建堆：把 nums 原地调整成最大堆
    for (int i = n / 2 - 1; i >= 0; i--) {
        down(nums, i, n);
    }

    // ② 弹出最大值 k-1 次
    int count = k;
    count--;
    while (count > 0) {
        // 把堆顶（最大值）换到数组末尾，相当于“移除”堆顶
        swap(nums, n - 1, 0);

        // 堆的有效长度减 1（末尾元素已经是确定的最大值之一，不再参与堆）
        n--;

        // 新的堆顶可能不满足堆性质，下沉修复
        down(nums, 0, n);

        count--;
    }

    // ③ 经过 k-1 次弹出后，堆顶就是第 k 大
    return nums[0];
}
```


为什么只需要弹出 `k-1` 次？

- 第 1 大是第一次堆顶。
- 弹出 1 次后，新的堆顶是第 2 大。
- ……
- 弹出 `k-1` 次后，堆顶就是第 k 大。

---


### 2）`down(nums, index, len)`：下沉（heapify）


```java
private void down(int[] nums, int index, int len) {
    int l = index * 2 + 1, r = index * 2 + 2;
    int large = index;

    if (l < len && nums[l] > nums[large]) {
        large = l;
    }
    if (r < len && nums[r] > nums[large]) {
        large = r;
    }

    if (large != index) {
        swap(nums, index, large);
        down(nums, large, len);
    }
}
```


这段在做什么？


对 `index` 这个位置，假设它的左右子树已经各自是最大堆，通过“下沉”把 `index` 调整到正确位置，使得以 `index` 为根的子树重新满足最大堆性质。


具体步骤：

1. 计算左右子节点下标 `l`、`r`。
2. 找出 `index`、`l`、`r` 三者中值最大的下标，记为 `large`。
3. 如果最大值不在 `index`，就交换 `index` 和 `large`。
4. 交换后，原来 `index` 的值被换到了子节点位置，可能继续破坏堆性质，所以对 `large` 位置继续递归下沉。

为什么 `len` 必须传进来？


因为每次“弹出堆顶”后，堆的有效范围会缩小：`[0, len-1]` 才是堆，`len` 之后的元素已经“出堆”，不能参与比较。


---


### 3）`swap`：交换数组两个位置


```java
private void swap(int[] nums, int i, int large) {
    int tmp = nums[i];
    nums[i] = nums[large];
    nums[large] = tmp;
}
```


---


### 4）建堆为什么从 `n/2 - 1` 开始？


在数组表示的完全二叉树中：

- 下标 `n/2` 到 `n-1` 的节点都是叶子节点（没有子节点）。
- 叶子节点天然满足堆性质，不需要调整。
- 所以从**最后一个非叶子节点** `n/2 - 1` 反向做 `down`，才能保证子树先成为堆，再把父节点调整好。

---


### 5）复杂度分析

- 建堆：`O(n)`
- 弹出堆顶 `k-1` 次：每次 `down` 是 `O(log n)`，共 `O(k log n)`
- 总体：`O(n + k log n)`
- 额外空间：`O(1)`（原地调整，递归带来 `O(log n)` 的调用栈开销；如果改成迭代可做到严格 `O(1)` 栈空间）

---


### 6）一个小例子帮助理解（直观）


假设 `nums = [3,2,1,5,6,4]`，`k=2`

1. 建成最大堆后，堆顶是 `6`
2. 弹出一次（把 `6` 放到末尾并缩小堆），重新下沉后堆顶变为 `5`
3. 返回堆顶 `5`，即第 2 大

![image.png](/images/posts/helloworld123/428f4b9302fd.png)


很有意思的一道题目；


347 前k个高频元素


```javascript
public int[] topKFrequent(int[] nums, int k) {
        Map<Integer , Integer> hm = new HashMap<Integer , Integer>();
        for(int i = 0 ;i < nusm.length ;i++){
            hm.put(nums[i] , hm.getOrDefault(nums[i] , 0 ) + 1 );
        }

        PriorityQueue<int[]> pq = new PriorityQueue<>((pair1 , pair2) -> pair2[1] - pair1[1]);
        for(Map.Entry<Integer ,Integer > entry : hm.entrySet()){
            pq.add(new int[]{entry.getKey()  , entry.getValue()});
        }

        int[] ans = new int[k];
        for(int i = 0 ; i < k ;i++){
           ans[i] = pq.poll()[0];
        }

        return ans;
    }
```


```javascript
import java.util.PriorityQueue;

class MedianFinder {

    PriorityQueue<Integer> queMin;
    PriorityQueue<Integer> queMax;

    public MedianFinder() {
        queMin = new PriorityQueue<Integer>((a, b) -> (b - a));
        queMax = new PriorityQueue<Integer>((a, b) -> (a - b));
    }

    public void addNum(int num) {
        if (queMin.isEmpty() || num <= queMin.peek()) {
            queMin.offer(num);
            if (queMax.size() + 1 < queMin.size()) {
                queMax.offer(queMin.poll());
            }
        } else {
            queMax.offer(num);
            if (queMax.size() > queMin.size()) {
                queMin.offer(queMax.poll());
            }
        }
    }

    public double findMedian() {
        if (queMin.size() > queMax.size()) {
            return queMin.peek();
        }

        return (queMin.peek() + queMax.peek()) / 2.0;
    }
}

/**
 * Your MedianFinder object will be instantiated and called as such:
 * MedianFinder obj = new MedianFinder();
 * obj.addNum(num);
 * double param_2 = obj.findMedian();
 */
```


## 295 数据流的中位数


```javascript
class MedianFinder {
    
    PriorityQueue<Integer> queMin;
    PriorityQueue<Integer> queMax;
    public MedianFinder() {
        queMin = new PriorityQueue<Integer>((a , b) -> (b - a));
        queMax = new PriorityQueue<Integer>((a , b) -> (a - b));
    }
    
    public void addNum(int num) {
        if(queMin.isEmpty() || num <= queMin.peek()){
            queMin.offer(num);
            if(queMax.size() + 1 < queMin.size()){
                queMax.offer(queMin.poll());
            }
        }else{
            queMax.offer(num);
            if(queMax.size() > queMin.size()){
                queMin.offer(queMax.poll());
            }
        }
    }
    
    public double findMedian() {
        if(queMin.size() > queMax.size()){
            return queMin.peek();
        }
        return (queMin.peek() + queMax.peek()) / 2.0;
    }
}
```


关于  （a  ,  b ） →  ( b - a )  a 是放在后面的 ，什么时候放在后面，当b - a > 0 的时候 ，所以小的在 后面， 这是一个大顶堆


同理    ( a   ,  b )   → (a - b )   这是小顶堆
