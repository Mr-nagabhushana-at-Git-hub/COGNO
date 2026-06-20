import { motion } from "framer-motion";
import EisenhowerMatrix from "@/components/dashboard/eisenhower-matrix";
import FocusTimer from "@/components/dashboard/focus-timer";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import Schedule from "@/components/dashboard/schedule";
import { Button } from "@/components/ui/button";
import { Plus, Play, Dumbbell } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Dashboard() {
  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div 
        className="gradient-hero rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
        variants={itemVariants}
        data-testid="hero-section"
      >
        <div className="relative z-10">
          <motion.h1 
            className="text-2xl lg:text-3xl font-bold mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Good morning, Alex! 🌟
          </motion.h1>
          <motion.p 
            className="text-lg opacity-90 mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ready to crush your goals today? Let's make it productive!
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-gray-100"
              data-testid="button-add-task"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20"
              data-testid="button-start-focus"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Focus Session
            </Button>
            
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20"
              data-testid="button-quick-exercise"
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Quick Exercise
            </Button>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 animate-bounce-gentle" />
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Eisenhower Matrix */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <EisenhowerMatrix />
        </motion.div>

        {/* Focus Timer & Stats */}
        <motion.div className="space-y-6" variants={itemVariants}>
          <FocusTimer />
          <div className="lg:hidden">
            <StatsCards />
          </div>
        </motion.div>
      </div>

      {/* Stats Cards - Desktop Only */}
      <motion.div className="hidden lg:block" variants={itemVariants}>
        <StatsCards />
      </motion.div>

      {/* Recent Activity & Schedule */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={itemVariants}
      >
        <RecentActivity />
        <Schedule />
      </motion.div>
    </motion.div>
  );
}
