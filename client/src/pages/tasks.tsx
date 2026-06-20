import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Filter, Calendar, FolderHeart } from "lucide-react";
import type { Task } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import TaskModal from "@/components/modals/task-modal";

const categoryColors = {
  "important-urgent": "border-red-200 bg-red-50",
  "important-not-urgent": "border-green-200 bg-green-50",
  "not-important-urgent": "border-yellow-200 bg-yellow-50",
  "not-important-not-urgent": "border-gray-200 bg-gray-50"
};

const categoryLabels = {
  "important-urgent": "Important & Urgent",
  "important-not-urgent": "Important & Not Urgent", 
  "not-important-urgent": "Not Important & Urgent",
  "not-important-not-urgent": "Not Important & Not Urgent"
};

export default function Tasks() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { tasks, isLoading, toggleTask, deleteTask } = useTasks();

  const filteredTasks = selectedCategory 
    ? tasks?.filter(task => task.category === selectedCategory) || []
    : tasks || [];

  const tasksByCategory = Object.entries(categoryLabels).map(([category, label]) => ({
    category,
    label,
    tasks: tasks?.filter(task => task.category === category) || [],
    count: tasks?.filter(task => task.category === category).length || 0
  }));

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Organize your tasks using the Eisenhower Matrix
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedCategory("")}
            data-testid="button-filter-all"
          >
            <Filter className="mr-2 h-4 w-4" />
            All Tasks
          </Button>
          
          <Button
            onClick={() => setIsTaskModalOpen(true)}
            data-testid="button-add-task"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tasksByCategory.map(({ category, label, count }) => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${categoryColors[category as keyof typeof categoryColors]} ${
                selectedCategory === category ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
              data-testid={`card-category-${category}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <FolderHeart className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedCategory ? categoryLabels[selectedCategory as keyof typeof categoryLabels] : "All Tasks"}
            <Badge variant="secondary" className="ml-auto">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                No tasks found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Create your first task to get started with productivity tracking
              </p>
              <Button 
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-4"
                data-testid="button-create-first-task"
              >
                Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`task-item-${task.id}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    data-testid={`checkbox-task-${task.id}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.priority && task.priority > 3 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      P{task.priority}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-delete-${task.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </motion.div>
  );
}
