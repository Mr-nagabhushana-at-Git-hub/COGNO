import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Heart, Target, Footprints, Timer, Camera } from "lucide-react";
import StepCounter from "@/components/fitness/step-counter";
import ExerciseGuide from "@/components/fitness/exercise-guide";

export default function Fitness() {
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);

  const { data: fitnessData, isLoading } = useQuery({
    queryKey: ["/api/fitness"],
  });

  const todayData = fitnessData?.[0] || {
    steps: 0,
    exerciseMinutes: 0,
    caloriesBurned: 0
  };

  const workoutTypes = [
    {
      id: "cardio",
      title: "Cardio Blast",
      description: "High-intensity cardiovascular workout",
      duration: "20 min",
      calories: "200-300",
      icon: Heart,
      color: "bg-red-500",
      difficulty: "Medium"
    },
    {
      id: "strength",
      title: "Strength Training",
      description: "Build muscle with bodyweight exercises",
      duration: "30 min", 
      calories: "150-250",
      icon: Dumbbell,
      color: "bg-blue-500",
      difficulty: "Hard"
    },
    {
      id: "yoga",
      title: "Mindful Yoga",
      description: "Flexibility and mindfulness practice",
      duration: "25 min",
      calories: "100-150", 
      icon: Target,
      color: "bg-green-500",
      difficulty: "Easy"
    }
  ];

  const dailyGoals = {
    steps: 10000,
    exerciseMinutes: 30,
    calories: 300
  };

  if (activeWorkout) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveWorkout(null)}
            data-testid="button-back-to-fitness"
          >
            ← Back to Fitness
          </Button>
        </div>
        <ExerciseGuide 
          workoutType={activeWorkout} 
          onWorkoutEnd={() => setActiveWorkout(null)} 
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Fitness Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          AI-powered exercise monitoring with real-time camera feedback and progress tracking
        </p>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Footprints className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Steps</span>
              </div>
              <Badge variant="outline">
                {Math.round((todayData.steps / dailyGoals.steps) * 100)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayData.steps.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  / {dailyGoals.steps.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(todayData.steps / dailyGoals.steps) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Exercise</span>
              </div>
              <Badge variant="outline">
                {Math.round((todayData.exerciseMinutes / dailyGoals.exerciseMinutes) * 100)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayData.exerciseMinutes}
                </span>
                <span className="text-sm text-gray-500">
                  / {dailyGoals.exerciseMinutes} min
                </span>
              </div>
              <Progress 
                value={(todayData.exerciseMinutes / dailyGoals.exerciseMinutes) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-medium text-gray-900 dark:text-white">Calories</span>
              </div>
              <Badge variant="outline">
                {Math.round((todayData.caloriesBurned / dailyGoals.calories) * 100)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayData.caloriesBurned}
                </span>
                <span className="text-sm text-gray-500">
                  / {dailyGoals.calories} kcal
                </span>
              </div>
              <Progress 
                value={(todayData.caloriesBurned / dailyGoals.calories) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Counter Widget */}
      <div className="mb-8">
        <StepCounter currentSteps={todayData.steps} />
      </div>

      {/* Workout Programs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI-Guided Workouts
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Camera-powered exercise monitoring with real-time form feedback
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workoutTypes.map((workout, index) => {
              const Icon = workout.icon;
              
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${workout.color} rounded-xl flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {workout.difficulty}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {workout.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {workout.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{workout.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Calories:</span>
                          <span className="font-medium">{workout.calories}</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full"
                        onClick={() => setActiveWorkout(workout.id)}
                        data-testid={`button-start-${workout.id}`}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Steps</span>
                <span className="text-sm text-gray-500">This Week Average: 8,245</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 7}, (_, i) => {
                  const daySteps = Math.floor(Math.random() * 12000 + 5000);
                  const percentage = (daySteps / dailyGoals.steps) * 100;
                  return (
                    <div key={i} className="text-center">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 flex items-end">
                        <div 
                          className="w-full bg-blue-500 rounded"
                          style={{ height: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Exercise Minutes</span>
                <span className="text-sm text-gray-500">This Week Average: 28 min</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({length: 7}, (_, i) => {
                  const dayMinutes = Math.floor(Math.random() * 45 + 15);
                  const percentage = (dayMinutes / dailyGoals.exerciseMinutes) * 100;
                  return (
                    <div key={i} className="text-center">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 flex items-end">
                        <div 
                          className="w-full bg-green-500 rounded"
                          style={{ height: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
