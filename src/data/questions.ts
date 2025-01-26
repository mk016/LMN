import { CodingChallenge } from '@/types';

export type { CodingChallenge };

const CODING_CHALLENGES: CodingChallenge[] = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.",
    examples: [{
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]"
    }],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Write your code here
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "[2,7,11,15], 9",
        output: "[0,1]"
      },
      {
        input: "[3,2,4], 6",
        output: "[1,2]"
      }
    ]
  },
  {
    title: "Palindrome Check",
    description: "Write a function to check whether a given string is a palindrome.",
    examples: [{
      input: "str = 'racecar'",
      output: "true",
      explanation: "'racecar' reads the same backward as forward."
    }],
    starterCode: {
      javascript: `function isPalindrome(str) {
    // Write your code here
}`,
      python: `def is_palindrome(str):
    # Write your code here
    pass`,
      typescript: `function isPalindrome(str: string): boolean {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "'racecar'",
        output: "true"
      },
      {
        input: "'hello'",
        output: "false"
      }
    ]
  },
  {
    title: "Reverse Integer",
    description: "Given an integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, return 0.",
    examples: [{
      input: "x = 123",
      output: "321",
      explanation: "Reverse the digits of 123 to get 321."
    }],
    starterCode: {
      javascript: `function reverseInteger(x) {
    // Write your code here
}`,
      python: `def reverse_integer(x):
    # Write your code here
    pass`,
      typescript: `function reverseInteger(x: number): number {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "123",
        output: "321"
      },
      {
        input: "-123",
        output: "-321"
      }
    ]
  },
  {
    title: "Fibonacci Sequence",
    description: "Write a function to return the n-th Fibonacci number.",
    examples: [{
      input: "n = 5",
      output: "5",
      explanation: "The 5th Fibonacci number is 5."
    }],
    starterCode: {
      javascript: `function fibonacci(n) {
    // Write your code here
}`,
      python: `def fibonacci(n):
    # Write your code here
    pass`,
      typescript: `function fibonacci(n: number): number {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "5",
        output: "5"
      },
      {
        input: "10",
        output: "55"
      }
    ]
  },
  {
    title: "Factorial",
    description: "Write a function to calculate the factorial of a given number n.",
    examples: [{
      input: "n = 4",
      output: "24",
      explanation: "4! = 4 * 3 * 2 * 1 = 24."
    }],
    starterCode: {
      javascript: `function factorial(n) {
    // Write your code here
}`,
      python: `def factorial(n):
    # Write your code here
    pass`,
      typescript: `function factorial(n: number): number {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "4",
        output: "24"
      },
      {
        input: "6",
        output: "720"
      }
    ]
  },
  {
    title: "Longest Common Prefix",
    description: "Write a function to find the longest common prefix string amongst an array of strings.",
    examples: [{
      input: "strs = ['flower', 'flow', 'flight']",
      output: "'fl'",
      explanation: "The longest common prefix is 'fl'."
    }],
    starterCode: {
      javascript: `function longestCommonPrefix(strs) {
    // Write your code here
}`,
      python: `def longest_common_prefix(strs):
    # Write your code here
    pass`,
      typescript: `function longestCommonPrefix(strs: string[]): string {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "['flower', 'flow', 'flight']",
        output: "'fl'"
      },
      {
        input: "['dog', 'racecar', 'car']",
        output: "''"
      }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [{
      input: "s = '()'",
      output: "true",
      explanation: "'()' is valid."
    }],
    starterCode: {
      javascript: `function isValid(s) {
    // Write your code here
}`,
      python: `def is_valid(s):
    # Write your code here
    pass`,
      typescript: `function isValid(s: string): boolean {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "'()'",
        output: "true"
      },
      {
        input: "'(]'",
        output: "false"
      }
    ]
  },
  {
    title: "Merge Sorted Arrays",
    description: "Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 as one sorted array.",
    examples: [{
      input: "nums1 = [1,2,3,0,0,0], nums2 = [2,5,6]",
      output: "[1,2,2,3,5,6]",
      explanation: "The arrays are merged into [1,2,2,3,5,6]."
    }],
    starterCode: {
      javascript: `function merge(nums1, m, nums2, n) {
    // Write your code here
}`,
      python: `def merge(nums1, m, nums2, n):
    # Write your code here
    pass`,
      typescript: `function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "[1,2,3,0,0,0], 3, [2,5,6], 3",
        output: "[1,2,2,3,5,6]"
      },
      {
        input: "[1], 1, [], 0",
        output: "[1]"
      }
    ]
  },
  {
    title: "Remove Duplicates",
    description: "Given a sorted array nums, remove the duplicates in-place such that each element appears only once and return the new length.",
    examples: [{
      input: "nums = [1,1,2]",
      output: "2",
      explanation: "Your function should modify nums in-place to [1,2]."
    }],
    starterCode: {
      javascript: `function removeDuplicates(nums) {
    // Write your code here
}`,
      python: `def remove_duplicates(nums):
    # Write your code here
    pass`,
      typescript: `function removeDuplicates(nums: number[]): number {
    // Write your code here
}`
    },
    testCases: [
      {
        input: "[1,1,2]",
        output: "2"
      },
      {
        input: "[0,0,1,1,1,2,2,3,3,4]",
        output: "5"
      }
    ]
  }
];

export function getChallengeForRoom(roomId: string): CodingChallenge {
  const hash = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % CODING_CHALLENGES.length;
  return CODING_CHALLENGES[index];
}

export default CODING_CHALLENGES;
