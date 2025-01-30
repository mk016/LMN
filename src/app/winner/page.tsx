'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Code, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';

interface Solution {
  playerNumber: number;
  playerName: string;
  address: string;
  timeElapsed: number;
  code: string;
  isCorrect: boolean;
}

interface BattleResults {
  winner: Solution;
  loser: Solution;
}

const WinnerPage: React.FC = () => {
  const [results, setResults] = useState<BattleResults | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [winnerName, setWinnerName] = useState<string>('');
  const [winnerAddress, setWinnerAddress] = useState<string>('');
  const [loserAddress, setLoserAddress] = useState<string>('');
  const prizeAmount = 0.02; // 2 players * 0.01 ETH

  useEffect(() => {
    // Retrieve results and challenge from localStorage
    const storedResults = localStorage.getItem('battleResults');
    const storedChallenge = localStorage.getItem('currentChallenge');

    if (storedResults) {
      const parsedResults: BattleResults = JSON.parse(storedResults);
      setResults(parsedResults);
      setWinnerName(parsedResults.winner.playerName);
      setWinnerAddress(parsedResults.winner.address);
      setLoserAddress(parsedResults.loser.address);
    }

    if (storedChallenge) {
      setChallenge(JSON.parse(storedChallenge));
    }
  }, []);

  if (!results || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No results available</p>
          <Link 
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Winner Banner */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Congratulations!
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {winnerName} wins the battle!
            </p>
            
            {/* Prize Information */}
            <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Prize Amount: {prizeAmount} ETH</span>
              </div>
              <p className="text-sm text-gray-600">
                Winner's Wallet:
                <br />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs break-all">
                  {winnerAddress}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WinnerPage;
