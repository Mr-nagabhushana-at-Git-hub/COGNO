import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Footprints, Target, TrendingUp, Award, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StepCounterProps {
  currentSteps: number;
}

export default function StepCounter({ currentSteps }: StepCounterProps) {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const dailyGoal = 10000;
  const progress = Math.min((currentSteps / dailyGoal) * 100, 100);
  const stepsRemaining = Math.max(dailyGoal - currentSteps, 0);

  // Simulate step tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate step detection (in real app, this would use device sensors)
        if (Math.random() > 0.7) {
          const newSteps = Math.floor(Math.random() * 3) + 1;
          setSessionSteps(prev => prev + newSteps);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setSessionStartTime(new Date());
    setSessionSteps(0);
    toast({
      title: "👟 Step Tracking Started",
      description: "Keep moving! Your steps are being counted.",
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (sessionSteps > 0) {
      toast({
        title: "📊 Session Complete",
        description: `Great job! You walked ${sessionSteps} steps this session.`,
      });
    }
  };

  const getMotivationalMessage = () => {
    if (currentSteps >= dailyGoal) {
      return "🎉 Goal achieved! You're crushing it today!";
    } else if (currentSteps >= dailyGoal * 0.8) {
      return "🔥 Almost there! Just a bit more to reach your goal!";
    } else if (currentSteps >= dailyGoal * 0.5) {
      return "💪 Great progress! You're halfway to your goal!";
    } else {
      return "🚀 Let's get moving! Every step counts!";
    }
  };

  const getStreakInfo = () => {
    // In a real app, this would come from user data
    return {
      current: 7,
      best: 23
    };
  };

  const streak = getStreakInfo();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-blue-500" />
            Daily Step Counter
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              🔥 {streak.current} day streak
            </Badge>
            {isTracking && (
              <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Tracking
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Step Display */}
        <div className="text-center space-y-4">
          <motion.div
            className="relative inline-block"
            key={currentSteps + sessionSteps}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-step-count">
              {(currentSteps + sessionSteps).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              steps today
            </div>
          </motion.div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress to goal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(progress)}% • {stepsRemaining.toLocaleString()} remaining
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Session Tracking */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Walking Session</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isTracking && sessionStartTime && (
                <>Started {sessionStartTime.toLocaleTimeString()}</>
              )}
            </div>
          </div>

          {isTracking && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {sessionSteps}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    steps this session
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {sessionStartTime && (
                      <>
                        {Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000)} min
                      </>
                    )}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    duration
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {!isTracking ? (
              <Button
                onClick={startTracking}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-start-tracking"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Tracking
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                variant="outline"
                className="flex-1 border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                data-testid="button-stop-tracking"
              >
                <Pause className="mr-2 h-4 w-4" />
                Stop Session
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round((currentSteps + sessionSteps) * 0.0008)} km
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">distance</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round((currentSteps + sessionSteps) * 0.04)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">calories</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {streak.best}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">best streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
