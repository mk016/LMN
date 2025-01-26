'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Code, Clock } from 'lucide-react';

interface ResultsProps {
  winner: {
    playerNumber: 1 | 2;
    address: string;
    timeElapsed: number;
    code: string;
  };
  loser: {
    playerNumber: 1 | 2;
    address: string;
    timeElapsed: number;
    code: string;
  };
}

export default function Results() {
  const [results, setResults] = useState<ResultsProps | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get results from URL params or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const resultsData = localStorage.getItem('battleResults');
    
    if (resultsData) {
      setResults(JSON.parse(resultsData));
    }
  }, []);

  if (!results) return <div>Loading results...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Battle Results</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Winner</h2>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{results.winner.timeElapsed}s</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {results.winner.code}
            </pre>
          </div>
        </div>

        {results.loser && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Runner Up</h2>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{results.loser.timeElapsed}s</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {results.loser.code}
              </pre>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Battle
          </button>
        </div>
      </div>
    </div>
  );
} 