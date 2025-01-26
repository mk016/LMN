import React from 'react';
import { verifyAndShowResult } from './services/verification';
import { useState } from 'react';
import WinnerPage from './app/winner/page';
import { PaymentService, generateRandomWalletAddress } from './services/paymentService';

interface Player {
  name: string;
  walletAddress: string;
  code: string;
}

function App() {
  const [showWinner, setShowWinner] = useState(false);
  const [player1, setPlayer1] = useState<Player>({ 
    name: '', 
    walletAddress: '', 
    code: '' 
  });
  const [player2, setPlayer2] = useState<Player>({ 
    name: '', 
    walletAddress: '', 
    code: '' 
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [battleResult, setBattleResult] = useState<{winner: Player, loser: Player} | null>(null);

  const handleStartGame = async (playerDetails: Player) => {
    try {
      const connectedAddress = await PaymentService.getConnectedWalletAddress();
      
      await PaymentService.processPayment({
        amount: 0.01,
        playerName: playerDetails.name,
        walletAddress: connectedAddress
      });
      
      if (!player1.name) {
        setPlayer1({
          ...playerDetails,
          walletAddress: connectedAddress
        });
      } else {
        setPlayer2({
          ...playerDetails,
          walletAddress: connectedAddress
        });
        setGameStarted(true);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleShowResult = async () => {
    try {
      const result = await verifyAndShowResult(player1, player2, 'test-input');
      setBattleResult(result);
      setShowWinner(true);
    } catch (error) {
      console.error('Failed to determine winner:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {!gameStarted ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">
            Entry Fee: 0.01 ETH per player
          </h2>
          {/* Add your player registration form here */}
        </div>
      ) : !showWinner ? (
        <div className="flex flex-col items-center space-y-6">
          {/* Code editor area */}
          <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
            {/* Add your code editor component here */}
          </div>
          
          {/* Buttons container */}
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className={`px-4 py-2 rounded transition-colors ${
                isSubmitted 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitted ? 'Submitted' : 'Submit Code'}
            </button>
            
            {isSubmitted && (
              <button
                onClick={handleShowResult}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Show Result
              </button>
            )}
          </div>
        </div>
      ) : (
        <WinnerPage 
          winnerName={battleResult?.winner.name || ''}
          winnerAddress={battleResult?.winner.walletAddress || ''}
          loserAddress={battleResult?.loser.walletAddress || ''}
        />
      )}
    </div>
  );
}

export default App;
