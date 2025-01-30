'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Copy, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { socketService } from '@/services/socket';
import { RoomService } from '@/services/roomService';
import { CodingEnvironment } from '@/components/coding-environment';
import { WinnerAnnouncement } from '@/components/winner-announcement';
import { LoseAnnouncement } from '@/components/lose-announcement';
import { BattleResult } from '@/components/battle-result';
import { PaymentService } from '@/services/paymentService';
import { useWallet } from '@/hooks/useWallet';

interface Player {
  name: string;
  connected: boolean;
}

export default function BattlePage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string>('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [players, setPlayers] = useState<{[key: string]: Player}>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [canStartGame, setCanStartGame] = useState(false);
  const [currentPlayers, setCurrentPlayers] = useState<{
    player1?: { name: string; ready: boolean };
    player2?: { name: string; ready: boolean };
  }>({});
  const [winner, setWinner] = useState<{
    name: string;
    playerNumber: number;
    timeElapsed: number;
    code: string;
    loser: {
      name: string;
      playerNumber: number;
      timeElapsed: number;
      code: string;
    };
  } | null>(null);
  const [battleStartTime, setBattleStartTime] = useState<number | null>(null);
  const [solutions, setSolutions] = useState<{
    [playerNumber: string]: {
      code: string;
      timeElapsed: number;
      isCorrect: boolean;
    };
  }>({});
  const [playerReady, setPlayerReady] = useState(false);
  const { account } = useWallet();
  const [hasPaid, setHasPaid] = useState(false);
  const amount = searchParams?.get('amount') || '0.01';

  const mode = searchParams?.get('mode');
  const playerName = searchParams?.get('name') || '';
  const language = searchParams?.get('language') || '';

  // Add this state to track both players' payments
  const [playersPaymentStatus, setPlayersPaymentStatus] = useState({
    player1: false,
    player2: false
  });

  useEffect(() => {
    const initRoom = async () => {
      try {
        if (mode === 'create') {
          const walletAddress = await PaymentService.getConnectedWalletAddress();
          const newRoomId = Math.random().toString(36).substring(7);
          await RoomService.createRoom(newRoomId, {
            name: playerName,
            walletAddress,
            language
          });
          setRoomId(newRoomId);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize room:', error);
        toast.error('Failed to create room');
      }
    };

    if (mode) {
      initRoom();
    }
  }, [mode, playerName, language]);

  // Single player update subscription
  useEffect(() => {
    if (!roomId) return;

    const handlePlayersUpdate = (updatedPlayers: any) => {
      console.log('Players update received:', updatedPlayers);
      
      setCurrentPlayers({
        player1: updatedPlayers['1'] ? { 
          name: updatedPlayers['1'].name, 
          ready: updatedPlayers['1'].ready || false
        } : undefined,
        player2: updatedPlayers['2'] ? { 
          name: updatedPlayers['2'].name, 
          ready: updatedPlayers['2'].ready || false
        } : undefined
      });

      setCanStartGame(Boolean(
        updatedPlayers['1']?.ready && 
        updatedPlayers['2']?.ready
      ));
    };

    socketService.subscribeToPlayersUpdate(handlePlayersUpdate);

    return () => {
      socketService.disconnect();
    };
  }, [roomId]);

  const handleJoinRoom = async () => {
    try {
      setIsLoading(true);
      
      const walletAddress = await PaymentService.getConnectedWalletAddress();
      
      await RoomService.joinRoom(joinRoomId, {
        name: playerName,
        walletAddress,
        language
      });

      setRoomId(joinRoomId);
      
      // Update both players when joining
      setCurrentPlayers(prev => ({
        player1: { name: 'Opponent', ready: false }, // Add placeholder for opponent
        player2: { 
          name: playerName, 
          ready: false,
          walletAddress 
        }
      }));

      // Subscribe to player updates after joining
      socketService.subscribeToPlayersUpdate((updatedPlayers) => {
        setCurrentPlayers({
          player1: updatedPlayers['1'] ? {
            name: updatedPlayers['1'].name,
            ready: updatedPlayers['1'].ready || false
          } : { name: 'Waiting...', ready: false },
          player2: updatedPlayers['2'] ? {
            name: updatedPlayers['2'].name,
            ready: updatedPlayers['2'].ready || false
          } : { name: playerName, ready: false }
        });
      });

    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  const determineWinner = () => {
    const player1 = solutions['1'];
    const player2 = solutions['2'];

    console.log('Solutions state:', solutions);

    // Only determine winner when both players have submitted
    if (!player1 || !player2) {
      return null;
    }

    // Log the verification results
    console.log('Verification results:', {
      player1: { name: currentPlayers.player1?.name, isCorrect: player1.isCorrect, time: player1.timeElapsed },
      player2: { name: currentPlayers.player2?.name, isCorrect: player2.isCorrect, time: player2.timeElapsed }
    });

    // First check for correct solutions
    if (player1.isCorrect && !player2.isCorrect) {
      return {
        name: currentPlayers.player1?.name || '',
        playerNumber: 1,
        timeElapsed: player1.timeElapsed,
        code: player1.code,
        loser: {
          name: currentPlayers.player2?.name || '',
          playerNumber: 2,
          timeElapsed: player2.timeElapsed,
          code: player2.code
        }
      };
    } else if (!player1.isCorrect && player2.isCorrect) {
      return {
        name: currentPlayers.player2?.name || '',
        playerNumber: 2,
        timeElapsed: player2.timeElapsed,
        code: player2.code,
        loser: {
          name: currentPlayers.player1?.name || '',
          playerNumber: 1,
          timeElapsed: player1.timeElapsed,
          code: player1.code
        }
      };
    } else if (player1.isCorrect && player2.isCorrect) {
      // Both correct, compare times
      if (player1.timeElapsed <= player2.timeElapsed) {
        return {
          name: currentPlayers.player1?.name || '',
          playerNumber: 1,
          timeElapsed: player1.timeElapsed,
          code: player1.code,
          loser: {
            name: currentPlayers.player2?.name || '',
            playerNumber: 2,
            timeElapsed: player2.timeElapsed,
            code: player2.code
          }
        };
      } else {
        return {
          name: currentPlayers.player2?.name || '',
          playerNumber: 2,
          timeElapsed: player2.timeElapsed,
          code: player2.code,
          loser: {
            name: currentPlayers.player1?.name || '',
            playerNumber: 1,
            timeElapsed: player1.timeElapsed,
            code: player1.code
          }
        };
      }
    }
    return null; // No winner if neither solution is correct
  };

  const handleReady = () => {
    setPlayerReady(true);
    socketService.emitPlayerReady(roomId, mode === 'create' ? 1 : 2);
  };

  const handleStartGame = () => {
    // Add 5 seconds to current time and round to nearest second
    const startTime = Math.ceil((Date.now() + 5000) / 1000) * 1000;
    socketService.emitGameStart(roomId, startTime);
    setBattleStartTime(startTime);
    setGameStarted(true);
  };

  useEffect(() => {
    socketService.subscribeToGameStart((startTime) => {
      console.log('Game starting at:', new Date(startTime).toISOString());
      setBattleStartTime(startTime);
      setGameStarted(true);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const currentPlayerNumber = mode === 'create' ? 1 : 2;
    
    socketService.subscribeToOpponentSolution(({ playerNumber, code, timeElapsed, isCorrect }) => {
      console.log('Received opponent solution:', { playerNumber, code, timeElapsed, isCorrect });
      
      // Only update if it's the opponent's solution
      if (playerNumber !== currentPlayerNumber) {
        setSolutions(prev => ({
          ...prev,
          [playerNumber]: { code, timeElapsed, isCorrect }
        }));
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [mode]);

  const handleSubmit = (code: string, timeElapsed: number, isCorrect: boolean) => {
    const playerNumber = mode === 'create' ? 1 : 2;
    console.log('Submitting solution:', { playerNumber, code, timeElapsed, isCorrect });
    
    // Update local solutions state
    setSolutions(prev => ({
      ...prev,
      [playerNumber]: { code, timeElapsed, isCorrect }
    }));

    // Emit to server
    socketService.submitSolution(
      playerNumber,
      code,
      timeElapsed,
      isCorrect
    );
  };

  useEffect(() => {
    socketService.subscribeToBattleComplete((data) => {
      console.log('Received battle complete:', data);
      if (data.winner && data.solutions) {
        // Force update states immediately
        setSolutions(data.solutions);
        setWinner({
          name: data.winner.name,
          playerNumber: data.winner.playerNumber,
          timeElapsed: data.winner.timeElapsed,
          code: data.winner.code,
          loser: {
            name: data.winner.loser.name,
            playerNumber: data.winner.loser.playerNumber,
            timeElapsed: data.winner.loser.timeElapsed,
            code: data.winner.loser.code
          }
        });

        // Show toast notification
        toast.success(`Battle Complete! ${data.winner.name} wins!`);
      }
    });
  }, []);

  useEffect(() => {
    if (Object.keys(solutions).length === 2) {
      console.log('Both solutions submitted:', solutions);
      const result = determineWinner();
      if (result) {
        console.log('Winner determined:', result);
        
        // Broadcast result to all players
        socketService.emitBattleComplete(roomId, {
          winner: result,
          solutions: {
            '1': solutions['1'],
            '2': solutions['2']
          }
        });

        // Update local state immediately
        setWinner(result);
      }
    }
  }, [solutions, currentPlayers, roomId]);

  const isWinner = winner?.playerNumber === (mode === 'create' ? 1 : 2);

  const handlePayment = async () => {
    if (!account) {
      try {
        await PaymentService.getConnectedWalletAddress();
      } catch (error) {
        toast.error('Please connect your wallet first');
        return;
      }
    }

    setIsLoading(true);
    try {
      console.log('Initiating payment for amount:', amount);
      const success = await PaymentService.payEntryFee(roomId, amount);
      
      if (success) {
        setHasPaid(true);
        toast.success('Payment successful! You can now start the battle.');
        socketService.emitPaymentComplete(roomId, mode === 'create' ? 1 : 2);
        
        // Enable ready state after payment
        setPlayerReady(true);
        socketService.emitPlayerReady(roomId, mode === 'create' ? 1 : 2);
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWinnerPayment = async (winnerAddress: string) => {
    try {
      const success = await PaymentService.transferWinningsToWinner(winnerAddress, amount);
      if (success) {
        toast.success('Prize transferred to winner!');
      }
    } catch (error) {
      console.error('Prize transfer failed:', error);
      toast.error('Failed to transfer prize');
    }
  };

  useEffect(() => {
    socketService.subscribeToBattleComplete((data) => {
      if (data.winner && data.solutions) {
        setSolutions(data.solutions);
        setWinner(data.winner);

        // Transfer winnings if you're the host
        if (mode === 'create' && data.winner.walletAddress) {
          handleWinnerPayment(data.winner.walletAddress);
        }
      }
    });
  }, [mode]);

  useEffect(() => {
    socketService.subscribeToPaymentComplete((data) => {
      setPlayersPaymentStatus(prev => ({
        ...prev,
        [data.playerNumber === 1 ? 'player1' : 'player2']: true
      }));
    });
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      if (!account) {
        try {
          const address = await PaymentService.getConnectedWalletAddress();
          console.log('Wallet connected:', address);
        } catch (error) {
          console.log('No wallet connected');
        }
      }
    };
    
    checkWallet();
  }, [account]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <CodingEnvironment
            playerNumber={mode === 'create' ? 1 : 2}
            playerName={playerName}
            startTime={battleStartTime}
            onSubmit={handleSubmit}
          />
          {winner && (
            <div className="battle-result mt-8">
              <BattleResult
                winner={{
                  name: winner.name,
                  playerNumber: winner.playerNumber,
                  timeElapsed: winner.timeElapsed,
                  code: winner.code
                }}
                loser={{
                  name: winner.loser.name,
                  playerNumber: winner.loser.playerNumber,
                  timeElapsed: winner.loser.timeElapsed,
                  code: winner.loser.code
                }}
                bothSolved={solutions['1']?.isCorrect && solutions['2']?.isCorrect}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <div className="space-y-6">
          {mode === 'create' ? (
            // Creator's view
            <>
              <div>
                <h2 className="text-2xl font-bold mb-4">Waiting for Opponent</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Input value={roomId} readOnly />
                  <Button size="icon" variant="outline" onClick={copyRoomId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this room ID with your opponent
                </p>
              </div>

              {/* Players List */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Players</h3>
                <div className="space-y-4">
                  {/* Player 1 */}
                  <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {currentPlayers.player1?.name || 'Waiting...'}
                      </span>
                    </div>
                    {currentPlayers.player1?.ready && (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {currentPlayers.player2?.name || 'Waiting for opponent...'}
                      </span>
                    </div>
                    {currentPlayers.player2?.ready && (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Ready and Start Buttons */}
                {currentPlayers.player1 && currentPlayers.player2 && !gameStarted && (
                  <div className="space-y-4 mt-4">
                    {!playersPaymentStatus[mode === 'create' ? 'player1' : 'player2'] ? (
                      <Button 
                        className="w-full" 
                        onClick={handlePayment}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          `Pay Entry Fee (${amount} ETH)`
                        )}
                      </Button>
                    ) : (
                      <div className="text-center text-green-500">
                        Payment Complete ✓
                        {!playersPaymentStatus[mode === 'create' ? 'player2' : 'player1'] && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Waiting for other player's payment...
                          </p>
                        )}
                      </div>
                    )}
                    {playersPaymentStatus.player1 && playersPaymentStatus.player2 && mode === 'create' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={handleStartGame}
                      >
                        Start Battle
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Joiner's view
            !roomId ? (
              // Join Room Form
              <div>
                <h2 className="text-2xl font-bold mb-4">Join Battle Room</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Enter room ID"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleJoinRoom}
                    disabled={!joinRoomId}
                  >
                    Join Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Battle Room</h2>
                  
                  {/* Players List */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Players</h3>
                    <div className="space-y-4">
                      {/* Opponent (Player 1) */}
                      <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {currentPlayers.player1?.name || 'Waiting...'}
                          </span>
                        </div>
                        {currentPlayers.player1?.ready && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                            Ready
                          </span>
                        )}
                      </div>

                      {/* You (Player 2) */}
                      <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">You ({playerName})</span>
                        </div>
                        {currentPlayers.player2?.ready && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Payment Button for Joiner */}
                    {currentPlayers.player1 && currentPlayers.player2 && !gameStarted && (
                      <div className="space-y-4 mt-4">
                        {!playersPaymentStatus[mode === 'create' ? 'player1' : 'player2'] ? (
                          <Button 
                            className="w-full" 
                            onClick={handlePayment}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing Payment...
                              </>
                            ) : (
                              `Pay Entry Fee (${amount} ETH)`
                            )}
                          </Button>
                        ) : (
                          <div className="text-center text-green-500">
                            Payment Complete ✓
                            {!playersPaymentStatus[mode === 'create' ? 'player2' : 'player1'] && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Waiting for other player's payment...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </Card>
    </div>
  );
} 