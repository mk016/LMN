'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PlayCircle, Send, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { GeminiService } from '@/services/geminiService';
import { toast } from 'react-hot-toast';

interface CodingEnvironmentProps {
  playerNumber: number;
  playerName: string;
  startTime: number | null;
  onSubmit: (code: string, timeElapsed: number, isCorrect: boolean) => void;
}

const SAMPLE_QUESTION = {
  title: "Two Sum",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.
  You may assume that each input would have exactly one solution, and you may not use the same element twice.
  You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  starterCode: `function twoSum(nums, target) {
    // Write your code here
    
}`,
};

export function CodingEnvironment({ playerNumber, playerName, startTime, onSubmit }: CodingEnvironmentProps) {
  const [code, setCode] = useState(SAMPLE_QUESTION.starterCode);
  const [output, setOutput] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canRun, setCanRun] = useState(true);

  useEffect(() => {
    if (startTime && !countdownStarted) {
      const now = Date.now();
      const delay = startTime - now;
      
      if (delay > 0) {
        setShowCountdown(true);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setShowCountdown(false);
              setCountdownStarted(true);
              setIsRunning(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
      }
    }
  }, [startTime, countdownStarted]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    if (!canRun) return;
    
    try {
      setCanRun(false);
      setOutput('Running test cases...');
      
      const verification = await verifyWithGemini(code);
      
      // Run code against test cases
      const testCases = [
        { nums: [2,7,11,15], target: 9, expected: [0,1] },
        { nums: [3,2,4], target: 6, expected: [1,2] },
        { nums: [3,3], target: 6, expected: [0,1] }
      ];

      let testOutput = '';
      for (const test of testCases) {
        try {
          // Actually run the code
          const fn = new Function('nums', 'target', code + '\nreturn twoSum(nums, target);');
          const result = fn(test.nums, test.target);
          const passed = JSON.stringify(result.sort()) === JSON.stringify(test.expected.sort());
          testOutput += `Test case: nums=${JSON.stringify(test.nums)}, target=${test.target}\n`;
          testOutput += `Expected: ${JSON.stringify(test.expected)}, Got: ${JSON.stringify(result)}\n`;
          testOutput += passed ? '✅ Passed\n\n' : '❌ Failed\n\n';
        } catch (e: any) {
          testOutput += `Error: ${e.message}\n\n`;
        }
      }

      setOutput(testOutput + '\nVerification Result:\n' + verification.explanation);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setTimeout(() => setCanRun(true), 1000);
    }
  };

  const verifyWithGemini = async (code: string) => {
    try {
      const verification = await GeminiService.verifyCode(code, SAMPLE_QUESTION);
      if (!verification) {
        throw new Error('Verification failed');
      }
      return verification;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!isRunning) return;
    
    setIsVerifying(true);
    setIsRunning(false);
    
    try {
      const verification = await verifyWithGemini(code);
      const timeElapsed = 120 - timeLeft;
      
      const resultOutput = `
Final Results:
${verification.isCorrect ? '✅ Solution Correct!' : '❌ Solution Incorrect'}
${verification.explanation}
Test Cases: ${verification.testCasesPassed}/${verification.totalTestCases} passed
Time: ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s
      `;
      
      setOutput(resultOutput);
      console.log('Submitting solution:', {
        code,
        timeElapsed,
        isCorrect: verification.isCorrect
      });

      // Submit results
      onSubmit(code, timeElapsed, verification.isCorrect);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify solution');
      setOutput('Failed to verify solution. Please try again.');
      setIsRunning(true); // Allow retrying
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{countdown}</div>
            <div className="text-xl">Battle starting...</div>
          </div>
        </div>
      )}
      
      {/* Timer and Player Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Player {playerNumber}:</span>
          <span>{playerName}</span>
        </div>
        <div className={`text-lg font-mono ${timeLeft < 30 ? 'text-red-500' : ''}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-2">{SAMPLE_QUESTION.title}</h2>
        <p className="whitespace-pre-wrap mb-4">{SAMPLE_QUESTION.description}</p>
        <div className="bg-muted rounded-lg p-3">
          <h3 className="font-semibold mb-2">Example:</h3>
          {SAMPLE_QUESTION.examples.map((example, index) => (
            <div key={index} className="space-y-1">
              <div>Input: {example.input}</div>
              <div>Output: {example.output}</div>
              <div className="text-muted-foreground">{example.explanation}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Code Editor */}
      <Card className="min-h-[400px]">
        <Editor
          height="400px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </Card>

      {/* Terminal Output */}
      <Card className="bg-black p-4 h-32 overflow-auto">
        <pre className="text-green-400 font-mono text-sm">
          {output || '// Output will appear here'}
        </pre>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={handleRun}
          disabled={!canRun || isVerifying}
        >
          {!canRun ? 'Running...' : 'Run Code'}
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isVerifying}
        >
          Submit Solution
        </Button>
      </div>
    </div>
  );
} 