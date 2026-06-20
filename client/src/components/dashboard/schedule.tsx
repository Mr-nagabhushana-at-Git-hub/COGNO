import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarPlus, Video, AlertTriangle, Brain, Dumbbell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  duration: number; // in minutes
  type: 'meeting' | 'task' | 'brain-training' | 'fitness' | 'break';
  priority: 'high' | 'medium' | 'low';
  location?: string;
}

const eventColors = {
  meeting: "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500 text-blue-900 dark:text-blue-100",
  task: "bg-green-50 dark:bg-green-950/20 border-l-green-500 text-green-900 dark:text-green-100",
  'brain-training': "bg-purple-50 dark:bg-purple-950/20 border-l-purple-500 text-purple-900 dark:text-purple-100",
  fitness: "bg-red-50 dark:bg-red-950/20 border-l-red-500 text-red-900 dark:text-red-100",
  break: "bg-gray-50 dark:bg-gray-800/50 border-l-gray-400 text-gray-900 dark:text-gray-100"
};

const eventIcons = {
  meeting: Video,
  task: AlertTriangle,
  'brain-training': Brain,
  fitness: Dumbbell,
  break: Clock
};

// Generate today's schedule
const generateTodaysSchedule = (): ScheduleEvent[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      id: '1',
      title: 'Team Standup Meeting',
      description: 'Daily sync with development team',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
      duration: 30,
      type: 'meeting',
      priority: 'medium',
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Client Presentation',
      description: 'Present project proposal to stakeholders',
      startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
      duration: 60,
      type: 'task',
      priority: 'high',
      location: 'Main Conference Room'
    },
    {
      id: '3',
      title: 'Brain Training Session',
      description: 'Logic puzzles and memory games',
      startTime: new Date(today.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM
      duration: 20,
      type: 'brain-training',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Evening Workout',
      description: 'Camera-guided cardio session',
      startTime: new Date(today.getTime() + 18 * 60 * 60 * 1000), // 6:00 PM
      duration: 45,
      type: 'fitness',
      priority: 'medium'
    },
    {
      id: '5',
      title: 'Project Review',
      description: 'Review completed tasks and plan tomorrow',
      startTime: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7:00 PM
      duration: 30,
      type: 'task',
      priority: 'medium'
    }
  ];
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const isUpcoming = (event: ScheduleEvent): boolean => {
  const now = new Date();
  const eventEnd = new Date(event.startTime.getTime() + event.duration * 60 * 1000);
  return eventEnd > now;
};

const isActive = (event: ScheduleEvent): boolean => {
  const now = new Date();
  const eventEnd = new Date(event.startTime.getTime() + event.duration * 60 * 1000);
  return now >= event.startTime && now < eventEnd;
};

export default function Schedule() {
  // In a real app, this would fetch from a calendar API
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/schedule"],
    queryFn: () => Promise.resolve(generateTodaysSchedule()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4 p-3 border-l-4 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-16 space-y-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
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
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-add-event">
            <CalendarPlus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!events?.length ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No events scheduled</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add events to see your daily schedule
              </p>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-create-first-event">
                Create Event
              </Button>
            </div>
          ) : (
            events.map((event, index) => {
              const Icon = eventIcons[event.type];
              const colorClass = eventColors[event.type];
              const upcoming = isUpcoming(event);
              const active = isActive(event);
              
              return (
                <motion.div
                  key={event.id}
                  className={cn(
                    "flex items-center space-x-4 p-3 border-l-4 rounded-r-lg cursor-pointer transition-all hover:shadow-sm",
                    colorClass,
                    active && "ring-2 ring-primary/20 shadow-md",
                    !upcoming && "opacity-60"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`schedule-item-${event.id}`}
                >
                  <div className="text-center flex-shrink-0 w-16">
                    <p className="text-xs font-medium">
                      {formatTime(event.startTime)}
                    </p>
                    <p className="text-xs opacity-75">
                      {event.duration}min
                    </p>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm">
                        {event.title}
                      </p>
                      {active && (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs">
                          Active
                        </Badge>
                      )}
                      {event.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-75">
                      {event.description}
                    </p>
                    {event.location && (
                      <p className="text-xs opacity-60 mt-1">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 opacity-60" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" data-testid="button-schedule-focus">
              <Clock className="h-3 w-3 mr-1" />
              Schedule Focus Time
            </Button>
            <Button variant="outline" size="sm" data-testid="button-schedule-break">
              <Calendar className="h-3 w-3 mr-1" />
              Add Break
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
