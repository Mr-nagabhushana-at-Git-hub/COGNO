import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Play, RotateCcw, Trophy, Target, Timer } from "lucide-react";

interface MemoryMatchProps {
  onGameEnd: () => void;
}

interface CardType {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: CardType[];
  flippedIndices: number[];
  matchedPairs: number;
  moves: number;
  gameStatus: 'idle' | 'playing' | 'complete';
}

const SYMBOLS = ['△', '□', '◇', '○', '✦', '⬢', '✚', '∞', '◐', '✳', '⬟', '◉'];
const TOTAL_PAIRS = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(): CardType[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  const shuffled = shuffle(pairs);
  return shuffled.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false
  }));
}

const localStorageKey = 'memory-match-best-time';

export default function MemoryMatch({ onGameEnd }: MemoryMatchProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedIndices: [],
    matchedPairs: 0,
    moves: 0,
    gameStatus: 'idle'
  });

  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      setBestTime(parseInt(stored, 10));
    }
  }, []);

  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: { gameType: string; score: number; moves: number; duration: number }) => {
      return apiRequest("POST", "/api/brain-games/scores", scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain-games/scores"] });
    }
  });

  const calculateScore = useCallback((moves: number, duration: number): number => {
    const baseScore = 1000;
    const movePenalty = moves * 5;
    const timePenalty = Math.floor(duration * 0.5);
    return Math.max(0, baseScore - movePenalty - timePenalty);
  }, []);

  const checkMatch = useCallback((cardIndices: number[]) => {
    const [i, j] = cardIndices;
    return gameState.cards[i].symbol === gameState.cards[j].symbol;
  }, [gameState.cards]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus, gameStartTime]);

  useEffect(() => {
    if (gameState.flippedIndices.length === 2) {
      const [i, j] = gameState.flippedIndices;
      const isMatch = checkMatch([i, j]);

      if (isMatch) {
        setGameState(prev => ({
          ...prev,
          cards: prev.cards.map((card, idx) =>
            idx === i || idx === j ? { ...card, isMatched: true, isFlipped: true } : card
          ),
          matchedPairs: prev.matchedPairs + 1,
          flippedIndices: []
        }));
      } else {
        const timeout = setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map((card, idx) =>
              (idx === i || idx === j) ? { ...card, isFlipped: false } : card
            ),
            flippedIndices: []
          }));
        }, 900);
        return () => clearTimeout(timeout);
      }
    }
  }, [gameState.flippedIndices, checkMatch]);

  useEffect(() => {
    if (gameState.matchedPairs === TOTAL_PAIRS && gameState.gameStatus === 'playing' && gameStartTime) {
      const duration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      const finalScore = calculateScore(gameState.moves, duration);

      setGameState(prev => ({ ...prev, gameStatus: 'complete' }));

      const isNewBest = !bestTime || duration < bestTime;
      if (isNewBest) {
        setBestTime(duration);
        localStorage.setItem(localStorageKey, String(duration));
      }

      saveScoreMutation.mutate({
        gameType: 'memory-match',
        score: finalScore,
        moves: gameState.moves,
        duration
      });

      toast({
        title: isNewBest ? "🏆 New Best Time!" : "🎉 Game Complete!",
        description: `Score: ${finalScore} • Moves: ${gameState.moves} • Time: ${duration}s`,
      });
    }
  }, [gameState.matchedPairs, gameState.gameStatus, gameStartTime, gameState.moves, gameState.matchedPairs, bestTime, calculateScore, saveScoreMutation, toast]);

  const handleCardClick = (index: number) => {
    if (gameState.gameStatus !== 'playing') return;
    if (gameState.cards[index].isFlipped || gameState.cards[index].isMatched) return;
    if (gameState.flippedIndices.length >= 2) return;

    setGameState(prev => {
      const newCards = prev.cards.map((card, idx) =>
        idx === index ? { ...card, isFlipped: true } : card
      );
      const newFlipped = [...prev.flippedIndices, index];

      return {
        ...prev,
        cards: newCards,
        flippedIndices: newFlipped,
        moves: newFlipped.length === 2 ? prev.moves + 1 : prev.moves
      };
    });
  };

  const startGame = () => {
    const deck = createDeck();
    setGameState({
      cards: deck,
      flippedIndices: [],
      matchedPairs: 0,
      moves: 0,
      gameStatus: 'playing'
    });
    setGameStartTime(new Date());
    setElapsedSeconds(0);
  };

  const resetGame = () => {
    setGameState({
      cards: [],
      flippedIndices: [],
      matchedPairs: 0,
      moves: 0,
      gameStatus: 'idle'
    });
    setGameStartTime(null);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentScore = gameState.gameStatus === 'complete' && gameStartTime
    ? calculateScore(gameState.moves, Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000))
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Memory Match</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Find all matching symbol pairs
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onGameEnd} data-testid="button-exit-memory-match">
              Exit Game
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" data-testid="text-memory-moves">
              {gameState.moves}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Moves</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-memory-pairs">
              {gameState.matchedPairs} / {TOTAL_PAIRS}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pairs Found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Timer className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-memory-timer">
                {formatTime(elapsedSeconds)}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-memory-score">
              {currentScore || '-'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
          </CardContent>
        </Card>
      </div>

      {bestTime !== null && gameState.gameStatus !== 'playing' && (
        <div className="text-center">
          <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
            ⭐ Best Time: {formatTime(bestTime)}
          </Badge>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {gameState.gameStatus === 'idle' ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Memory Match Challenge
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2 max-w-md mx-auto">
                Flip two cards at a time to find matching symbol pairs. Find all {TOTAL_PAIRS} pairs as fast as you can!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Each pair uses the symbols: {SYMBOLS.join(' ')}
              </p>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700"
                data-testid="button-start-memory-match"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Game
              </Button>
            </div>
          ) : gameState.gameStatus === 'complete' ? (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Game Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                Final Score: <strong>{currentScore}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                Total Moves: <strong>{gameState.moves}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Time: <strong>{formatTime(elapsedSeconds)}</strong>
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={resetGame}
                  data-testid="button-play-again-memory"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button onClick={onGameEnd} data-testid="button-finish-memory">
                  <Target className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(4, minmax(0, 1fr))'
              }}
            >
              {gameState.cards.map((card, index) => {
                const isFlipped = card.isFlipped || card.isMatched;
                return (
                  <div
                    key={card.id}
                    className={`group relative h-16 sm:h-20 cursor-pointer select-none transition-all duration-300 ${
                      card.isMatched
                        ? 'ring-2 ring-emerald-400 dark:ring-emerald-300 scale-[0.98] shadow-emerald-200/70 dark:shadow-emerald-900/50 shadow-lg'
                        : 'hover:scale-105'
                    }`}
                    style={{ perspective: '1000px' }}
                    onClick={() => handleCardClick(index)}
                    data-testid={`memory-card-${index}`}
                  >
                    <motion.div
                      className="relative w-full h-full transform-3d"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      <div
                        className="absolute inset-0 rounded-lg border-2 bg-indigo-600 dark:bg-indigo-700 border-indigo-700 dark:border-indigo-500 flex items-center justify-center backface-hidden"
                      >
                        <span className="text-white text-lg font-bold">?</span>
                      </div>
                      <div
                        className="absolute inset-0 rounded-lg border-2 bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-800 flex items-center justify-center backface-hidden rotate-y-180"
                      >
                        <span className="text-2xl sm:text-3xl text-gray-800 dark:text-gray-100">
                          {card.symbol}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
