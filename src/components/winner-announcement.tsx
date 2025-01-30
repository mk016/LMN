import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from './ui/card';

interface WinnerAnnouncementProps {
  winner: {
    name: string;
    playerNumber: number;
    timeElapsed: number;
  };
  bothSolved: boolean;
}

export function WinnerAnnouncement({ winner, bothSolved }: WinnerAnnouncementProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <Card className="p-8 text-center space-y-4">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="flex justify-center"
        >
          <Trophy className="h-16 w-16 text-yellow-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold">Winner!</h2>
          <div className="space-y-2 mt-4">
            <p className="text-xl text-primary">{winner.name}</p>
            <p className="text-muted-foreground">
              Solved in {Math.floor(winner.timeElapsed / 60)}m {winner.timeElapsed % 60}s
            </p>
            {bothSolved && (
              <p className="text-sm text-muted-foreground mt-2">
                Both players solved correctly! Winner determined by fastest time.
              </p>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4"
        >
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="inline-block mx-1"
              animate={{
                y: [-10, 10],
                transition: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1
                }
              }}
            >
              🎉
            </motion.span>
          ))}
        </motion.div>
      </Card>
    </motion.div>
  );
} 