import { useState, useEffect, useCallback } from "react";

export interface UseTimerOptions {
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  interval?: number;
}

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  isCompleted: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  setTime: (time: number) => void;
}

export function useTimer(
  initialTime: number = 0,
  options: UseTimerOptions = {}
): UseTimerReturn {
  const { onComplete, onTick, interval = 1000 } = options;
  
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const start = useCallback(() => {
    if (time > 0) {
      setIsRunning(true);
      setIsCompleted(false);
    }
  }, [time]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    const resetTime = newTime ?? initialTime;
    setTime(resetTime);
    setIsRunning(false);
    setIsCompleted(false);
  }, [initialTime]);

  const updateTime = useCallback((newTime: number) => {
    setTime(newTime);
    setIsCompleted(false);
  }, []);

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          
          // Call onTick callback
          if (onTick) {
            onTick(newTime);
          }

          // Check if timer completed
          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
            
            if (onComplete) {
              onComplete();
            }
            
            return 0;
          }

          return newTime;
        });
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, time, onComplete, onTick, interval]);

  // Reset completed state when time changes externally
  useEffect(() => {
    if (time > 0 && isCompleted) {
      setIsCompleted(false);
    }
  }, [time, isCompleted]);

  return {
    time,
    isRunning,
    isCompleted,
    start,
    pause,
    stop,
    reset,
    setTime: updateTime,
  };
}

// Preset timer hooks for common use cases
export function usePomodoroTimer(onComplete?: () => void) {
  return useTimer(25 * 60, { onComplete }); // 25 minutes
}

export function useBreakTimer(onComplete?: () => void) {
  return useTimer(5 * 60, { onComplete }); // 5 minutes
}

export function useDeepWorkTimer(onComplete?: () => void) {
  return useTimer(90 * 60, { onComplete }); // 90 minutes
}

// Stopwatch functionality (counting up)
export function useStopwatch(options: UseTimerOptions = {}): UseTimerReturn {
  const { onTick, interval = 1000 } = options;
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
  }, []);

  const setTimeValue = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  // Stopwatch effect (counting up)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          
          if (onTick) {
            onTick(newTime);
          }

          return newTime;
        });
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, onTick, interval]);

  return {
    time,
    isRunning,
    isCompleted: false,
    start,
    pause,
    stop,
    reset,
    setTime: setTimeValue,
  };
}
