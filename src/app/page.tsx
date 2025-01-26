'use client';

import { useState, useEffect } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DifficultySelector } from '@/components/DifficultySelector';
import { Timer } from '@/components/Timer';
import { WalletConnect } from '@/components/WalletConnect';
import { DifficultyLevel } from '@/types';
import { Code, Trophy, Play, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useWallet } from '@/hooks/useWallet';
import { Terminal } from '@/components/Terminal';
import { socketService } from '@/services/socket';
import { getChallengeForRoom, type CodingChallenge } from '@/data/questions';
import { toast } from 'react-hot-toast';
import { verifySolution } from '@/services/verification';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

const ENTRY_FEES = {
  easy: '0.01',
  intermediate: '0.02',
  hard: '0.05'
};

// This is a placeholder contract address for the Sepolia testnet
// Replace this with your deployed contract address
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account, provider } = useWallet();
  const [output, setOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [players, setPlayers] = useState<{
    player1: { connected: boolean; code: string; completed: boolean } | null;
    player2: { connected: boolean; code: string; completed: boolean } | null;
  }>({
    player1: null,
    player2: null
  });
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [opponentSolution, setOpponentSolution] = useState<{
    code: string;
    timeElapsed: number;
    isCorrect: boolean;
  } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSolutionCorrect, setIsSolutionCorrect] = useState(false);
  const [hasRunTests, setHasRunTests] = useState(false);
  const [solutions, setSolutions] = useState<{
    [key: string]: {
      code: string;
      timeElapsed: number;
    }
  }>({});
  const [playerName, setPlayerName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [opponentName, setOpponentName] = useState<string>('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const joinOrCreateRoom = async () => {
      const currentRoomId = new URLSearchParams(window.location.search).get('room');
      
      if (currentRoomId) {
        setRoomId(currentRoomId);
        setShowNameInput(true);
      } else {
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
        setPlayerNumber(1);
        setPlayerName('Player 1');
        setShowNameInput(false);
        window.history.pushState({}, '', `?room=${newRoomId}`);
      }
    };

    joinOrCreateRoom();
  }, []);

  useEffect(() => {
    if (!roomId || !account) return;

    // Connect to WebSocket
    socketService.connect(roomId);

    // Get the same challenge for this room
    const challenge = getChallengeForRoom(roomId);
    
    if (playerNumber === 1) {
      // Only player 1 emits the challenge
      socketService.emitChallenge(challenge);
    }

    // Both players set their challenge
    setChallenge(challenge);
    localStorage.setItem('currentChallenge', JSON.stringify(challenge));
    if (selectedLanguage) {
      setCode(challenge.starterCode[selectedLanguage]);
    }

    // Subscribe to player updates
    socketService.subscribeToPlayerUpdate((updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Subscribe to opponent's solution
    socketService.subscribeToOpponentSolution((solution) => {
      setOpponentSolution(solution);
      
      // If both solutions are submitted, redirect to verification page
      if (isSubmitted) {
        window.location.href = `/verify?room=${roomId}`;
      }
    });

    // Subscribe to players update
    socketService.subscribeToPlayersUpdate((players) => {
      setOpponentName(players[playerNumber === 1 ? 2 : 1]?.name || '');
    });

    // Start game when both players are connected
    socketService.on('startGame', (challenge: CodingChallenge) => {
      setIsGameStarted(true);
      setIsTimerActive(true);
      setTimeLeft(120); // Reset timer
    });

    return () => {
      socketService.disconnect();
    };
  }, [roomId, account, selectedLanguage, playerNumber]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      // Handle time up logic here
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const handleStart = async () => {
    if (!selectedLanguage || !selectedDifficulty || !roomId) {
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    try {
      // Use the room-specific challenge
      const challenge = getChallengeForRoom(roomId);
      
      setChallenge(challenge);
      localStorage.setItem('currentChallenge', JSON.stringify(challenge));
      setCode(challenge.starterCode[selectedLanguage]);
      setIsStarted(true);
      setOutput(['Challenge started! Waiting for other player...']);
      
      setPlayers(prev => ({
        ...prev,
        [`player${playerNumber}`]: {
          connected: true,
          code: challenge.starterCode[selectedLanguage],
          completed: false
        }
      }));
    } catch (error) {
      console.error('Error:', error);
      setOutput(['Failed to start challenge. Please try again.']);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
  };

  const runCode = async (code: string, testCase: { input: string; output: string }) => {
    try {
      setIsProcessing(true);
      setOutput(prev => [
        ...prev, 
        '🔄 Running test case...',
        `Input: ${testCase.input}`,
        `Expected Output: ${testCase.output}`
      ]);
      
      // Create a unique verification for this test case
      const isCorrect = await verifySolution(code, [testCase]);
      
      // Store the result in state to prevent caching
      const result = isCorrect ? '✅ PASSED' : '❌ FAILED';
      const resultDetails = isCorrect 
        ? `Output matches expected result`
        : `Output does not match expected result`;
      
      setOutput(prev => [
        ...prev,
        `${result}`,
        resultDetails,
        '-------------------'
      ]);
      
      return isCorrect;
    } catch (error: any) {
      setOutput(prev => [...prev, `❌ Error: ${error.message}`, '-------------------']);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!code || !challenge || !playerNumber || isSubmitting) return;

    setIsSubmitting(true);
    setIsTimerActive(false);
    const finalTime = 120 - timeLeft;

    try {
      setOutput(['🔄 Verifying solution...']);
      
      const isCorrect = await verifySolution(code, challenge.testCases).catch(error => {
        setOutput(prev => [...prev, `❌ ${error.message}`]);
        return false;
      });
      
      if (isCorrect) {
        setOutput(prev => [...prev, '✅ Solution verified!']);
        
        // Store solution with more details
        const currentSolution = {
          playerNumber,
          playerName,
          code,
          timeElapsed: finalTime,
          isCorrect: true
        };
        
        localStorage.setItem(`player${playerNumber}Solution`, JSON.stringify(currentSolution));
        
        // Notify opponent
        socketService.submitSolution(playerNumber, code, finalTime, true);
        setIsSubmitted(true);

        // If opponent already submitted, redirect to verification page
        if (opponentSolution) {
          setOutput(prev => [...prev, '🏁 Both solutions submitted! Redirecting...']);
          
          // Store opponent's solution
          const opponentSolutionData = {
            playerNumber: playerNumber === 1 ? 2 : 1,
            playerName: opponentName,
            code: opponentSolution.code,
            timeElapsed: opponentSolution.timeElapsed,
            isCorrect: opponentSolution.isCorrect
          };
          
          localStorage.setItem(`player${playerNumber === 1 ? 2 : 1}Solution`, 
            JSON.stringify(opponentSolutionData)
          );
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = `/verify?room=${roomId}`;
          }, 1500);
        } else {
          setOutput(prev => [...prev, '⏳ Waiting for opponent to submit...']);
        }
      } else {
        setOutput(prev => [...prev, '❌ Solution failed verification', 'Please fix your code and try again']);
        setIsTimerActive(true);
      }
    } catch (error: any) {
      setOutput(prev => [...prev, '❌ Error occurred', error.message]);
      setIsTimerActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyAndAnnounceWinner = async () => {
    if (!challenge || !playerNumber || !opponentSolution) return;

    setOutput(prev => [...prev, '🧪 Verifying both solutions...']);

    try {
      // Verify current player's solution
      const playerResult = await verifySolution(code, challenge.testCases);
      
      // Verify opponent's solution
      const opponentResult = await verifySolution(opponentSolution.code, challenge.testCases);

      // Determine winner based on correctness and time
      let winner: number | null = null;

      if (playerResult && !opponentResult) {
        winner = playerNumber;
      } else if (!playerResult && opponentResult) {
        winner = playerNumber === 1 ? 2 : 1;
      } else if (playerResult && opponentResult) {
        // Both correct, compare times
        winner = opponentSolution.timeElapsed < (120 - timeLeft) ? 
          (playerNumber === 1 ? 2 : 1) : playerNumber;
      }

      if (winner) {
        const results = {
          winner: {
            playerNumber: winner,
            address: winner === playerNumber ? account : 'Opponent',
            timeElapsed: winner === playerNumber ? (120 - timeLeft) : opponentSolution.timeElapsed,
            code: winner === playerNumber ? code : opponentSolution.code,
            isCorrect: winner === playerNumber ? playerResult : opponentResult
          },
          loser: {
            playerNumber: winner === 1 ? 2 : 1,
            address: winner === playerNumber ? 'Opponent' : account,
            timeElapsed: winner === playerNumber ? opponentSolution.timeElapsed : (120 - timeLeft),
            code: winner === playerNumber ? opponentSolution.code : code,
            isCorrect: winner === playerNumber ? opponentResult : playerResult
          }
        };

        localStorage.setItem('battleResults', JSON.stringify(results));
        window.location.href = '/winner';
      } else {
        // Neither solution is correct
        setOutput(prev => [...prev, '❌ Neither solution passed all test cases']);
        toast.error('No winner - both solutions failed');
        setIsTimerActive(true);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setOutput(prev => [...prev, '❌ Error verifying solutions']);
      toast.error('Error verifying solutions');
      setIsTimerActive(true);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId) return;
    
    setPlayerNumber(2);
    setShowNameInput(false);
    
    // Notify server about new player
    socketService.emitPlayerJoin({
      roomId,
      playerNumber: 2,
      playerName
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">Code Battle</span>
            </div>
            <div className="flex items-center space-x-4">
              {isStarted && !isTimeUp && (
                <Timer 
                  duration={120} 
                  onTimeUp={handleTimeUp} 
                  isActive={isTimerActive}
                  onTimeUpdate={setTimeLeft}
                />
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showNameInput && roomId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border rounded mb-4"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        )}

        {roomId && !isStarted && (
          <div className="text-center mb-4">
            <p className="text-lg font-medium">
              Room ID: {roomId}
              <br />
              {playerNumber === 1 ? (
                <span className="text-gray-600">
                  Share this URL with your opponent: 
                  <br />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {window.location.href}
                  </code>
                </span>
              ) : (
                <span className="text-gray-600">
                  Playing as {playerName}
                </span>
              )}
            </p>
          </div>
        )}

        {!isStarted ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Select Programming Language</h2>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Choose Difficulty Level</h2>
              <DifficultySelector
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
              />
              {selectedDifficulty && (
                <p className="mt-2 text-center text-gray-600">
                  Entry Fee: {ENTRY_FEES[selectedDifficulty]} ETH
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              {!account && (
                <p className="text-red-500">Please connect your wallet to start</p>
              )}
              <button
                onClick={handleStart}
                disabled={isLoading || !selectedLanguage}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                  ${isLoading || !selectedLanguage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Challenge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Generating your challenge...</p>
                </div>
              </div>
            ) : challenge ? (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Problem: {challenge.title}</h2>
                    {testResults && (
                      <div className={`flex items-center gap-2 ${
                        testResults.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResults.passed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span>{testResults.message}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{challenge.description}</p>
                  
                  {challenge.examples.map((example, index) => (
                    <div key={index} className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Example {index + 1}:</h3>
                      <pre className="text-sm">
                        Input: {example.input}{'\n'}
                        Output: {example.output}{'\n'}
                        Explanation: {example.explanation}
                      </pre>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 gap-4">
                    {/* Conditional Rendering for Player 1 */}
                    {playerNumber === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Player 1 (You - {playerName})</h3>
                        <div className="bg-white rounded-lg shadow-sm">
                          <MonacoEditor
                            height="400px"
                            defaultLanguage={selectedLanguage}
                            theme="vs-dark"
                            value={players.player1?.code}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              readOnly: isTimeUp, // Player 1's editor is read-only when time is up
                            }}
                            onChange={(value) => {
                              setCode(value || "");
                              setPlayers((prev) => ({
                                ...prev,
                                player1: { ...prev.player1!, code: value || "" },
                              }));
                            }}
                          />
                        </div>
                        {/* Buttons for Player 1 */}
                        <div className="flex gap-4">
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || isTimeUp || !code}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                              ${isSubmitting || isTimeUp || !code
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                              }`}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span>Submit Solution</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Conditional Rendering for Player 2 */}
                    {playerNumber === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Player 2 (You - {playerName})</h3>
                        <div className="bg-white rounded-lg shadow-sm">
                          <MonacoEditor
                            height="400px"
                            defaultLanguage={selectedLanguage}
                            theme="vs-dark"
                            value={players.player2?.code}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              readOnly: isTimeUp, // Player 2's editor is read-only when time is up
                            }}
                            onChange={(value) => {
                              setCode(value || "");
                              setPlayers((prev) => ({
                                ...prev,
                                player2: { ...prev.player2!, code: value || "" },
                              }));
                            }}
                          />
                        </div>
                        {/* Buttons for Player 2 */}
                        <div className="flex gap-4">
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || isTimeUp || !code}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                              ${isSubmitting || isTimeUp || !code
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                              }`}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span>Submit Solution</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Terminal output={output} isLoading={isProcessing || isSubmitting} />
                    
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Time Remaining:</span>
                        <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isTimeUp && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg text-center max-w-md mx-4">
                      <div className="mb-4">
                        {testResults?.passed ? (
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-600" />
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        {testResults?.passed ? 'Challenge Completed!' : 'Time\'s Up!'}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {testResults?.passed 
                          ? 'Congratulations! Your solution passed all test cases.'
                          : 'Your time has ended. You can review your solution but cannot make further changes.'}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Another Challenge
                      </button>
                    </div>
                  </div>
                )}

                {opponentName && (
                  <div className="text-sm text-gray-600 mt-2">
                    Opponent: {opponentName}
                  </div>
                )}

                {/* Add opponent status display */}
                {isStarted && (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">You:</span> {playerName}
                      </div>
                      <div>
                        <span className="font-medium">Opponent:</span> {opponentName || 'Waiting...'}
                      </div>
                    </div>
                    {opponentName && (
                      <div className="text-sm text-gray-600 mt-2">
                        {isSubmitted ? '✅ You submitted' : '⏳ Writing code...'}
                        {opponentSolution ? ' | ✅ Opponent submitted' : ' | ⏳ Opponent writing code...'}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}