import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Brain, Heart, TrendingUp, TrendingDown } from "lucide-react";

const statCards = [
  {
    title: "Focus Time",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    getValue: (analytics: any) => `${Math.floor(analytics?.focusTimeMinutes / 60 || 0)}h ${analytics?.focusTimeMinutes % 60 || 0}m`,
    change: "+12%",
    isPositive: true
  },
  {
    title: "Tasks Done",
    icon: CheckCircle, 
    color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    getValue: (analytics: any) => `${analytics?.tasksCompleted || 0} of ${analytics?.tasksToday || 0}`,
    getChange: (analytics: any) => `${analytics?.completionRate || 0}%`,
    isPositive: true
  },
  {
    title: "Brain Training",
    icon: Brain,
    color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    getValue: (analytics: any) => `${analytics?.brainGamesPlayed || 0} games`,
    change: "+8%",
    isPositive: true
  },
  {
    title: "Steps",
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    getValue: (analytics: any) => `${analytics?.steps?.toLocaleString() || 0}`,
    change: "82%",
    isPositive: true
  }
];

export default function StatsCards() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const value = card.getValue(analytics);
        const change = card.getChange ? card.getChange(analytics) : card.change;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {card.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Today
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <motion.p 
                      className="text-lg font-bold text-gray-900 dark:text-white"
                      key={value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      data-testid={`text-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {value}
                    </motion.p>
                    
                    <div className="flex items-center justify-end space-x-1">
                      {card.isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-xs font-semibold ${
                        card.isPositive 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
