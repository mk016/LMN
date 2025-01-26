export type Language = {
  id: string;
  name: string;
  icon: string;
};

export type DifficultyLevel = 'easy' | 'intermediate' | 'hard';

export type CodingProblem = {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  timeLimit: number;
};

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export type CodingChallenge = {
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  starterCode: {
    [key: string]: string;  // Maps language ID to starter code
  };
  testCases: TestCase[];
};