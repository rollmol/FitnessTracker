import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, SkipForward } from "lucide-react";

interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = () => {
    setTimeLeft(prev => prev + 30);
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  return (
    <Card className="gradient-accent text-white mx-6 mb-6 rest-timer-animation">
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Rest Time</h3>
        
        {/* Circular Progress Indicator */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="white"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg"
            onClick={addTime}
          >
            <Plus className="w-4 h-4 mr-1" />
            +30s
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg"
            onClick={onSkip}
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>
        </div>
      </div>
    </Card>
  );
}
