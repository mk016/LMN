'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card } from '@/components/ui/card';
import { ArrowRight, Code2, Sword, Trophy, Wallet, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { GameStartDialog, type GameStartData } from '@/components/game-start-dialog';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { account, isConnecting, connectWallet } = useWallet();
  const [showGameDialog, setShowGameDialog] = useState(false);
  const router = useRouter();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleStartBattle = () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    setShowGameDialog(true);
  };

  const handleCreateRoom = async (data: GameStartData) => {
    const roomId = Math.random().toString(36).substring(7);
    router.push(`/battle?room=${roomId}&mode=create&name=${data.playerName}&amount=${data.amount}&language=${data.language}`);
  };

  const handleJoinRoom = async (data: GameStartData) => {
    router.push(`/battle?mode=join&name=${data.playerName}&amount=${data.amount}&language=${data.language}`);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-bold text-xl">CodeBattle</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : account ? (
                `${account.slice(0, 6)}...${account.slice(-4)}`
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-32">
        <motion.div 
          className="text-center space-y-6"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.div
            variants={fadeIn}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight relative">
              Code Battle Arena
            </h1>
          </motion.div>

          <motion.p 
            variants={fadeIn}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Compete in real-time coding battles, win ETH rewards, and prove your programming prowess
            in our decentralized arena.
          </motion.p>

          <motion.div variants={fadeIn} className="space-x-4">
            <Button 
              size="lg" 
              className="group"
              onClick={handleStartBattle}
            >
              Start Battle
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-20"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {[
            {
              icon: <Code2 className="h-6 w-6 text-primary" />,
              title: "Real-time Coding",
              description: "Battle against other developers in real-time coding challenges"
            },
            {
              icon: <Wallet className="h-6 w-6 text-green-500" />,
              title: "ETH Rewards",
              description: "Win cryptocurrency rewards for your coding victories"
            },
            {
              icon: <Trophy className="h-6 w-6 text-yellow-500" />,
              title: "Global Leaderboard",
              description: "Climb the ranks and showcase your skills worldwide"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="group"
            >
              <Card className="p-6 h-full transition-colors hover:bg-muted/50">
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.section 
          className="py-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            variants={fadeIn}
            className="text-3xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Wallet className="h-8 w-8" />,
                title: "1. Connect Wallet",
                description: "Link your MetaMask wallet to get started"
              },
              {
                icon: <Sword className="h-8 w-8" />,
                title: "2. Choose Battle",
                description: "Select your difficulty and stake"
              },
              {
                icon: <Trophy className="h-8 w-8" />,
                title: "3. Win Rewards",
                description: "Complete challenges to earn ETH"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="text-center"
              >
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div 
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
            <div className="p-8 text-center space-y-6">
              <h3 className="text-2xl font-bold">
                Ready to Start Coding?
              </h3>
              <p className="text-muted-foreground">
                Join the arena and compete for ETH rewards
              </p>
              <Link href="/battle">
                <Button size="lg" className="group">
                  Enter Arena
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Add the GameStartDialog */}
        <GameStartDialog
          isOpen={showGameDialog}
          onClose={() => setShowGameDialog(false)}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </main>
    </div>
  );
};

export default HomePage;