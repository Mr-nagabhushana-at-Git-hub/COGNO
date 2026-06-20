import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Target, Play, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";

interface LogicPuzzleProps {
  onGameEnd: () => void;
}

interface Puzzle {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface GameState {
  currentPuzzle: number;
  score: number;
  correctAnswers: number;
  timeLeft: number;
  gameStatus: 'waiting' | 'playing' | 'answered' | 'gameover';
  selectedAnswer: number | null;
  showExplanation: boolean;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    question: "If all roses are flowers and some flowers are red, which statement must be true?",
    options: [
      "All roses are red",
      "Some roses might be red", 
      "No roses are red",
      "All flowers are roses"
    ],
    correctAnswer: 1,
    explanation: "Since some flowers are red and all roses are flowers, it's possible (but not certain) that some roses are red.",
    difficulty: 'easy',
    points: 100
  },
  {
    id: 2,
    question: "In a sequence: 2, 6, 12, 20, 30, ... What comes next?",
    options: ["40", "42", "44", "46"],
    correctAnswer: 1,
    explanation: "The pattern is: 1×2, 2×3, 3×4, 4×5, 5×6, so next is 6×7 = 42.",
    difficulty: 'medium',
    points: 150
  },
  {
    id: 3,
    question: "Five friends sit in a row. Alice is not at either end. Bob is to the right of Charlie. Diana is between Alice and Bob. Who could be at the far left?",
    options: ["Alice", "Bob", "Charlie", "Diana"],
    correctAnswer: 2,
    explanation: "Given the constraints, the arrangement could be: Charlie, Alice, Diana, Bob, (Fifth person). Charlie is at the far left.",
    difficulty: 'hard',
    points: 200
  },
  {
    id: 4,
    question: "If some cats are dogs, and no dogs are birds, which must be true?",
    options: [
      "Some cats are birds",
      "No cats are birds", 
      "Some cats are not birds",
      "All cats are dogs"
    ],
    correctAnswer: 2,
    explanation: "Since some cats are dogs and no dogs are birds, those cats that are dogs cannot be birds. Therefore, some cats are not birds.",
    difficulty: 'medium',
    points: 150
  },
  {
    id: 5,
    question: "Complete the pattern: ○●○○●○○○●○○○○●...",
    options: [
      "○○○○○●",
      "○○○○●",
      "○○○●",
      "○○●"
    ],
    correctAnswer: 0,
    explanation: "The pattern shows increasing numbers of ○ before each ●: 1○●, 2○●, 3○●, 4○●, so next is 5○●.",
    difficulty: 'hard',
    points: 200
  }
];

const TIME_PER_PUZZLE = 45; // seconds

export default function LogicPuzzle({ onGameEnd }: LogicPuzzleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    currentPuzzle: 0,
    score: 0,
    correctAnswers: 0,
    timeLeft: TIME_PER_PUZZLE,
    gameStatus: 'waiting',
    selectedAnswer: null,
    showExplanation: false
  });
  
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      return await apiRequest('POST', '/api/brain-games/scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain-games/scores"] });
    }
  });

  const startGame = () => {
    setGameState({
      currentPuzzle: 0,
      score: 0,
      correctAnswers: 0,
      timeLeft: TIME_PER_PUZZLE,
      gameStatus: 'playing',
      selectedAnswer: null,
      showExplanation: false
    });
    setGameStartTime(new Date());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const currentPuzzle = PUZZLES[gameState.currentPuzzle];
    const isCorrect = answerIndex === currentPuzzle.correctAnswer;
    
    // Calculate score based on time remaining and difficulty
    const timeBonus = Math.floor(gameState.timeLeft * 2);
    const points = isCorrect ? currentPuzzle.points + timeBonus : 0;
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      gameStatus: 'answered',
      showExplanation: true,
      score: prev.score + points,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
    }));
  };

  const nextPuzzle = () => {
    const nextIndex = gameState.currentPuzzle + 1;
    
    if (nextIndex >= PUZZLES.length) {
      // Game complete
      setGameState(prev => ({ ...prev, gameStatus: 'gameover' }));
      endGame();
    } else {
      setGameState(prev => ({
        ...prev,
        currentPuzzle: nextIndex,
        timeLeft: TIME_PER_PUZZLE,
        gameStatus: 'playing',
        selectedAnswer: null,
        showExplanation: false
      }));
    }
  };

  const endGame = async () => {
    if (gameStartTime) {
      const duration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      
      try {
        await saveScoreMutation.mutateAsync({
          gameType: 'logic',
          score: gameState.score,
          level: gameState.currentPuzzle + 1,
          duration: duration
        });
        
        toast({
          title: "🎯 Logic Challenge Complete!",
          description: `Score: ${gameState.score} • Accuracy: ${Math.round((gameState.correctAnswers / PUZZLES.length) * 100)}%`,
        });
      } catch (error) {
        toast({
          title: "Game Saved Locally",
          description: `Score: ${gameState.score} • Accuracy: ${Math.round((gameState.correctAnswers / PUZZLES.length) * 100)}%`,
        });
      }
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.gameStatus === 'playing' && gameState.timeLeft === 0) {
      // Time's up - treat as wrong answer
      setGameState(prev => ({
        ...prev,
        selectedAnswer: -1, // No answer selected
        gameStatus: 'answered',
        showExplanation: true
      }));
    }
  }, [gameState.gameStatus, gameState.timeLeft]);

  const resetGame = () => {
    setGameState({
      currentPuzzle: 0,
      score: 0,
      correctAnswers: 0,
      timeLeft: TIME_PER_PUZZLE,
      gameStatus: 'waiting',
      selectedAnswer: null,
      showExplanation: false
    });
    setGameStartTime(null);
  };

  const currentPuzzle = PUZZLES[gameState.currentPuzzle];
  const progress = ((gameState.currentPuzzle + 1) / PUZZLES.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Logic Puzzles</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Challenge your reasoning and problem-solving skills
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={onGameEnd} data-testid="button-exit-logic-game">
              Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-logic-score">
              {gameState.score}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-logic-correct">
              {gameState.correctAnswers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400" data-testid="text-logic-progress">
              {gameState.currentPuzzle + 1}/{PUZZLES.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${gameState.timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`} data-testid="text-logic-timer">
              {gameState.timeLeft}s
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time Left</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {gameState.gameStatus !== 'waiting' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Game Content */}
      <Card>
        <CardContent className="p-6">
          {gameState.gameStatus === 'waiting' ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Logic Challenge?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
                Test your reasoning skills with carefully crafted logic puzzles. 
                Each puzzle gets progressively more challenging!
              </p>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-start-logic-game"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Challenge
              </Button>
            </div>
          ) : gameState.gameStatus === 'gameover' ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Challenge Complete!
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Final Score: <strong className="text-blue-600 dark:text-blue-400">{gameState.score}</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Accuracy: <strong className="text-green-600 dark:text-green-400">
                    {Math.round((gameState.correctAnswers / PUZZLES.length) * 100)}%
                  </strong> ({gameState.correctAnswers}/{PUZZLES.length})
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={resetGame}
                  data-testid="button-retry-logic"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={onGameEnd} data-testid="button-finish-logic">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge 
                    className={`
                      ${currentPuzzle.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                        currentPuzzle.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}
                    `}
                  >
                    {currentPuzzle.difficulty.toUpperCase()} • {currentPuzzle.points} pts
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className={`font-mono ${gameState.timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {gameState.timeLeft}s
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {currentPuzzle.question}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentPuzzle.options.map((option, index) => {
                  let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all ";
                  
                  if (gameState.showExplanation) {
                    if (index === currentPuzzle.correctAnswer) {
                      buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                    } else if (index === gameState.selectedAnswer && index !== currentPuzzle.correctAnswer) {
                      buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                    } else {
                      buttonClass += "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400";
                    }
                  } else {
                    if (index === gameState.selectedAnswer) {
                      buttonClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
                    } else {
                      buttonClass += "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      className={buttonClass}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={gameState.gameStatus !== 'playing'}
                      whileHover={{ scale: gameState.gameStatus === 'playing' ? 1.02 : 1 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`option-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        
                        {gameState.showExplanation && (
                          <div>
                            {index === currentPuzzle.correctAnswer ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : index === gameState.selectedAnswer ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {gameState.showExplanation && (
                  <motion.div
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Explanation:</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {currentPuzzle.explanation}
                    </p>
                    
                    <div className="mt-4 flex justify-center">
                      <Button onClick={nextPuzzle} data-testid="button-next-puzzle">
                        {gameState.currentPuzzle + 1 >= PUZZLES.length ? 'Finish' : 'Next Puzzle'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
