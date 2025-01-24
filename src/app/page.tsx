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
import { ethers } from 'ethers';
import { Terminal } from '@/components/Terminal';
import { generateCodingChallenge, type CodingChallenge } from '@/services/gemini';
import { useParams } from 'next/navigation';

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

  useEffect(() => {
    // Generate or join room logic
    if (!account) return;
    
    const joinOrCreateRoom = async () => {
      // This is a placeholder - implement actual room joining logic
      const currentRoomId = new URLSearchParams(window.location.search).get('room');
      
      if (currentRoomId) {
        // Join existing room
        setRoomId(currentRoomId);
        setPlayerNumber(2);
      } else {
        // Create new room
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
        setPlayerNumber(1);
        // Redirect to room URL
        window.history.pushState({}, '', `?room=${newRoomId}`);
      }
    };

    joinOrCreateRoom();
  }, [account]);

  const handleStart = async () => {
    if (!selectedLanguage || !selectedDifficulty || !roomId) {
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    try {
      // Generate the same challenge for both players
      const newChallenge = await generateCodingChallenge(
        selectedDifficulty,
        selectedLanguage
      );
      
      // Store challenge in shared state (e.g., using a real-time database)
      // This is a placeholder - implement actual challenge sharing
      setChallenge(newChallenge);
      setCode(newChallenge.starterCode);
      setIsStarted(true);
      setOutput(['Challenge generated successfully! Waiting for other player...']);
      
      // Update player status
      setPlayers(prev => ({
        ...prev,
        [`player${playerNumber}`]: {
          connected: true,
          code: newChallenge.starterCode,
          completed: false
        }
      }));
    } catch (error) {
      console.error('Error:', error);
      setOutput(['Failed to generate challenge. Please try again.']);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
  };

  const runTests = async () => {
    if (!code) return;

    setIsProcessing(true);
    setOutput(['Initializing test environment...']);

    try {
      // Simulate test running - replace with actual test logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput(prev => [...prev, 'Running test cases...']);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Example test result - replace with actual test logic
      const passed = Math.random() > 0.5;
      setTestResults({
        passed,
        message: passed ? 'All test cases passed!' : 'Some test cases failed. Try again!'
      });

      setOutput(prev => [...prev, testResults?.message || '']);
    } catch (error) {
      setOutput(prev => [...prev, 'Error running tests: ' + error]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!code) return;

    setIsSubmitting(true);
    try {
      // Run final tests
      await runTests();
      
      // Stop the timer
      setIsTimeUp(true);
      
      setOutput(prev => [...prev, 'Solution submitted successfully!']);
    } catch (error) {
      setOutput(prev => [...prev, 'Error submitting solution: ' + error]);
    } finally {
      setIsSubmitting(false);
    }
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
                  isActive={true}
                  onTimeUpdate={setTimeLeft}
                />
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {roomId && !isStarted && (
          <div className="text-center mb-4">
            <p className="text-lg font-medium">
              Room ID: {roomId}
              {playerNumber === 1 && (
                <span className="ml-2 text-gray-600">
                  Share this URL with your opponent
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

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Constraints:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {challenge.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Player 1 Editor */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Player 1</h3>
                    <div className="bg-white rounded-lg shadow-sm">
                      <MonacoEditor
                        height="400px"
                        defaultLanguage={selectedLanguage}
                        theme="vs-dark"
                        value={players.player1?.code}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          readOnly: playerNumber !== 1 || isTimeUp
                        }}
                        onChange={(value) => {
                          if (playerNumber === 1) {
                            setCode(value || '');
                            setPlayers(prev => ({
                              ...prev,
                              player1: { ...prev.player1!, code: value || '' }
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Player 2 Editor */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Player 2</h3>
                    <div className="bg-white rounded-lg shadow-sm">
                      <MonacoEditor
                        height="400px"
                        defaultLanguage={selectedLanguage}
                        theme="vs-dark"
                        value={players.player2?.code}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          readOnly: playerNumber !== 2 || isTimeUp
                        }}
                        onChange={(value) => {
                          if (playerNumber === 2) {
                            setCode(value || '');
                            setPlayers(prev => ({
                              ...prev,
                              player2: { ...prev.player2!, code: value || '' }
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={runTests}
                        disabled={isProcessing || isTimeUp || !code}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                          ${isProcessing || isTimeUp || !code
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Run Tests</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isTimeUp || !code}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                          ${isSubmitting || isTimeUp || !code
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
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
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}