# ProFlow - Premium Productivity App

## Overview

ProFlow is a comprehensive productivity application built with React, TypeScript, and Node.js. The app combines task management using the Eisenhower Matrix methodology, focus session tracking (Pomodoro technique), brain training games, and fitness tracking into a unified productivity platform. It features a modern, responsive UI with rich animations and a clean dashboard-style interface.

The application is designed as a single-page application (SPA) with a full-stack architecture, including RESTful APIs for data management and real-time features for focus sessions and notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, utilizing a component-based architecture with the following key patterns:
- **React Router (Wouter)**: Lightweight routing solution for navigation between different app sections
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Animations**: Framer Motion for smooth transitions and interactive elements
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
The server follows a RESTful API design built on Express.js:
- **Express.js Server**: Main application server with middleware for JSON parsing and request logging
- **Route Organization**: Centralized route registration with clear separation of concerns
- **Storage Abstraction**: Interface-based storage layer allowing for flexible database implementations
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM:
- **Database**: PostgreSQL with Neon serverless database provider
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Well-structured relational database with tables for users, tasks, focus sessions, brain game scores, fitness data, and notifications
- **Migrations**: Database migrations managed through Drizzle Kit

### Authentication and Authorization
Currently implements a demo user system:
- **Demo User**: Single user ID ("demo-user") for demonstration purposes
- **Session Management**: Ready for implementation with connect-pg-simple for PostgreSQL session storage
- **Future Enhancement**: Architecture supports full authentication system expansion

### Component Structure
The application follows a modular component architecture:
- **Layout Components**: App header, sidebar navigation with responsive design
- **Feature Components**: Specialized components for each major feature (tasks, brain games, fitness, focus timer)
- **UI Components**: Reusable design system components based on Radix UI
- **Modal Components**: Task creation/editing and Monk Mode configuration dialogs

### Key Features Implementation
- **Eisenhower Matrix**: Task categorization system with four quadrants for priority management
- **Focus Timer**: Pomodoro and deep work session tracking with real-time updates
- **Brain Training**: Interactive memory games and logic puzzles with scoring system
- **Fitness Tracking**: Step counting, exercise guides, and workout session management
- **Monk Mode**: Distraction-blocking feature for enhanced focus sessions

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Animation library for smooth transitions and interactions
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and improved developer experience
- **React Query**: Server state management and data synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type checking and schema validation

### Third-Party Integrations
- **Google Fonts**: Inter font family for typography
- **Font Awesome**: Additional icon library for enhanced UI
- **Replit Integration**: Development environment integration with runtime error overlay and cartographer plugin

The application is configured for deployment on Replit with development-specific features and optimizations for the Replit environment, including custom Vite plugins and development banners.