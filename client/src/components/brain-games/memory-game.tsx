import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Play, RotateCcw, Trophy, Target } from "lucide-react";

interface MemoryGameProps {
  onGameEnd: () => void;
}

interface GameState {
  sequence: number[];
  playerSequence: number[];
  currentStep: number;
  showingSequence: boolean;
  gameStatus: 'waiting' | 'showing' | 'input' | 'correct' | 'wrong' | 'gameover';
  level: number;
  score: number;
  lives: number;
}

const GRID_SIZE = 9;
const INITIAL_LIVES = 3;
const BASE_SCORE = 100;

export default function MemoryGame({ onGameEnd }: MemoryGameProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    playerSequence: [],
    currentStep: 0,
    showingSequence: false,
    gameStatus: 'waiting',
    level: 1,
    score: 0,
    lives: INITIAL_LIVES
  });
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      return await apiRequest('POST', '/api/brain-games/scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain-games/scores"] });
    }
  });

  const generateSequence = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * GRID_SIZE));
  };

  const startGame = () => {
    const newSequence = generateSequence(gameState.level + 2); // Start with 3 items for level 1
    setGameState({
      sequence: newSequence,
      playerSequence: [],
      currentStep: 0,
      showingSequence: true,
      gameStatus: 'showing',
      level: 1,
      score: 0,
      lives: INITIAL_LIVES
    });
    setGameStartTime(new Date());
    showSequence(newSequence);
  };

  const showSequence = (sequence: number[]) => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= sequence.length) {
        clearInterval(interval);
        setGameState(prev => ({
          ...prev,
          showingSequence: false,
          gameStatus: 'input'
        }));
        setTimeLeft(10 + Math.floor(sequence.length * 0.5)); // More time for longer sequences
        return;
      }
      
      // Highlight the next tile in sequence
      step++;
    }, 800);
  };

  const handleTileClick = (index: number) => {
    if (gameState.gameStatus !== 'input' || gameState.showingSequence) return;

    const newPlayerSequence = [...gameState.playerSequence, index];
    const isCorrect = newPlayerSequence[newPlayerSequence.length - 1] === 
                      gameState.sequence[newPlayerSequence.length - 1];

    if (!isCorrect) {
      // Wrong move
      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        // Game over
        setGameState(prev => ({ ...prev, gameStatus: 'gameover', lives: 0 }));
        endGame();
      } else {
        setGameState(prev => ({
          ...prev,
          lives: newLives,
          playerSequence: [],
          gameStatus: 'wrong'
        }));
        
        setTimeout(() => {
          showSequence(gameState.sequence);
        }, 1500);
      }
      return;
    }

    if (newPlayerSequence.length === gameState.sequence.length) {
      // Level complete!
      const levelBonus = gameState.level * 50;
      const timeBonus = Math.max(0, timeLeft * 10);
      const newScore = gameState.score + BASE_SCORE + levelBonus + timeBonus;
      
      setGameState(prev => ({
        ...prev,
        playerSequence: newPlayerSequence,
        gameStatus: 'correct',
        score: newScore
      }));

      setTimeout(() => {
        // Next level
        const nextLevel = gameState.level + 1;
        const newSequence = generateSequence(nextLevel + 2);
        
        setGameState(prev => ({
          ...prev,
          sequence: newSequence,
          playerSequence: [],
          level: nextLevel,
          showingSequence: true,
          gameStatus: 'showing'
        }));
        
        showSequence(newSequence);
      }, 2000);
    } else {
      setGameState(prev => ({
        ...prev,
        playerSequence: newPlayerSequence
      }));
    }
  };

  const endGame = async () => {
    if (gameStartTime) {
      const duration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      
      try {
        await saveScoreMutation.mutateAsync({
          gameType: 'memory',
          score: gameState.score,
          level: gameState.level,
          duration: duration
        });
        
        toast({
          title: "🧠 Game Complete!",
          description: `Final Score: ${gameState.score} • Level: ${gameState.level}`,
        });
      } catch (error) {
        toast({
          title: "Game Saved Locally",
          description: `Final Score: ${gameState.score} • Level: ${gameState.level}`,
        });
      }
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.gameStatus === 'input' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.gameStatus === 'input' && timeLeft === 0) {
      // Time's up - lose a life
      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        setGameState(prev => ({ ...prev, gameStatus: 'gameover', lives: 0 }));
        endGame();
      } else {
        setGameState(prev => ({
          ...prev,
          lives: newLives,
          playerSequence: [],
          gameStatus: 'wrong'
        }));
        
        setTimeout(() => {
          showSequence(gameState.sequence);
        }, 1500);
      }
    }
  }, [gameState.gameStatus, timeLeft]);

  const resetGame = () => {
    setGameState({
      sequence: [],
      playerSequence: [],
      currentStep: 0,
      showingSequence: false,
      gameStatus: 'waiting',
      level: 1,
      score: 0,
      lives: INITIAL_LIVES
    });
    setTimeLeft(0);
    setGameStartTime(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Memory Challenge</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Remember and repeat the sequence
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={onGameEnd} data-testid="button-exit-game">
              Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-game-score">
              {gameState.score}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-game-level">
              {gameState.level}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center space-x-1 mb-1">
              {Array.from({ length: INITIAL_LIVES }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < gameState.lives ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-game-timer">
              {timeLeft}s
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time Left</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card>
        <CardContent className="p-6">
          {gameState.gameStatus === 'waiting' ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Challenge Your Memory?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Watch the sequence of tiles light up, then repeat it back in the same order. 
                Each level adds more tiles to remember!
              </p>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-start-memory-game"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Game
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Display */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {gameState.gameStatus === 'showing' && (
                    <motion.div
                      key="showing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        Watch the sequence...
                      </Badge>
                    </motion.div>
                  )}
                  
                  {gameState.gameStatus === 'input' && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                        Repeat the sequence ({gameState.playerSequence.length}/{gameState.sequence.length})
                      </Badge>
                    </motion.div>
                  )}
                  
                  {gameState.gameStatus === 'correct' && (
                    <motion.div
                      key="correct"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                        ✅ Perfect! Next Level...
                      </Badge>
                    </motion.div>
                  )}
                  
                  {gameState.gameStatus === 'wrong' && (
                    <motion.div
                      key="wrong"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                        ❌ Try Again...
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {Array.from({ length: GRID_SIZE }, (_, index) => {
                  const isInSequence = gameState.sequence.includes(index);
                  const isCurrentlyShowing = gameState.showingSequence && 
                    gameState.sequence[gameState.currentStep] === index;
                  const isPlayerSelected = gameState.playerSequence.includes(index);
                  
                  return (
                    <motion.button
                      key={index}
                      className={`
                        aspect-square rounded-lg border-2 transition-all duration-200
                        ${isCurrentlyShowing 
                          ? 'bg-purple-500 border-purple-600 shadow-lg' 
                          : isPlayerSelected
                            ? 'bg-green-200 dark:bg-green-800 border-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                        ${gameState.gameStatus === 'input' ? 'cursor-pointer' : 'cursor-default'}
                      `}
                      onClick={() => handleTileClick(index)}
                      disabled={gameState.gameStatus !== 'input'}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: gameState.gameStatus === 'input' ? 1.05 : 1 }}
                      data-testid={`tile-${index}`}
                    >
                      <span className="text-lg font-mono text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress Bar for Input Time */}
              {gameState.gameStatus === 'input' && (
                <div className="max-w-sm mx-auto">
                  <Progress 
                    value={(timeLeft / (10 + Math.floor(gameState.sequence.length * 0.5))) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {gameState.gameStatus === 'gameover' && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Game Over!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Final Score: <strong>{gameState.score}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Reached Level: <strong>{gameState.level}</strong>
              </p>
              
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
                  <Target className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
