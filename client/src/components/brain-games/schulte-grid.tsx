import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Play, RotateCcw, Trophy, Grid3X3, Timer } from "lucide-react";

interface SchulteGridProps {
  onGameEnd: () => void;
}

interface GameState {
  grid: number[];
  targetNumber: number;
  mistakes: number;
  gameStatus: 'idle' | 'playing' | 'complete';
  elapsedTime: number;
}

const GRID_SIZE = 5;
const TOTAL_NUMBERS = 25;

export default function SchulteGrid({ onGameEnd }: SchulteGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    targetNumber: 1,
    mistakes: 0,
    gameStatus: 'idle',
    elapsedTime: 0,
  });

  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      return await apiRequest('POST', '/api/brain-games/scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain-games/scores"] });
    }
  });

  useEffect(() => {
    const savedBest = localStorage.getItem('schulte-best-time');
    if (savedBest) {
      setBestTime(parseInt(savedBest, 10));
    }
  }, []);

  const generateGrid = useCallback((): number[] => {
    const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }, []);

  const startGame = () => {
    const grid = generateGrid();
    setGameState({
      grid,
      targetNumber: 1,
      mistakes: 0,
      gameStatus: 'playing',
      elapsedTime: 0,
    });
    setGameStartTime(new Date());
  };

  const handleNumberClick = (number: number) => {
    if (gameState.gameStatus !== 'playing') return;

    if (number === gameState.targetNumber) {
      if (number === TOTAL_NUMBERS) {
        setGameState(prev => ({ ...prev, gameStatus: 'complete' }));
      } else {
        setGameState(prev => ({ ...prev, targetNumber: prev.targetNumber + 1 }));
      }
    } else {
      setGameState(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
    }
  };

  const endGame = async () => {
    if (gameStartTime) {
      const completionTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      const timeWithPenalties = completionTime + (gameState.mistakes * 2);

      if (!bestTime || timeWithPenalties < bestTime) {
        setBestTime(timeWithPenalties);
        localStorage.setItem('schulte-best-time', timeWithPenalties.toString());
      }

      try {
        await saveScoreMutation.mutateAsync({
          gameType: 'schulte',
          score: Math.max(0, 1000 - timeWithPenalties * 10),
          level: 1,
          duration: timeWithPenalties,
          metadata: {
            mistakes: gameState.mistakes,
            baseTime: completionTime,
          }
        });
        
        toast({
          title: "🧠 Schulte Grid Complete!",
          description: `Time: ${timeWithPenalties}s • Mistakes: ${gameState.mistakes}`,
        });
      } catch (error) {
        toast({
          title: "Game Complete",
          description: `Time: ${timeWithPenalties}s • Mistakes: ${gameState.mistakes}`,
        });
      }
    }
  };

  useEffect(() => {
    if (gameState.gameStatus === 'complete') {
      endGame();
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameStartTime) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000) + (prev.mistakes * 2)
        }));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus, gameStartTime]);

  const resetGame = () => {
    setGameState({
      grid: [],
      targetNumber: 1,
      mistakes: 0,
      gameStatus: 'idle',
      elapsedTime: 0,
    });
    setGameStartTime(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Schulte Grid</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Find numbers in ascending order
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={onGameEnd} data-testid="button-exit-game">
              Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-target-number">
              {gameState.targetNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {gameState.mistakes}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mistakes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bestTime !== null ? `${bestTime}s` : '--'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Best Time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {gameState.gameStatus === 'idle' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <Grid3X3 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready for Schulte Grid?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Click numbers 1 through 25 in ascending order as quickly as possible.
                  Each mistake adds a 2-second penalty.
                </p>
                
                <Button
                  size="lg"
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-start-schulte-game"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Game
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {gameState.gameStatus === 'playing' && (
                  <>
                    {/* Timer Display */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Timer className="h-5 w-5 text-gray-500" />
                      <span className="text-lg font-mono text-gray-700 dark:text-gray-300">
                        {gameState.elapsedTime}s
                      </span>
                    </div>

                    {/* Schulte Grid */}
                    <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                      {gameState.grid.map((number) => (
                        <motion.button
                          key={number}
                          onClick={() => handleNumberClick(number)}
                          className={`
                            aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                            ${number === gameState.targetNumber 
                              ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/50 scale-105 shadow-lg' 
                              : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          `}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: number === gameState.targetNumber ? 1.1 : 1.05 }}
                          disabled={number < gameState.targetNumber - 1}
                          data-testid={`schulte-cell-${number}`}
                        >
                          <span className={`
                            text-2xl font-bold
                            ${number === gameState.targetNumber 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-gray-700 dark:text-gray-300'
                            }
                          `}>
                            {number}
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Click the highlighted number, then continue in order
                    </p>
                  </>
                )}

                {gameState.gameStatus === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Grid Complete!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Final Time: <strong>{gameState.elapsedTime}s</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Mistakes: <strong>{gameState.mistakes}</strong> (penalty: +{gameState.mistakes * 2}s)
                    </p>
                    {bestTime && (
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Best Time: <strong>{bestTime}s</strong>
                      </p>
                    )}
                    
                    <div className="flex justify-center space-x-3">
                      <Button
                        variant="outline"
                        onClick={resetGame}
                        data-testid="button-play-again"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Play Again
                      </Button>
                      <Button onClick={onGameEnd} data-testid="button-finish-game">
                        <Trophy className="mr-2 h-4 w-4" />
                        Finish
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}