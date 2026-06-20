import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Play, RotateCcw, Trophy, Palette } from "lucide-react";

interface StroopTestProps {
  onGameEnd: () => void;
}

interface Round {
  word: string;
  color: string;
  isCongruent: boolean;
}

interface GameState {
  rounds: Round[];
  currentRound: number;
  gameStatus: 'idle' | 'playing' | 'complete';
  score: number;
  correct: number;
  total: number;
}

interface ReactionTimes {
  congruent: number[];
  incongruent: number[];
}

const COLORS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#F59E0B' },
  { name: 'PURPLE', hex: '#8B5CF6' },
  { name: 'PINK', hex: '#EC4899' },
];

const TOTAL_ROUNDS = 20;

export default function StroopTest({ onGameEnd }: StroopTestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    rounds: [],
    currentRound: 0,
    gameStatus: 'idle',
    score: 0,
    correct: 0,
    total: 0,
  });

  const [reactionTimes, setReactionTimes] = useState<ReactionTimes>({
    congruent: [],
    incongruent: [],
  });

  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      return await apiRequest('POST', '/api/brain-games/scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain-games/scores"] });
    }
  });

  const generateRounds = useCallback((): Round[] => {
    const rounds: Round[] = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const wordIndex = Math.floor(Math.random() * COLORS.length);
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      const isCongruent = wordIndex === colorIndex;
      rounds.push({
        word: COLORS[wordIndex].name,
        color: COLORS[colorIndex].hex,
        isCongruent,
      });
    }
    return rounds;
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const keyNum = parseInt(e.key);
    if (isNaN(keyNum) || keyNum < 1 || keyNum > 6) return;
    
    handleColorSelect(keyNum - 1);
  }, [gameState.gameStatus]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.currentRound < gameState.rounds.length) {
      setRoundStartTime(Date.now());
    }
  }, [gameState.currentRound, gameState.gameStatus, gameState.rounds.length]);

  const handleColorSelect = (colorIndex: number) => {
    if (gameState.gameStatus !== 'playing' || gameState.currentRound >= gameState.rounds.length) return;

    const currentRound = gameState.rounds[gameState.currentRound];
    const reactionTime = Date.now() - roundStartTime;
    const isCorrect = colorIndex === COLORS.findIndex(c => c.hex === currentRound.color);

    const newReactionTimes = { ...reactionTimes };
    if (currentRound.isCongruent) {
      newReactionTimes.congruent.push(reactionTime);
    } else {
      newReactionTimes.incongruent.push(reactionTime);
    }

    if (isCorrect) {
      const points = Math.max(10, 110 - Math.floor(reactionTime / 50));
      const newCorrect = gameState.correct + 1;
      const newTotal = gameState.total + 1;
      const newScore = gameState.score + points;
      
      setReactionTimes(newReactionTimes);
      setGameState(prev => ({
        ...prev,
        score: newScore,
        correct: newCorrect,
        total: newTotal,
        currentRound: prev.currentRound + 1,
      }));
    } else {
      setReactionTimes(newReactionTimes);
      setGameState(prev => ({
        ...prev,
        total: prev.total + 1,
        currentRound: prev.currentRound + 1,
      }));
    }
  };

  const startGame = () => {
    const rounds = generateRounds();
    setGameState({
      rounds,
      currentRound: 0,
      gameStatus: 'playing',
      score: 0,
      correct: 0,
      total: 0,
    });
    setReactionTimes({ congruent: [], incongruent: [] });
    setGameStartTime(new Date());
  };

  const endGame = async () => {
    if (gameStartTime) {
      const duration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      const accuracy = gameState.total > 0 ? Math.round((gameState.correct / gameState.total) * 100) : 0;
      
      const avgCongruent = reactionTimes.congruent.length > 0
        ? reactionTimes.congruent.reduce((a, b) => a + b, 0) / reactionTimes.congruent.length
        : 0;
      const avgIncongruent = reactionTimes.incongruent.length > 0
        ? reactionTimes.incongruent.reduce((a, b) => a + b, 0) / reactionTimes.incongruent.length
        : 0;
      const stroopEffect = avgIncongruent - avgCongruent;

      try {
        await saveScoreMutation.mutateAsync({
          gameType: 'stroop',
          score: gameState.score,
          level: accuracy,
          duration: duration,
        });
        
        toast({
          title: "🧠 Stroop Test Complete!",
          description: `Score: ${gameState.score} • Accuracy: ${accuracy}% • Stroop Effect: ${Math.round(stroopEffect)}ms`,
        });
      } catch (error) {
        toast({
          title: "Game Complete",
          description: `Score: ${gameState.score} • Accuracy: ${accuracy}%`,
        });
      }
    }
  };

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.currentRound >= TOTAL_ROUNDS) {
      setGameState(prev => ({ ...prev, gameStatus: 'complete' }));
    }
  }, [gameState.currentRound, gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'complete') {
      endGame();
    }
  }, [gameState.gameStatus]);

  const resetGame = () => {
    setGameState({
      rounds: [],
      currentRound: 0,
      gameStatus: 'idle',
      score: 0,
      correct: 0,
      total: 0,
    });
    setReactionTimes({ congruent: [], incongruent: [] });
    setGameStartTime(null);
  };

  const progress = (gameState.currentRound / TOTAL_ROUNDS) * 100;

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
                <CardTitle className="text-xl">Stroop Effect Test</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Name the ink color, not the word
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={onGameEnd} data-testid="button-exit-game">
              Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

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
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {gameState.correct}/{gameState.total}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {gameState.total > 0 ? Math.round((gameState.correct / gameState.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {gameState.currentRound}/{TOTAL_ROUNDS}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Round</p>
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
                <Palette className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready for the Stroop Test?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Words will appear in different colored ink. Name the COLOR of the ink, not the word itself.
                  Use keys 1-6 to select colors.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {COLORS.map((color, index) => (
                    <Badge 
                      key={color.name}
                      variant="outline"
                      className="text-xs"
                      style={{ color: color.hex, borderColor: color.hex }}
                    >
                      {index + 1}: {color.name}
                    </Badge>
                  ))}
                </div>
                
                <Button
                  size="lg"
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-start-stroop-game"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Test
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
                {gameState.gameStatus === 'playing' && gameState.rounds.length > gameState.currentRound && (
                  <>
                    <div className="text-center py-12">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={gameState.currentRound}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h1 
                            className="text-6xl font-bold mb-4"
                            style={{ color: gameState.rounds[gameState.currentRound].color }}
                            data-testid="stroop-word"
                          >
                            {gameState.rounds[gameState.currentRound].word}
                          </h1>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {gameState.rounds[gameState.currentRound].isCongruent ? 'Congruent' : 'Incongruent'} trial
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      {COLORS.map((color, index) => (
                        <motion.button
                          key={color.name}
                          onClick={() => handleColorSelect(index)}
                          className="aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform flex items-center justify-center"
                          style={{ backgroundColor: color.hex }}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05 }}
                          data-testid={`color-button-${index + 1}`}
                        >
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </motion.button>
                      ))}
                    </div>
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
                      Test Complete!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Score: <strong>{gameState.score}</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Accuracy: <strong>{gameState.total > 0 ? Math.round((gameState.correct / gameState.total) * 100) : 0}%</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Stroop Effect: <strong>{reactionTimes.incongruent.length > 0 && reactionTimes.congruent.length > 0 
                        ? Math.round((reactionTimes.incongruent.reduce((a, b) => a + b, 0) / reactionTimes.incongruent.length) - 
                                   (reactionTimes.congruent.reduce((a, b) => a + b, 0) / reactionTimes.congruent.length))
                        : 0}ms</strong>
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
                        <Trophy className="mr-2 h-4 w-4" />
                        Finish
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {gameState.gameStatus === 'playing' && (
            <div className="max-w-md mx-auto mt-6">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}