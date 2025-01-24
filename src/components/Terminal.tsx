import React from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  output: string[];
  isLoading?: boolean;
}

export function Terminal({ output, isLoading = false }: TerminalProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <TerminalIcon className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400">Output Terminal</span>
      </div>
      <div className="space-y-1">
        {output.map((line, index) => (
          <div key={index} className="text-gray-300">
            <span className="text-green-500">$</span> {line}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-300 animate-pulse">
            <span className="text-green-500">$</span> Running tests...
          </div>
        )}
      </div>
    </div>
  );
} 