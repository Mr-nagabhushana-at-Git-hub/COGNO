import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Brain, Dumbbell, Bot, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const activityIcons = {
  task: CheckCircle2,
  focus: Target,
  brain: Brain,
  fitness: Dumbbell,
  agent: Bot,
  default: Clock
};

const activityColors = {
  task: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  focus: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", 
  brain: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  fitness: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  agent: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  default: "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400"
};

interface Activity {
  id: string;
  type: keyof typeof activityIcons;
  title: string;
  description: string;
  timestamp: Date;
  status?: 'completed' | 'started' | 'failed';
}

// Generate sample activities based on recent app usage
const generateRecentActivities = (): Activity[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'task',
      title: 'Completed "Website Redesign Research"',
      description: 'Task moved to completed',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
      status: 'completed'
    },
    {
      id: '2', 
      type: 'focus',
      title: 'Started focus session for "Client Presentation"',
      description: 'Pomodoro timer started',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      status: 'started'
    },
    {
      id: '3',
      type: 'brain',
      title: 'Completed brain training - Memory Challenge',
      description: 'Score: 850 points',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      status: 'completed'
    },
    {
      id: '4',
      type: 'fitness',
      title: 'Finished 20-minute guided workout',
      description: 'Cardio session completed',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed'
    },
    {
      id: '5',
      type: 'agent',
      title: 'AI Agent sent 3 automated emails',
      description: 'Email automation completed',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: 'completed'
    }
  ];
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function RecentActivity() {
  // In a real app, this would fetch from an API
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: () => Promise.resolve(generateRecentActivities()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Your activity will appear here as you use the app
              </p>
            </div>
          ) : (
            activities?.map((activity, index) => {
              const Icon = activityIcons[activity.type] || activityIcons.default;
              const colorClass = activityColors[activity.type] || activityColors.default;
              
              return (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`activity-item-${activity.id}`}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  
                  {activity.status && (
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-xs flex-shrink-0",
                        activity.status === 'completed' && "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
                        activity.status === 'started' && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
                        activity.status === 'failed' && "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                      )}
                    >
                      {activity.status}
                    </Badge>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
