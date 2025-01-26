'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Terminal } from '@/components/Terminal';
import { Trophy, Code, Clock, CheckCircle, XCircle } from 'lucide-react';
import { verifySolution } from '@/services/verification';
import type { CodingChallenge } from '@/data/questions';

interface PlayerSolution {
  playerNumber: number;
  playerName: string;
  code: string;
  timeElapsed: number;
  isCorrect: boolean;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [output, setOutput] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [winner, setWinner] = useState<PlayerSolution | null>(null);
  const [loser, setLoser] = useState<PlayerSolution | null>(null);
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);

  useEffect(() => {
    const verifyAndDetermineWinner = async () => {
      try {
        // Get solutions from localStorage
        const player1Solution = JSON.parse(localStorage.getItem('player1Solution') || '{}');
        const player2Solution = JSON.parse(localStorage.getItem('player2Solution') || '{}');
        const currentChallenge = JSON.parse(localStorage.getItem('currentChallenge') || '{}');
        
        setChallenge(currentChallenge);
        setOutput(prev => [...prev, '🔄 Verifying solutions...']);

        // Verify both solutions
        const [player1Correct, player2Correct] = await Promise.all([
          verifySolution(player1Solution.code, currentChallenge.testCases),
          verifySolution(player2Solution.code, currentChallenge.testCases)
        ]);

        // Determine winner based on correctness and time
        let winnerSolution: PlayerSolution;
        let loserSolution: PlayerSolution;

        if (player1Correct && !player2Correct) {
          winnerSolution = player1Solution;
          loserSolution = player2Solution;
        } else if (!player1Correct && player2Correct) {
          winnerSolution = player2Solution;
          loserSolution = player1Solution;
        } else if (player1Correct && player2Correct) {
          // Both correct, compare times
          if (player1Solution.timeElapsed < player2Solution.timeElapsed) {
            winnerSolution = player1Solution;
            loserSolution = player2Solution;
          } else {
            winnerSolution = player2Solution;
            loserSolution = player1Solution;
          }
        } else {
          // Neither correct
          setOutput(prev => [...prev, '❌ Neither solution passed all test cases']);
          return;
        }

        setWinner(winnerSolution);
        setLoser(loserSolution);
        setOutput(prev => [
          ...prev,
          '✅ Verification complete!',
          `🏆 Winner: ${winnerSolution.playerName}`,
          `⏱️ Time taken: ${winnerSolution.timeElapsed} seconds`
        ]);

        if (winnerSolution && loserSolution) {
          const results = {
            winner: winnerSolution,
            loser: loserSolution
          };
          
          localStorage.setItem('battleResults', JSON.stringify(results));
          
          // Redirect to winner page after a short delay
          setTimeout(() => {
            window.location.href = '/winner';
          }, 1500);
        }

      } catch (error: any) {
        setOutput(prev => [...prev, `❌ Error: ${error.message}`]);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndDetermineWinner();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Battle Results
          </h1>

          {isVerifying ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Verifying solutions...</p>
              </div>
            </div>
          ) : winner && loser ? (
            <div className="space-y-6">
              {/* Winner Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-green-800">Winner: {winner.playerName}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {winner.timeElapsed}s
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    All tests passed
                  </span>
                </div>
                <pre className="mt-4 p-4 bg-white rounded-lg overflow-x-auto">
                  <code>{winner.code}</code>
                </pre>
              </div>

              {/* Loser Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5 text-gray-500" />
                  <h2 className="text-xl font-bold text-gray-800">Runner-up: {loser.playerName}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {loser.timeElapsed}s
                  </span>
                  <span className="flex items-center gap-1">
                    {loser.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {loser.isCorrect ? 'All tests passed' : 'Tests failed'}
                  </span>
                </div>
                <pre className="mt-4 p-4 bg-white rounded-lg overflow-x-auto">
                  <code>{loser.code}</code>
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No valid solutions found</p>
          )}

          <Terminal output={output} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Battle
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 