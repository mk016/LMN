import { GoogleGenerativeAI } from "@google/generative-ai";

// Verify API key exists
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing Gemini API key - please add it to your .env.local file');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface CodingChallenge {
  title: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  constraints: string[];
  difficulty: string;
  starterCode: string;
}

// Add a default challenge in case API fails
const DEFAULT_CHALLENGE: CodingChallenge = {
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  examples: [{
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
  }],
  constraints: [
    "2 <= nums.length <= 104",
    "-109 <= nums[i] <= 109",
    "-109 <= target <= 109"
  ],
  difficulty: "easy",
  starterCode: `def twoSum(nums, target):
    # Write your solution here
    pass`
};

export async function generateCodingChallenge(
  difficulty: string,
  language: string
): Promise<CodingChallenge> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a coding challenge with the following format:
      - Difficulty: ${difficulty}
      - Programming Language: ${language}
      
      Include:
      1. A title
      2. Problem description
      3. Example test cases with input, output, and explanation
      4. Constraints
      5. Starter code in ${language}
      
      Format the response as a JSON object with the following structure:
      {
        "title": "string",
        "description": "string",
        "examples": [{"input": "string", "output": "string", "explanation": "string"}],
        "constraints": ["string"],
        "difficulty": "string",
        "starterCode": "string"
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const challengeText = response.text();
    
    try {
      return JSON.parse(challengeText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', challengeText);
      return {
        ...DEFAULT_CHALLENGE,
        starterCode: getDefaultStarterCode(language)
      };
    }
  } catch (error) {
    console.error('Error generating challenge:', error);
    return {
      ...DEFAULT_CHALLENGE,
      starterCode: getDefaultStarterCode(language)
    };
  }
}

function getDefaultStarterCode(language: string): string {
  switch (language.toLowerCase()) {
    case 'python':
      return `def twoSum(nums, target):
    # Write your solution here
    pass`;
    case 'java':
      return `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`;
    case 'cpp':
      return `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`;
    default:
      return '// Write your solution here';
  }
} 