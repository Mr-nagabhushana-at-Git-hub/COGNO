import { Variants } from "framer-motion";

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// Stagger container animations
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger item animations
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Card hover animations
export const cardHover: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

// Button press animations
export const buttonPress: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

// Fade in animations
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Slide up animations
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Progress bar animations
export const progressBar: Variants = {
  initial: {
    scaleX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Notification toast animations
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// Loading spinner animations
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Pulse animations
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Bounce animations
export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Matrix cell animations for Eisenhower matrix
export const matrixCellVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Task item animations
export const taskItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Stats card animations
export const statsCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Timer animations
export const timerVariants: Variants = {
  initial: {
    scale: 1,
  },
  tick: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  complete: {
    scale: [1, 1.2, 1],
    backgroundColor: ["#3b82f6", "#10b981", "#3b82f6"],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Focus mode overlay animations
export const focusOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

// Floating action button animations
export const fabVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: 90,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

// Navigation link animations
export const navLinkVariants: Variants = {
  inactive: {
    x: 0,
    backgroundColor: "transparent",
  },
  active: {
    x: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    x: 4,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Game tile animations
export const gameTileVariants: Variants = {
  initial: {
    scale: 1,
    backgroundColor: "#f3f4f6",
  },
  highlight: {
    scale: 1.05,
    backgroundColor: "#8b5cf6",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  selected: {
    scale: 1.02,
    backgroundColor: "#10b981",
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  error: {
    scale: [1, 1.1, 1],
    backgroundColor: ["#f3f4f6", "#ef4444", "#f3f4f6"],
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Utility functions for animation helpers
export const createStaggerChildren = (staggerDelay: number = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

export const createSlideVariants = (direction: "up" | "down" | "left" | "right" = "up") => {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };
};

export const createSpringVariants = (stiffness: number = 100, damping: number = 10) => ({
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness,
      damping,
    },
  },
});
