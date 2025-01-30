import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Add rate limiting
let lastCallTime = 0;
const RATE_LIMIT_MS = 1000; // 1 second between calls

export class GeminiService {
  static async verifyCode(code: string, question: any) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        You are a strict code verifier. Verify this JavaScript solution for the Two Sum problem.
        
        Code to verify:
        ${code}

        Test cases to check:
        1. nums = [2,7,11,15], target = 9 => [0,1]
        2. nums = [3,2,4], target = 6 => [1,2]
        3. nums = [3,3], target = 6 => [0,1]
        4. nums = [1,2,3,4], target = 7 => [2,3]

        Verify:
        1. Function returns correct indices
        2. Solution handles all test cases
        3. No edge case errors
        4. Time complexity O(n)

        Return only a JSON object in this exact format:
        {
          "isCorrect": boolean,
          "explanation": "brief explanation",
          "testCasesPassed": number,
          "totalTestCases": 4
        }

        Run all test cases and only set isCorrect to true if ALL tests pass.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract and clean JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const cleanJson = jsonMatch[0]
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const verification = JSON.parse(cleanJson);

      // Additional validation
      if (typeof verification.isCorrect !== 'boolean') {
        throw new Error('Invalid verification result');
      }

      return verification;
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        isCorrect: false,
        explanation: "Failed to verify solution correctly",
        testCasesPassed: 0,
        totalTestCases: 4
      };
    }
  }
} 