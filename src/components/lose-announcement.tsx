import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Card } from './ui/card';

interface LoseAnnouncementProps {
  winner: {
    name: string;
    timeElapsed: number;
  };
}

export function LoseAnnouncement({ winner }: LoseAnnouncementProps) {
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
          <XCircle className="h-16 w-16 text-red-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-red-500">Better Luck Next Time!</h2>
          <div className="space-y-2 mt-4">
            <p className="text-xl text-primary">{winner.name} won the battle</p>
            <p className="text-muted-foreground">
              in {Math.floor(winner.timeElapsed / 60)}m {winner.timeElapsed % 60}s
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4"
        >
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              className="inline-block mx-1"
              animate={{
                y: [-5, 5],
                transition: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1
                }
              }}
            >
              😢
            </motion.span>
          ))}
        </motion.div>
      </Card>
    </motion.div>
  );
} 