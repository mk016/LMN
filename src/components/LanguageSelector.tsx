import React from 'react';
import { Code2, Coffee, Cpu } from 'lucide-react';
import { Language } from '@/types';

const languages: Language[] = [
  { id: 'cpp', name: 'C++', icon: 'Cpu' },
  { id: 'java', name: 'Java', icon: 'Coffee' },
  { id: 'python', name: 'Python', icon: 'Code2' }
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const iconMap = {
  Cpu: Cpu,
  Coffee: Coffee,
  Code2: Code2
};

export function LanguageSelector({ selectedLanguage, onSelectLanguage }: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {languages.map((lang) => {
        const Icon = iconMap[lang.icon as keyof typeof iconMap];
        return (
          <button
            key={lang.id}
            onClick={() => onSelectLanguage(lang.id)}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedLanguage === lang.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Icon className="w-8 h-8" />
              <span className="font-medium">{lang.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}