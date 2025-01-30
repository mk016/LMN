'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, Code2, Sword, Trophy, Wallet } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Code Battle Arena
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Compete in real-time coding battles, win ETH rewards, and prove your programming prowess.
          </p>
          <Link href="/battle">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Start Battle
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-6 w-6 text-purple-400" />
                  Real-time Coding
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Write and test your code in real-time against other developers
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-green-400" />
                  ETH Rewards
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Win ETH prizes for successful solutions and victories
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Compete for top positions and showcase your skills
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Connect Wallet</h3>
              <p className="text-gray-400">Connect your MetaMask wallet and pay the entry fee</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sword className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Code Battle</h3>
              <p className="text-gray-400">Solve coding challenges against other players</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Win Rewards</h3>
              <p className="text-gray-400">Win ETH prizes for successful solutions</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-0">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Battle?
              </h3>
              <p className="text-gray-300 mb-6">
                Join the arena and start competing for ETH rewards
              </p>
              <Link href="/battle">
                <Button size="lg" variant="secondary">
                  Enter Arena
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 