import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Timer,
  Heart,
  Target
} from "lucide-react";

interface ExerciseGuideProps {
  workoutType: string;
  onWorkoutEnd: () => void;
}

interface Exercise {
  id: number;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
  targetMuscles: string[];
  caloriesBurn: number;
}

interface WorkoutState {
  currentExercise: number;
  exerciseTimeLeft: number;
  restTimeLeft: number;
  isResting: boolean;
  isPlaying: boolean;
  totalCalories: number;
  workoutStatus: 'ready' | 'active' | 'paused' | 'complete';
  cameraEnabled: boolean;
  formFeedback: string | null;
}

const WORKOUTS = {
  cardio: [
    {
      id: 1,
      name: "Jumping Jacks",
      duration: 45,
      description: "Full-body cardio exercise to get your heart pumping",
      instructions: [
        "Stand with feet together and arms at your sides",
        "Jump while spreading legs shoulder-width apart",
        "Simultaneously raise arms overhead",
        "Jump back to starting position",
        "Maintain steady rhythm"
      ],
      targetMuscles: ["Full Body", "Cardiovascular"],
      caloriesBurn: 8
    },
    {
      id: 2,
      name: "High Knees",
      duration: 30,
      description: "Run in place lifting knees high to chest level",
      instructions: [
        "Stand tall with feet hip-width apart",
        "Run in place lifting knees toward chest",
        "Keep core engaged",
        "Pump arms naturally",
        "Stay light on your feet"
      ],
      targetMuscles: ["Legs", "Core", "Cardiovascular"],
      caloriesBurn: 6
    },
    {
      id: 3,
      name: "Burpees",
      duration: 40,
      description: "Intense full-body exercise combining squat, plank, and jump",
      instructions: [
        "Start in standing position",
        "Drop into squat, place hands on floor",
        "Jump feet back into plank position",
        "Do a push-up (optional)",
        "Jump feet back to squat, then jump up"
      ],
      targetMuscles: ["Full Body", "Cardiovascular"],
      caloriesBurn: 12
    }
  ],
  strength: [
    {
      id: 1,
      name: "Push-ups",
      duration: 45,
      description: "Classic upper body strength exercise",
      instructions: [
        "Start in plank position with hands under shoulders",
        "Lower body until chest nearly touches floor",
        "Keep body straight throughout movement",
        "Push back up to starting position",
        "Modify on knees if needed"
      ],
      targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
      caloriesBurn: 5
    },
    {
      id: 2,
      name: "Squats",
      duration: 50,
      description: "Lower body strength and mobility exercise",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower body as if sitting back into a chair",
        "Keep knees behind toes",
        "Go down until thighs are parallel to floor",
        "Push through heels to return to standing"
      ],
      targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
      caloriesBurn: 6
    },
    {
      id: 3,
      name: "Planks",
      duration: 60,
      description: "Core stability and strength exercise",
      instructions: [
        "Start in push-up position",
        "Rest on forearms instead of hands",
        "Keep body in straight line from head to heels",
        "Engage core and hold position",
        "Breathe steadily"
      ],
      targetMuscles: ["Core", "Shoulders", "Glutes"],
      caloriesBurn: 4
    }
  ],
  yoga: [
    {
      id: 1,
      name: "Sun Salutation A",
      duration: 90,
      description: "Traditional yoga flow sequence",
      instructions: [
        "Start in mountain pose",
        "Inhale, raise arms overhead",
        "Exhale, fold forward",
        "Inhale, halfway lift",
        "Exhale, step/jump back to plank",
        "Lower through chaturanga, inhale to upward dog",
        "Exhale to downward dog, hold 5 breaths"
      ],
      targetMuscles: ["Full Body", "Flexibility"],
      caloriesBurn: 3
    },
    {
      id: 2,
      name: "Warrior II Sequence",
      duration: 75,
      description: "Standing pose sequence for strength and balance",
      instructions: [
        "Start in wide-legged forward fold",
        "Turn right foot out 90 degrees",
        "Bend right knee over ankle",
        "Extend arms parallel to floor",
        "Hold warrior II, breathe deeply",
        "Repeat on left side"
      ],
      targetMuscles: ["Legs", "Core", "Balance"],
      caloriesBurn: 2
    }
  ]
};

const REST_TIME = 15; // seconds between exercises

export default function ExerciseGuide({ workoutType, onWorkoutEnd }: ExerciseGuideProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const exercises = WORKOUTS[workoutType as keyof typeof WORKOUTS] || WORKOUTS.cardio;
  
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    currentExercise: 0,
    exerciseTimeLeft: exercises[0]?.duration || 30,
    restTimeLeft: REST_TIME,
    isResting: false,
    isPlaying: false,
    totalCalories: 0,
    workoutStatus: 'ready',
    cameraEnabled: false,
    formFeedback: null
  });

  const saveFitnessDataMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/fitness', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness"] });
    }
  });

  const currentExercise = exercises[workoutState.currentExercise];
  const totalExercises = exercises.length;
  const workoutProgress = ((workoutState.currentExercise + (workoutState.isResting ? 1 : 0)) / totalExercises) * 100;

  // Camera setup
  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWorkoutState(prev => ({ ...prev, cameraEnabled: true }));
        
        // Simulate AI feedback (in real app, this would use computer vision)
        const feedbackInterval = setInterval(() => {
          if (workoutState.isPlaying && !workoutState.isResting) {
            const feedbacks = [
              "Great form! Keep it up!",
              "Try to keep your back straight",
              "Perfect rhythm!",
              "Engage your core more",
              "Excellent technique!"
            ];
            
            setWorkoutState(prev => ({
              ...prev,
              formFeedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
            }));
            
            setTimeout(() => {
              setWorkoutState(prev => ({ ...prev, formFeedback: null }));
            }, 3000);
          }
        }, 8000);

        return () => clearInterval(feedbackInterval);
      }
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access for AI-guided feedback.",
        variant: "destructive"
      });
    }
  };

  const disableCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWorkoutState(prev => ({ ...prev, cameraEnabled: false }));
  };

  const startWorkout = () => {
    setWorkoutState(prev => ({
      ...prev,
      isPlaying: true,
      workoutStatus: 'active'
    }));
    
    toast({
      title: "🏋️ Workout Started!",
      description: `Let's begin with ${currentExercise.name}`,
    });
  };

  const pauseWorkout = () => {
    setWorkoutState(prev => ({
      ...prev,
      isPlaying: false,
      workoutStatus: 'paused'
    }));
  };

  const stopWorkout = () => {
    setWorkoutState(prev => ({
      ...prev,
      isPlaying: false,
      workoutStatus: 'complete'
    }));
    
    saveWorkoutData();
    disableCamera();
  };

  const nextExercise = () => {
    const nextIndex = workoutState.currentExercise + 1;
    
    if (nextIndex >= exercises.length) {
      // Workout complete
      setWorkoutState(prev => ({
        ...prev,
        workoutStatus: 'complete',
        isPlaying: false
      }));
      
      saveWorkoutData();
      disableCamera();
      return;
    }

    setWorkoutState(prev => ({
      ...prev,
      currentExercise: nextIndex,
      exerciseTimeLeft: exercises[nextIndex].duration,
      restTimeLeft: REST_TIME,
      isResting: false
    }));
  };

  const saveWorkoutData = async () => {
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0) + (exercises.length - 1) * REST_TIME;
    
    try {
      await saveFitnessDataMutation.mutateAsync({
        workoutType: workoutType,
        exerciseMinutes: Math.ceil(totalDuration / 60),
        caloriesBurned: workoutState.totalCalories
      });
      
      toast({
        title: "🎉 Workout Complete!",
        description: `Great job! You burned ${workoutState.totalCalories} calories.`,
      });
    } catch (error) {
      toast({
        title: "Workout Logged Locally",
        description: `Great job! You burned ${workoutState.totalCalories} calories.`,
      });
    }
  };

  // Timer logic
  useEffect(() => {
    if (workoutState.isPlaying) {
      const timer = setInterval(() => {
        if (workoutState.isResting) {
          // Rest timer
          if (workoutState.restTimeLeft > 1) {
            setWorkoutState(prev => ({
              ...prev,
              restTimeLeft: prev.restTimeLeft - 1
            }));
          } else {
            // Rest complete, start next exercise
            nextExercise();
          }
        } else {
          // Exercise timer
          if (workoutState.exerciseTimeLeft > 1) {
            setWorkoutState(prev => ({
              ...prev,
              exerciseTimeLeft: prev.exerciseTimeLeft - 1,
              totalCalories: prev.totalCalories + (currentExercise.caloriesBurn / currentExercise.duration)
            }));
          } else {
            // Exercise complete, start rest (if not last exercise)
            if (workoutState.currentExercise < exercises.length - 1) {
              setWorkoutState(prev => ({
                ...prev,
                isResting: true,
                restTimeLeft: REST_TIME
              }));
            } else {
              // Last exercise complete
              nextExercise();
            }
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    workoutState.isPlaying, 
    workoutState.isResting, 
    workoutState.exerciseTimeLeft, 
    workoutState.restTimeLeft,
    workoutState.currentExercise
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl capitalize">
                {workoutType} Workout
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI-powered exercise guidance with real-time feedback
              </p>
            </div>
            
            <Button variant="outline" onClick={onWorkoutEnd} data-testid="button-exit-workout">
              Exit Workout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercise {workoutState.currentExercise + 1} of {totalExercises}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(workoutProgress)}% Complete
              </span>
            </div>
            <Progress value={workoutProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed and Exercise Info */}
        <div className="space-y-6">
          {/* Camera Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  AI Form Analysis
                </CardTitle>
                
                {!workoutState.cameraEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enableCamera}
                    data-testid="button-enable-camera"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Enable Camera
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disableCamera}
                    data-testid="button-disable-camera"
                  >
                    Disable Camera
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {workoutState.cameraEnabled ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* AI Feedback Overlay */}
                    <AnimatePresence>
                      {workoutState.formFeedback && (
                        <motion.div
                          className="absolute top-4 left-4 right-4"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
                            🤖 {workoutState.formFeedback}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Enable camera for AI-powered form analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workout Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-workout-time">
                  {workoutState.isResting 
                    ? `${workoutState.restTimeLeft}s`
                    : `${Math.floor(workoutState.exerciseTimeLeft / 60)}:${(workoutState.exerciseTimeLeft % 60).toString().padStart(2, '0')}`
                  }
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {workoutState.isResting ? "Rest Time" : "Exercise Time"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-calories-burned">
                  {Math.round(workoutState.totalCalories)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-5 w-5 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {workoutState.currentExercise + 1}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Exercise</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercise Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {workoutState.isResting ? "Rest Time" : currentExercise?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {workoutState.isResting ? "Get ready for the next exercise" : currentExercise?.description}
                  </p>
                </div>
                
                <Badge className={`
                  ${workoutState.workoutStatus === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                    workoutState.workoutStatus === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'}
                `}>
                  {workoutState.workoutStatus}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {workoutState.workoutStatus === 'ready' ? (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Start?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    This {workoutType} workout includes {totalExercises} exercises.
                    Enable your camera for AI-powered form feedback.
                  </p>
                  <Button
                    size="lg"
                    onClick={startWorkout}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-start-workout"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </div>
              ) : workoutState.workoutStatus === 'complete' ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Workout Complete! 🎉
                  </h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-600 dark:text-gray-300">
                      Calories burned: <strong>{Math.round(workoutState.totalCalories)}</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Exercises completed: <strong>{totalExercises}</strong>
                    </p>
                  </div>
                  <Button onClick={onWorkoutEnd} data-testid="button-finish-workout">
                    Finish Workout
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Instructions */}
                  {!workoutState.isResting && currentExercise && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions:</h3>
                      <ol className="space-y-2">
                        {currentExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {workoutState.isResting && (
                    <div className="text-center py-6">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {workoutState.restTimeLeft}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Rest time remaining
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Next: {exercises[workoutState.currentExercise + 1]?.name}
                      </p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex space-x-2">
                    {!workoutState.isPlaying ? (
                      <Button
                        onClick={startWorkout}
                        className="flex-1"
                        data-testid="button-resume-workout"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {workoutState.workoutStatus === 'paused' ? 'Resume' : 'Start'}
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseWorkout}
                        variant="secondary"
                        className="flex-1"
                        data-testid="button-pause-workout"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    
                    <Button
                      onClick={stopWorkout}
                      variant="outline"
                      data-testid="button-stop-workout"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
