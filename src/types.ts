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