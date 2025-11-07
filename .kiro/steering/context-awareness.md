---
inclusion: manual
---

# Context-Aware Development Guidelines

## When to Work on Frontend vs Backend

### Frontend Tasks (work in `frontend/` directory):
- UI/UX components and pages
- Client-side routing and navigation
- Form handling and validation
- State management (React state, context)
- Styling with Tailwind CSS
- Adding shadcn/ui components
- Client-side data fetching and caching
- User interactions and animations

### Backend Tasks (work in `backend/` directory):
- API endpoints and routes
- Database schema and migrations
- Business logic and data processing
- Authentication and authorization
- Data validation and sanitization
- Database queries and operations
- Server configuration and middleware
- Background jobs and scheduled tasks

### Full-Stack Tasks (coordinate between both):
- API contract definition (types/interfaces)
- Authentication flow (frontend + backend)
- Real-time features (WebSockets)
- File uploads and processing
- Error handling strategies
- Performance optimization

## Directory Navigation Rules

### Always specify the correct directory:
- For frontend work: Use `frontend/` prefix in all file paths
- For backend work: Use `backend/` prefix in all file paths
- For root-level work: Use relative paths from workspace root

### Examples:
```bash
# Frontend file operations
frontend/src/components/Button.tsx
frontend/src/app/dashboard/page.tsx
frontend/package.json

# Backend file operations  
backend/src/users/users.controller.ts
backend/prisma/schema.prisma
backend/package.json

# Root level operations
setup-workspace.js
workspace-README.md
```

## Common Confusion Points

### Package.json files:
- `frontend/package.json` - Frontend dependencies (React, Next.js, Tailwind)
- `backend/package.json` - Backend dependencies (NestJS, Prisma, database drivers)
- `root-package.json` - Workspace-level scripts and tools

### Environment files:
- `frontend/.env.local` - Frontend environment variables (NEXT_PUBLIC_*)
- `backend/.env` - Backend environment variables (DATABASE_URL, JWT_SECRET)

### TypeScript configs:
- `frontend/tsconfig.json` - Frontend TypeScript configuration
- `backend/tsconfig.json` - Backend TypeScript configuration

## Development Server Ports
- Frontend: `http://localhost:3000` (Next.js dev server)
- Backend: `http://localhost:3001` (NestJS dev server)
- Database: `localhost:5432` (PostgreSQL default port)

## When User Says "Add a feature":
1. Ask for clarification: Frontend UI, Backend API, or Full-Stack?
2. If Full-Stack: Start with backend API, then frontend implementation
3. Always consider both sides of the feature implementation
4. Ensure type safety between frontend and backend