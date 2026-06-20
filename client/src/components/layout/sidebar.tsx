import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CheckSquare, 
  Brain, 
  Dumbbell, 
  HeartHandshake
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tasks & Matrix', href: '/tasks', icon: CheckSquare },
  { name: 'Mental Wellness', href: '/wellness', icon: HeartHandshake },
  { name: 'Brain Training', href: '/brain-training', icon: Brain },
  { name: 'Fitness Tracker', href: '/fitness', icon: Dumbbell },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Today's Progress
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Tasks</span>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400" data-testid="text-tasks-progress">
                8/12
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Focus Time</span>
              <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400" data-testid="text-focus-progress">
                4.2h
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
