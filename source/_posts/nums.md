---
title: "普通数组"
date: 2026-08-05
updated: 2026-08-06
categories:
  - "算法"
tags:
  - "算法"
  - "普通数组"
  - "hot100"
description: "力扣hot100"
cover: /images/covers/cover-35652460.webp
---
# 普通数组


## 最大子数组和（53）


```text
public int maxSubArray(int[] nums) {
        int ans = Integer.MIN_VALUE;
        int t = 0 ;
        for(int i = 0 ; i < nums.length ;i++){
            if(t < 0 ) t = 0 ;
            if(i == 0 ){
                t = nums[i] ;

            }else{
                t += nums[i];
            }

            if(t > ans ) ans = t ;

        }

        return ans ;
    }
```


```text
class Solution {
    public int maxSubArray(int[] nums) {
         int pre = 0 , ans = Integer.MIN_VALUE ;
         int len = nums.length;
         for(int i = 0 ;i < len ; i ++){
            pre += nums[i];
            if(ans < pre) ans = pre;
            if(pre < 0 ) pre = 0 ;
         }

         return ans ;
    }
}
```


我的想法很朴素，首先最大的值可能是负数的，所以这里的ans 最开始不能赋值为0。


当pre = 负数的时候，后面就不需要带上这个累赘了，但在这之前需要确认这个负数是不是当前能得到的最好的结果。


这里引用一下力扣大佬的名言：


走完这一生


如果我和你在一起会变得更好，那我们就在一起，否则我就丢下你。


我回顾我最光辉的时刻就是和不同人在一起，变得更好的最长连续时刻


### dp解法


```text
class Solution {
    public int maxSubArray(int[] nums) {
        int pre = 0 , maxAns = nums[0];
        for(int i = 0 ; i < nums.length ;i++){
            pre = Math.max(pre + nums[i] , nums[i]);
            maxAns = Math.max(maxAns , pre);

        }

        return maxAns ;
    }
}
```


### 分治方法(未实现)


## 56 合并区间 不是我之前代码写的这么漂亮？


```text
public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals , (a , b) -> Integer.compare(a[0] , b[0]));

        List<int[]> ans = new LinkedList<>();
        int pre_1 = intervals[0][0];
        int pre_2 = intervals[0][1];

        for(int i = 1 ;i < intervals.length ; i++){
            if(intervals[i][1] <= pre_2){
                pre_2 = Math.max(pre_2 , intervals[i][1]);
            }else{
                ans.add(new int[] {pre_1 , pre_2});
                pre_1 = intervals[i][0];
                pre_2 =intervals[i][1];
            }
        }

        ans.add(new int[] {pre_1 , pre_2});
        return ans.toArray(new int[ans.size()][]);
    }
```


## 189 轮转数组


一个很好的思路是将轮转 变成 翻转 。


```text
/*
 * @lc app=leetcode.cn id=189 lang=java
 * @lcpr version=30204
 *
 * [189] 轮转数组
 */

// @lcpr-template-start

// @lcpr-template-end
// @lc code=start
class Solution {
    public void rotate(int[] nums, int k) {
        k = k % nums.length;

        done(nums , 0 , nums.length - 1);
        done(nums , 0 , k -1 );
        done(nums , k   , nums.length - 1);
    }

    public void done(int[] nums , int l , int r){
        int left = l ;
        int right = r;
        while(left < right){
            int t = nums[left];
            nums[left] = nums[right];
            nums[right]= t ;

            left ++;
            right --;
        }
    }
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,4,5,6,7]\n3\n
// @lcpr case=end

// @lcpr case=start
// [-1,-100,3,99]\n2\n
// @lcpr case=end

 */
```


两个点，一个要先将k取余一下，一个是l ++ r -- ;


这题目还有一个比较巧妙的解决方法，环状替换，将被替换的元素保存在变量 _temp_ 中，从而避免了额外数组的开销。这里留个坑了，以后真遇到了再看


## 238 除了自身以外数组的乘积 太巧妙了吧


```text
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int len = nums.length;

        int [] ans = new int[len];
        ans[0] = 1;
        for(int i = 1 ;i < len ;i++){
            ans[i] = ans[i-1]*nums[i-1];
        }

        int R = 1;
        for(int i = len - 1 ;i >= 0 ;i--){
            ans[i] = ans[i]*R;
            R *= nums[i];
        }

        return ans;
    }
}
```


我的理解还是有点问题，这里的ans[i] 最开始 代表 i 左边的乘积和


R 来短暂记录右边的数值 很有编程技巧


```text
public int[] productExceptSelf(int[] nums) {
        int Lsum[] = new int[nums.length];
        int Rsum[] = new int[nums.length];

        Lsum[0] = 1;
        for(int i = 1 ;i < nums.length ;i++){
            Lsum[i] = Lsum[i - 1] * nums[i-1];
        }

        Rsum[nums.length - 1] =1;
        for(int i = nums.length - 2 ; i>=0 ;i --){
            Rsum[i] = Rsum[i + 1] * nums[i + 1];
        }

        int ans[] = new int[nums.length];
        for(int i = 0 ;i < nums.length;i++){
            ans[i] = Lsum[i] * Rsum[i];
        }

        return ans;
    }
```


## 41 缺失的第一个正整数 牛逼的代码


```text
class Solution {
    public int firstMissingPositive(int[] nums) {
        int len = nums.length;
        for(int i = 0 ;i < len ;i++){
            while(nums[i] > 0 && nums[i] <= len && nums[nums[i] - 1] != nums[i]  ){
                int t = nums[nums[i] - 1];
                nums[nums[i] - 1] = nums[i];
                nums[i] = temp;
            }
        }

        for(int i = 0 ;i < n ;i++){
            if(nums[i] != i - 1){
                return i + 1;
            }
        }

        return n + 1 ;
    }
}
```


```javascript
class Solution {
    public int firstMissingPositive(int[] nums) {
        int len = nums.length;

        for(int i = 0 ;i < len ; i ++ ){
            while(nums[i] >=1  && nums[i] <= len && nums[ nums[i] - 1] != nums[i]){
                int tmp = nums[i];
                nums[i] = nums[nums[i] - 1];
                nums[nums[i] - 1] = tmp;
            }
        }

        for(int i = 0 ; i < len ;i++){
            if( nums[i] >=1 && nums[i] <= len &&   nums[i] != nums[nums[i] - 1]){
                return i + 1 ;
            }
        }
        return len + 1;

    }
}
```


以上是我写的经典错误代码


这是我在略微有点小困的状态下写的代码，似乎错误有点多， 首先是这个tmp交换，后面这个nums[i]被换了， 那这个nums[nums[i] - 1 ] = tmp就会出错了， 这里就是后面的nums[i]都要换成tmp才可以


其次这里的后面的这个if条件判断 ， if(nums[i] != i + 1 ) 这样写才对 ，nums[i] >=1 && nums[i] <= len && 这个不能加 不满足这个条件正好说明可能找到这个正确的答案了，但这里确实退出循环了。


if(nums[i] < 1 || nums[i] > len   ){


return i + 1 ;


} 这个条件判断有也是错误的，因为会出现两个相同的情况出现，比如[1 , 1] 所以这里只能判断nums[i] != i + 1


nums[i] != nums[nums[i] - 1] :当前这个数字，在它应该去的位置上，是否已经存在一个相同的数字？


而最终遍历需要检查： 当前这个位置上，是否放着它应该放的数字？


第一轮是“拿着数字找座位”，第二轮是“站在座位前检查乘客”。这就是两种判断不能混用的原因。


这两种循环逻辑是不一样的。


这种方法的解决思路是 既然期望的是一个从 1 到 n - 1的排序那就进行排序 比如 1 如果在 就应该呆在 nums[0]的位置上，一直通过交换的讨论排列数组，


```text
class Solution {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; ++i) {
            if (nums[i] <= 0) {
                nums[i] = n + 1;
            }
        }
        for (int i = 0; i < n; ++i) {
            int num = Math.abs(nums[i]);
            if (num <= n) {
                nums[num - 1] = -Math.abs(nums[num - 1]);
            }
        }
        for (int i = 0; i < n; ++i) {
            if (nums[i] > 0) {
                return i + 1;
            }
        }
        return n + 1;
    }
}

作者：力扣官方题解
链接：https://leetcode.cn/problems/first-missing-positive/solutions/304743/que-shi-de-di-yi-ge-zheng-shu-by-leetcode-solution/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```


对于这道题目，需要先发现这一点，n 个长度的数组，若是包含从1 到 n - 1的数 那答案必定是 n ,负责答案都是在1 到 n - 1之间的。


我们的目标变成了如何快速找到 1 到 n-1这几个数是不是在当前数组当中


有一个可以快速找到的方法就是直接下标表示，通过对nums[i] 的值打标记来表示i是不是在这个数组当中


这里统一给它变成一个很大的负数 -(n)；


因为不能直接改成一个统一的负数，因为后面还要遍历这个数据这里改成其绝对值的负数形式


这里就是用负数来代表这个下标是出现过的


很有意思的一个解决方法


本质上这是用数组对应的下标来标记这个值是不是存在
