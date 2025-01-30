import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Code, ArrowLeft, Home } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface BattleResultProps {
  winner: {
    name: string;
    playerNumber: number;
    timeElapsed: number;
    code: string;
  };
  loser: {
    name: string;
    playerNumber: number;
    timeElapsed: number;
    code: string;
  };
  bothSolved: boolean;
}

export function BattleResult({ winner, loser, bothSolved }: BattleResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto py-8"
    >
      <div className="container max-w-4xl mx-auto">
        <Card className="p-8">
          {/* Winner Banner */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Battle Results
            </h1>
            {bothSolved && (
              <p className="text-muted-foreground">
                Both players solved correctly! Winner determined by fastest time.
              </p>
            )}
          </motion.div>

          {/* Results Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Winner Card */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-green-500">Winner</h3>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="space-y-4">
                  <p className="font-medium text-xl">{winner.name}</p>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{Math.floor(winner.timeElapsed / 60)}m {winner.timeElapsed % 60}s</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Solution:</h4>
                    <pre className="bg-background p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{winner.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Loser Card */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-red-500">Runner-up</h3>
                  <Code className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  <p className="font-medium text-xl">{loser.name}</p>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{Math.floor(loser.timeElapsed / 60)}m {loser.timeElapsed % 60}s</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Solution:</h4>
                    <pre className="bg-background p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{loser.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link href="/">
              <Button variant="outline" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/battle">
              <Button size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Battle
              </Button>
            </Link>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
} 