import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key exists
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing Gemini API key - please add it to your .env.local file");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define the CodingChallenge interface
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

// Default starter code templates
const defaultStarterCode: Record<string, string> = {
  python: `def solution(input_data):\n    # Write your code here\n    pass`,
  java: `class Solution {\n    public void solve(String input) {\n        // Write your code here\n    }\n}`,
  cpp: `class Solution {\npublic:\n    void solve(string input) {\n        // Write your code here\n    }\n};`
};

/**
 * Helper function to retrieve default starter code for a given language
 * @param language - Programming language
 * @returns Default starter code for the language
 */
function getDefaultStarterCode(language: string): string {
  return defaultStarterCode[language.toLowerCase()] || "// Write your solution here";
}

/**
 * Generates a random coding challenge using the Gemini API
 * @param difficulty - The difficulty level (easy, intermediate, hard)
 * @param language - The programming language
 * @returns A dynamically generated coding challenge
 */
export async function generateCodingChallenge(
  difficulty: string,
  language: string
): Promise<CodingChallenge> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Generate a coding challenge based on the following criteria:
      - Difficulty: ${difficulty}
      - Programming Language: ${language}

      Include:
      1. A title for the challenge
      2. A detailed problem description
      3. 3 example test cases with inputs, outputs, and explanations
      4. Constraints for the problem
      5. Starter code in ${language}

      Format the response as a JSON object like this:
      {
        "title": "string",
        "description": "string",
        "examples": [
          {"input": "string", "output": "string", "explanation": "string"}
        ],
        "constraints": ["string"],
        "difficulty": "string",
        "starterCode": "string"
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const challengeText = await response.text();

    // Parse the response into JSON
    try {
      return JSON.parse(challengeText);
    } catch (error) {
      console.error("Failed to parse Gemini response:", challengeText);
      return {
        title: "Random Challenge",
        description: "This is a fallback random coding challenge.",
        examples: [
          { input: "Example input", output: "Example output", explanation: "Example explanation" }
        ],
        constraints: ["Example constraint"],
        difficulty,
        starterCode: getDefaultStarterCode(language)
      };
    }
  } catch (error) {
    console.error("Error generating challenge:", error);
    return {
      title: "Random Challenge",
      description: "This is a fallback random coding challenge.",
      examples: [
        { input: "Example input", output: "Example output", explanation: "Example explanation" }
      ],
      constraints: ["Example constraint"],
      difficulty,
      starterCode: getDefaultStarterCode(language)
    };
  }
}

/**
 * Utility to randomly select an element from an array
 * @param array - Array of items
 * @returns Random element from the array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Predefined difficulties and programming languages
const difficulties = ["easy", "intermediate", "hard"];
const languages = ["python", "java", "cpp"];

/**
 * Generates a random challenge with random difficulty and programming language
 * @returns A randomly generated coding challenge
 */
export async function generateRandomChallenge(): Promise<CodingChallenge> {
  const randomDifficulty = getRandomElement(difficulties);
  const randomLanguage = getRandomElement(languages);
  return await generateCodingChallenge(randomDifficulty, randomLanguage);
}
