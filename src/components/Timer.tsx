import React, { useEffect, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  onTimeUpdate?: (timeLeft: number) => void;
}

export function Timer({ duration, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  return (
    <div className="flex items-center gap-2 text-xl font-mono">
      <TimerIcon className="w-6 h-6" />
      <span className={timeLeft <= 10 ? 'text-red-500' : ''}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
}