import React from 'react';
import { Sparkles, Zap, Flame } from 'lucide-react';
import { DifficultyLevel } from '@/types';

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel | null;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
}

const difficulties = [
  { level: 'easy' as DifficultyLevel, icon: Sparkles, label: 'Easy', color: 'green' },
  { level: 'intermediate' as DifficultyLevel, icon: Zap, label: 'Intermediate', color: 'yellow' },
  { level: 'hard' as DifficultyLevel, icon: Flame, label: 'Hard', color: 'red' }
];

export function DifficultySelector({ selectedDifficulty, onSelectDifficulty }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {difficulties.map(({ level, icon: Icon, label, color }) => (
        <button
          key={level}
          onClick={() => onSelectDifficulty(level)}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedDifficulty === level
              ? `border-${color}-500 bg-${color}-50`
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <Icon className={`w-8 h-8 text-${color}-500`} />
            <span className="font-medium">{label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}