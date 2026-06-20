import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bell, Rocket } from "lucide-react";
import MonkModeModal from "@/components/modals/monk-mode-modal";

export default function AppHeader() {
  const [isMonkModeOpen, setIsMonkModeOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications/unread"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = notifications?.length || 0;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Rocket className="text-white h-4 w-4" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ProFlow
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Monk Mode Toggle */}
              <Button
                variant="outline"
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                onClick={() => setIsMonkModeOpen(true)}
                data-testid="button-monk-mode"
              >
                <span className="hidden sm:inline mr-2">🧘</span>
                <span className="font-medium">Monk Mode</span>
              </Button>
              
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full ring-2 ring-primary-100"
                  data-testid="img-avatar"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-username">
                    Alex Johnson
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pro Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MonkModeModal 
        isOpen={isMonkModeOpen}
        onClose={() => setIsMonkModeOpen(false)}
      />
    </>
  );
}
