# Fitness Tracking Mobile App

## Overview

This is a modern fitness tracking application designed as a Progressive Web App (PWA) with a mobile-first approach. The app provides comprehensive workout management, gamification features, and an AI-powered progression system to help users achieve their fitness goals.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized builds
- **Mobile Design**: Responsive design with custom mobile container styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful API with JSON responses

### Mobile-First Design
- Custom mobile container with status bar simulation
- Bottom navigation pattern
- Touch-friendly interface components
- Responsive breakpoints optimized for mobile devices

## Key Components

### Database Schema
**Users**: User profiles with XP, level, and streak tracking
**Workout Programs**: Predefined workout templates with exercise configurations
**Exercises**: Exercise library with muscle groups and instructions
**Workout Sessions**: Individual workout session tracking
**Workout Sets**: Detailed set-by-set exercise data
**Badges**: Achievement system for gamification
**User Badges**: User-specific badge progress tracking
**Personal Records**: Individual exercise PR tracking

### Demo Mode System
**Demo Mode Toggle**: Allows users to switch between real and test mode
**Data Protection**: Prevents test data from affecting real statistics
**Visual Indicators**: Clear UI indication when in demo mode
**Local Storage**: Preserves demo mode preference across sessions

### Authentication & User Management
- User creation and profile management
- XP and level progression system
- Streak tracking for consistency motivation
- Badge award system for achievements

### Workout Management
- 4 predefined workout programs (Upper/Lower, Force/Volume/Explosivity)
- Real-time workout session tracking
- Set-by-set data collection (weight, reps, RPE)
- Rest timer with customizable durations
- Exercise progression tracking
- RPE-based intelligent workout adjustments

### AI-Powered Features
**RPE Analysis System**: Analyzes workout intensity using Rate of Perceived Exertion
**Smart Suggestions**: Provides weight, rep, and rest recommendations based on performance history
**Progression Tracking**: Monitors volume progression and training load adaptation
**Performance Feedback**: Real-time coaching based on RPE trends and workout data

### Gamification Features
- XP-based leveling system
- Achievement badges for milestones
- Streak tracking for consistency
- Visual progress indicators
- Motivational notifications

## Data Flow

1. **User Journey**: Dashboard → Workout Selection → Active Workout → Progress Tracking
2. **Session Management**: Create session → Track sets → Complete workout → Award XP/badges
3. **Data Persistence**: All workout data saved to PostgreSQL via Drizzle ORM
4. **Real-time Updates**: TanStack Query manages cache invalidation and real-time updates
5. **Progress Calculation**: Automatic XP calculation based on workout completion and volume

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight routing library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

### Mobile Optimization
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **Font Awesome**: Icon library for mobile-friendly icons
- **Custom CSS**: Mobile-specific styling and animations

## Deployment Strategy

### Development Environment
- Replit-hosted development with hot reload
- PostgreSQL database provisioned via Replit
- Environment variables for database connection
- Port configuration for external access (5000 → 80)

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations
4. **Asset Optimization**: Vite optimizes static assets

### Production Deployment
- Autoscale deployment target on Replit
- Environment-based configuration
- Database connection via DATABASE_URL
- Serves static files from built frontend

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Added demo mode feature with toggle switch, data protection, and visual indicators
- June 26, 2025. Implemented RPE-based intelligent workout suggestions system with performance analysis
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```