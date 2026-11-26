---
title: "字串"
date: 2026-08-03
updated: 2026-08-03
categories:
  - "算法"
tags:
  - "算法"
  - "滑动窗口"
  - "hot100"
description: "hot100 滑动窗口题解"
cover: /images/covers/cover-12224794.webp
---
# 字串


## [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)


做这道题目的时候不知该如何获取子数组，如何获取连续的子数组呢？


```text
public class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0;
        for (int start = 0; start < nums.length; ++start) {
            int sum = 0;
            for (int end = start; end >= 0; --end) {
                sum += nums[end];
                if (sum == k) {
                    count++;
                }
            }
        }
        return count;
    }
}
```


以i为字串的end 挨个便利前面的数累加，看看有没有满足题意的值


```text
int len = nums.length;
         int ans = 0;
         for(int i= 0 ;i < len ;i++){
            int sum = 0 ;
            for(int j = i ;j < len ;j ++){
              sum+= nums[j];
              if(sum == k ) {
                 ans ++;
              }
            }
         }
         return ans ;
```


### 前缀和


```text
class Solution {
    public int subarraySum(int[] nums, int k) {
         int len = nums.length;
         int ans = 0 ;
         int preSum[] = new int [len ]  ;
         for(int i = 0 ;i < len ;i++){
            if(i == 0 ) preSum[i]  = nums[i];
            else{
              preSum[i] = preSum[i-1] + nums[i];
            }
         }

         for(int i  = 0 ;i < len ; i++){
           for(int j = i ;j < len ;j++){
               if(i == 0 ){
                  if(preSum[j] == k ) ans++;
               } else {
                  if(preSum[j] - preSum[i - 1] == k ) ans++;
               }
           }
         }

         return ans;
    }

}
```


注意边界，当这个i  == 0 的时候要特殊处理，还有就是遍历这个全部子数组的条件就是要包含这个i == j 的，这里的这个j 就是要从中这个  i 开始遍历。


### 前缀和加哈希表优化


```text
public int subarraySum(int[] nums, int k) {
           int count = 0 , pre = 0 ;
           Map<Integer, Integer> hasmap = new HashMap<Integer,Integer>();
           hasmap.put(0 , 1);

           for(int i = 0 ;i <nums.length ;i++){
              pre += nums[i];

              if(hasmap.containsKey(pre - k )){
                count += hasmap.get(pre - k );
              }

              hasmap.put(  pre  , hasmap.getOrDefault(pre  , 0 ) + 1 );
           }
           return count ;
    }
```


![前缀和之差等于目标值的手绘示意图](/images/posts/windows/01.png)


这个方法太权威了， 有点细节


这里没必要想的这么复杂 ， 遍历到Pre 的时候， 只要前面存在 pre - k的前缀和 那就是有一个 和为K 的连续数组出现了。这里只要能快速找到前面有几个前缀和为 K 的连续子数组就行了


## 239 滑动窗口最大值 究极遗忘


```text
class MyQueue {
    Deque<Integer> deque = new LinkedList<Integer>();

    void poll(int val ){
        if(!deque.isEmpty() && val == deque.peek()){
            deque.poll();
        }
    }

    void add(int val){
        while(!deque.isEmpty() && val > deque.getLast()){
            deque.removeLast();
        }
        deque.add(val);
    }

    int peek(){
        return deque.peek();
    }
}

class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        if(nums.length == 1 ) return nums;

        int len = nums.length - k + 1 ;
        int[] res = new int[len];
        int num = 0 ;

        MyQueue myQueue = new MyQueue();
        for(int i = 0 ;i < k ;i++){
            myQueue.add(nums[i]);
        }
        res[num] = myQueue.peek();
        num++;

        for(int i = k ;i < nums.length ;i++){
            myQueue.poll(nums[ i - k ]);

            myQueue.add(nums[i]);

            res[num] = myQueue.peek();
            num++;
        }

        return res;
    }
}
```


这种写法很考验代码功底啊


### 优先队列


```text
/*
 * @lc app=leetcode.cn id=239 lang=java
 * @lcpr version=30204
 *
 * [239] 滑动窗口最大值
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start

class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
          int n  = nums.length ;
          PriorityQueue<int [] > pq = new PriorityQueue<int[]>(new Comparator<int[]>(){
             public int compare(int[] pair1 , int [] pair2){
                 return pair1[0] != pair2[0] ? pair2[0] - pair1[0] : pair2[1] - pair1[1];
             }
          });

          for(int i = 0 ;i < k ;i++){
            pq.offer(new int[]{nums[i] , i });
          }

          int[] ans = new int[n - k + 1];
          ans[0] = pq.peek()[0];

          for(int i = k ;i < n ;i++){
            pq.offer(new int[]{nums[i] , i });
            while(pq.peek()[1] <= i - k ){
                pq.poll();
            }
            ans[i - k + 1 ] = pq.peek()[0];
          }

          return ans ;
    }
}
// @lc code=end

/*
// @lcpr case=start
// [1,3,-1,-3,5,3,6,7]\n3\n
// @lcpr case=end

// @lcpr case=start
// [1]\n1\n
// @lcpr case=end

 */
```


```text
int len = nums.length;
         PriorityQueue<int[] > pq = new PriorityQueue<int []>(
            (a , b) -> (
                 a[0] != b[0 ] ?
                 b[0] - a[0] :
                 b[1] - a[1]
           )
         );

         int[] ans = new int[len - k + 1];
         for(int i = 0 ;i < k ;  i ++){
             pq.add(new int[]{nums[i] , i });
         }
         ans[0] = pq.peek()[0];
         for(int i = k ;i < len ;i++){

            pq.add(new int[]{nums[i] , i});
            // 这里好像需要遍历排除掉这个不在这个窗口范围内的 , 破局点在于不需要一直遍历 ， 只需要确定当前最大值是不是在这个窗口就行了，妙
            while(pq.peek()[1] <= i - k ){
               pq.poll();
            }
            ans[i - k + 1] = pq.peek()[0];

         }

         return ans;
```


这里用了lambda表达式简化了一下开发


### 单调队列


```text
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
          int n = nums.length ;

          Deque<Integer> deque = new LinkedList<Integer>();
          for(int i = 0 ;i < k ;i ++){
              while(!deque.isEmpty() && nums[i] >= nums[deque.peekLast()]){
                deque.pollLast();
              }
              deque.offerLast(i);
          }

          int[] ans = new int[n - k + 1];
          ans[0] = nums[deque.peekFirst()];
          for(int i = k ; i < n ;i++){
            while(!deque.isEmpty() &&  nums[i] >= nums[deque.peekLast()]){
                deque.pollLast();
            }

            deque.offerLast(i);
            while(deque.peekFirst() <= i - k ){
                deque.pollFirst();
            }
            ans[i - k + 1] = nums[deque.peekFirst()];
          }
          return ans;
    }
}
```


好奇怪的写法，为什么一定要存储这个下标呢，不能直接存储值吗；


失败，直接存值，会导致在这里无法很好的判断下标具体问题，存下标可以解决这个问题


没毛病，上面说的不错，存下标是优解。


```text
int len = nums.length;
          Deque<Integer> de = new LinkedList<>();
          int[] ans = new int[len - k + 1];
          for(int i = 0 ;i < k ;i++){
             while(!de.isEmpty() && nums[i] >= nums[de.peekLast()] ){
                 de.pollLast();
             }
             de.offerLast(i);
          }
          ans[0] = nums[de.peekFirst()];

          for(int i = 1 ;i < len - k + 1;i++){
               while(!de.isEmpty() && nums[i + k - 1] >= nums[de.peekLast()]){
                  de.pollLast();
               }

               de.offerLast(i + k - 1 );
               while(!de.isEmpty() && de.peekFirst() < i ){
                  de.pollFirst();
               }
               ans[i] =nums[de.peekFirst() ];
          }

          return ans;
```


### 分块加预处理（未实现）后续再学习，先把前面三种写法实现


## 76.最小覆盖字串 还需要多加练习


![最小覆盖字串的题目及示例](/images/posts/windows/02.png)


```text
/*
 * @lc app=leetcode.cn id=76 lang=java
 *
 * [76] 最小覆盖子串
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start

import java.util.HashMap;
import java.util.Map;

class Solution {
    HashMap<Character , Integer > s_Map  = new HashMap<Character , Integer>();
    HashMap<Character , Integer > t_Map  = new HashMap<Character , Integer>();

    public String minWindow(String s, String t) {
        for(int i = 0 ; i < t.length() ;i++){
             t_Map.put(t.charAt(i) , t_Map.getOrDefault(t.charAt(i) , 0 ) + 1);
        }

        int ansL = -1 , ansR = -1 ;
        int ansLen = Integer.MAX_VALUE ;

        int left = 0 ;
        for(int right = 0 ; right < s.length() ;right++){

            if (t_Map.containsKey(s.charAt(right))) {
                s_Map.put(s.charAt(right), s_Map.getOrDefault(s.charAt(right), 0) + 1);
            }


            while(check() && left <= right){

                if(ansLen > right - left + 1){
                    ansLen = right - left + 1;
                    ansL = left;
                    ansR = right;
                }

                if(t_Map.containsKey(s.charAt(left)))
                  s_Map.put(s.charAt(left) , s_Map.getOrDefault(s.charAt(left) , 0 ) - 1);

                left++;

            }
        }

        return ansL == -1 ? "" : s.substring(ansL , ansR + 1);

    }

    public boolean check(){
         for(Map.Entry<Character , Integer> entry : t_Map.entrySet()){
            if(s_Map.getOrDefault(entry.getKey() , 0 ) < entry.getValue()){
                return false;
            }
         }

         return true;
    }

}
// @lc code=end
```


很有意思的解决方法


那是不是存在O（m + n ）以内解决的方法呢？


一个可预见的优化思路是 不要每次都 从头到尾 check 一遍。完全就可以只记录变化


**不要每次重新检查所有字符，而是用一个变量实时记录已经满足要求的字符种类数。**


```text
HashMap<Character , Integer > s_Map =  new HashMap<>();
        HashMap<Character , Integer > t_Map = new HashMap<>() ;

        for(int i = 0 ;i < t.length() ;i++){
            t_Map.put(t.charAt(i), t_Map.getOrDefault(t.charAt(i), 0 ) + 1);
        }
        int need = t_Map.size();
        int ansLen = Integer.MAX_VALUE;
        int ansL = -1 ;
        int asnR = -1 ;

        int count = 0 ;

        int left = 0 , right = 0 ;
        for( ; right < s.length() ;right++){
             if(t_Map.containsKey(s.charAt(right))){
                s_Map.put(s.charAt(right), s_Map.getOrDefault(s.charAt(right), 0 ) + 1);

                int first = s_Map.get(s.charAt(right)) ;
                int second = t_Map.get(s.charAt(right));
                if(  first == second   ){
                count++;
               }
             }

             while(count == need && left <= right ){
                 if(ansLen > right - left + 1){
                     ansLen = right - left + 1;
                     ansL = left;
                     asnR = right;
                 }

                 char leftchar = s.charAt(left);

                 if(t_Map.containsKey(leftchar)){

                     int oldCount = s_Map.get(leftchar);
                     if(oldCount == t_Map.get(leftchar)){
                        count--;
                     }

                     s_Map.put( leftchar    , oldCount - 1);
                 }

                 left++;
             }
        }

        return ansL == -1  ? "" : s.substring(ansL , asnR + 1);
```


好多坑 ， 先是这个count的修改时机我判断错误， 应该是刚好当前这个单词的数量个数等于这个对应的个数，这个时候left右移动才会造成这个count变化。


还有就是这个  Integer类型 的比较开始我直接 两个 getvalue 用 == 等号进行比较 ，这是错误的。这种好像就是在小样本中不会出现问题，但是到了大样本后就会出错。


```text
if (s_Map.get(s.charAt(right)) == t_Map.get(s.charAt(right))) {
    count++;
}
```


这是比较两个 Integer 对象，对于包装类型 == 比较的是是否指向内存的同一个对象，而小样本之所以没有出现问题：Java 为了节省内存，会提前创建并缓存一部分常用的 `Integer` 对象。Java 至少保证缓存：-128 到 127


在这个范围下都是指向同一个对象的，所以不会报错
