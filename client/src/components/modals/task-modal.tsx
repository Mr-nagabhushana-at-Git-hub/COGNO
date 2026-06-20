import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarIcon, Target, AlertTriangle, Clock, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: any; // Task to edit if in edit mode
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  category: z.enum(["important-urgent", "important-not-urgent", "not-important-urgent", "not-important-not-urgent"]),
  priority: z.number().min(1).max(5),
  dueDate: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const categories = [
  {
    value: "important-urgent",
    label: "Important & Urgent",
    description: "Do First - Critical tasks requiring immediate attention",
    color: "text-red-600 dark:text-red-400",
    icon: AlertTriangle
  },
  {
    value: "important-not-urgent", 
    label: "Important & Not Urgent",
    description: "Schedule - Important tasks to plan and schedule",
    color: "text-green-600 dark:text-green-400",
    icon: Target
  },
  {
    value: "not-important-urgent",
    label: "Not Important & Urgent", 
    description: "Delegate - Tasks that could be delegated",
    color: "text-yellow-600 dark:text-yellow-400",
    icon: Clock
  },
  {
    value: "not-important-not-urgent",
    label: "Not Important & Not Urgent",
    description: "Eliminate - Tasks to minimize or eliminate",
    color: "text-gray-600 dark:text-gray-400",
    icon: CheckSquare
  }
];

const priorityLabels = {
  1: { label: "Very Low", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  2: { label: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  3: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
  4: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
  5: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" }
};

export default function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const { toast } = useToast();
  const { createTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!taskToEdit;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      description: taskToEdit?.description || "",
      category: taskToEdit?.category || "important-not-urgent",
      priority: taskToEdit?.priority || 3,
      dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate) : undefined,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await updateTask(taskToEdit.id, data);
        toast({
          title: "✅ Task Updated",
          description: "Task has been successfully updated.",
        });
      } else {
        await createTask(data);
        toast({
          title: "✅ Task Created", 
          description: "New task has been added to your matrix.",
        });
      }
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your task details and categorization." 
              : "Add a new task to your Eisenhower Matrix for better prioritization."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title..."
                      {...field}
                      data-testid="input-task-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about this task..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="textarea-task-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Eisenhower Matrix Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-task-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-start space-x-3 py-1">
                              <Icon className={cn("h-4 w-4 mt-0.5", category.color)} />
                              <div>
                                <div className="font-medium text-sm">{category.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {category.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Priority Level */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Priority Level</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-task-priority">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, { label, color }]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center space-x-2">
                              <Badge className={cn("text-xs", color)}>
                                P{value}
                              </Badge>
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-due-date"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-save-task"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>{isEditing ? "Update Task" : "Create Task"}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
