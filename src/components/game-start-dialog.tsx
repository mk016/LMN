'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';

interface GameStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (data: GameStartData) => void;
  onCreateRoom: (data: GameStartData) => void;
}

export interface GameStartData {
  playerName: string;
  amount: string;
  language: string;
}

export function GameStartDialog({ isOpen, onClose, onJoinRoom, onCreateRoom }: GameStartDialogProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GameStartData>({
    playerName: '',
    amount: '0.01',
    language: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (!data.playerName || !data.amount || !data.language) {
      return;
    }
    setStep(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Enter Battle Details' : 'Choose Room Option'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                value={data.playerName}
                onChange={(e) => setData({ ...data, playerName: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label>Select Amount (ETH)</Label>
              <Select
                value={data.amount}
                onValueChange={(value) => setData({ ...data, amount: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.01">0.01 ETH</SelectItem>
                  <SelectItem value="0.02">0.02 ETH</SelectItem>
                  <SelectItem value="0.05">0.05 ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Programming Language</Label>
              <Select
                value={data.language}
                onValueChange={(value) => setData({ ...data, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleNext}
              disabled={!data.playerName || !data.amount || !data.language}
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onCreateRoom(data)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create New Room'
              )}
            </Button>
            <Button
              className="w-full"
              onClick={() => onJoinRoom(data)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Join Existing Room'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 