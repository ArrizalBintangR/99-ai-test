# 99 Group Property Industry Quiz Generator

## Overview

This is a property industry knowledge quiz generator built for 99 Group employees. The application uses AI (OpenAI GPT-5) to generate professional, factual quizzes on property-related topics. Users enter a topic, configure quiz parameters (number of questions, difficulty), and receive a complete quiz with questions, answers, explanations, and learning notes.

The system validates topics to ensure they're property industry-related before generating content, maintaining professional standards and factual accuracy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, React useState for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming (light/dark mode)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: REST API with JSON responses
- **AI Integration**: OpenAI API (GPT-5) for quiz generation and topic validation
- **Storage**: In-memory storage (MemStorage class) - currently stores quizzes in a Map

### Shared Code
- **Schema Definitions**: Zod schemas in `shared/schema.ts` define quiz configuration, questions, answers, and validation rules
- **Type Safety**: TypeScript types are derived from Zod schemas and shared between frontend and backend

### Key Design Patterns
- **Validation-First Generation**: Topics are validated for property industry relevance before quiz generation
- **Structured AI Output**: OpenAI responses are parsed as JSON objects matching defined schemas
- **Component-Based UI**: Modular React components for quiz form, display, answer key, and export functionality
- **Error Boundaries**: Error states and loading states are handled with dedicated components

### Build Process
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Dependencies**: Selective bundling of server dependencies to optimize cold start times

## External Dependencies

### AI Services
- **OpenAI API**: Used for topic validation and quiz generation (requires `OPENAI_API_KEY` environment variable)

### Database
- **PostgreSQL**: Drizzle ORM is configured with PostgreSQL dialect (requires `DATABASE_URL` environment variable)
- **Current State**: Using in-memory storage; database schema exists but isn't actively used for quiz storage

### UI Dependencies
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library using Radix primitives
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **Drizzle Kit**: Database migration and schema push tools