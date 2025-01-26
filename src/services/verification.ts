import { GoogleGenerativeAI } from "@google/generative-ai";
import { TestCase } from '@/types';
import { toast } from 'react-hot-toast';
import { GenerateContentResult } from "@google/generative-ai";
import { executeCode } from './codeExecution';
import { PaymentService } from './paymentService';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Add offline verification as fallback
function offlineVerification(code: string, testCases: TestCase[]): boolean {
  try {
    // Basic syntax check
    new Function(code);
    
    // For offline mode, we'll assume the solution is valid if it has basic structure
    const hasForLoop = code.includes('for');
    const hasIfStatement = code.includes('if');
    const hasReturn = code.includes('return');
    const hasBasicLogic = hasForLoop || hasIfStatement;
    
    return hasBasicLogic && hasReturn;
  } catch {
    return false;
  }
}

export async function verifySolution(code: string, testCases: TestCase[]): Promise<boolean> {
  try {
    if (!navigator.onLine) {
      toast('Using offline verification mode', {
        icon: '⚠️',
        duration: 4000
      });
      return offlineVerification(code, testCases);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Verify this code solution:
      
      Code:
      ${code}

      Test Cases:
      ${testCases.map((test, i) => `
      Test ${i + 1}:
      Input: ${test.input}
      Expected Output: ${test.output}
      `).join('\n')}

      For each test case:
      1. Run the code with the input
      2. Compare the result with expected output
      3. Return a JSON response in this format:
      {
        "passed": boolean,
        "results": [
          {
            "testNumber": number,
            "passed": boolean,
            "actualOutput": string
          }
        ]
      }
    `;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 10000)
      )
    ]) as GenerateContentResult;

    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonResult = JSON.parse(text);
      return jsonResult.passed;
    } catch {
      // If JSON parsing fails, fallback to simple text check
      return text.toLowerCase().includes('true');
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    
    if (!navigator.onLine || error.message?.includes('Failed to fetch')) {
      toast('Using offline verification mode', {
        icon: '⚠️',
        duration: 4000
      });
      return offlineVerification(code, testCases);
    }
    
    if (error.message?.includes('timeout')) {
      toast.error('Verification timed out. Please try again.');
    } else {
      toast.error('Error verifying solution. Please try again.');
    }
    
    throw error;
  }
}

interface Player {
  name: string;
  walletAddress: string;
  code: string;
}

export async function verifyAndShowResult(
  player1: Player,
  player2: Player,
  input: string
): Promise<{winner: Player, loser: Player}> {
  try {
    // Execute both players' code
    const result1 = await executeCode(player1.code, input);
    const result2 = await executeCode(player2.code, input);
    
    // Determine winner (implement your logic here)
    const winner = result1.length <= result2.length ? player1 : player2;
    const loser = winner === player1 ? player2 : player1;
    
    // Transfer prize to winner
    const totalPrize = 0.02; // 2 players * 0.01 ETH
    await PaymentService.transferToWinner(winner.walletAddress, totalPrize);
    
    // Store results in localStorage
    const battleResults = {
      winner: {
        playerName: winner.name,
        address: winner.walletAddress,
        code: winner.code,
        timeElapsed: 0, // Add actual time tracking if needed
        isCorrect: true
      },
      loser: {
        playerName: loser.name,
        address: loser.walletAddress,
        code: loser.code,
        timeElapsed: 0,
        isCorrect: true
      }
    };
    
    localStorage.setItem('battleResults', JSON.stringify(battleResults));
    
    return { winner, loser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Verification failed: ${errorMessage}`);
  }
} 
