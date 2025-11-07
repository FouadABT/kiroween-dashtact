# Full-Stack Development Guidelines

## Project Context
This is a full-stack application with:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL
- **Architecture**: Separate frontend and backend services

## Development Commands

### Backend Commands (run in `backend/` directory)
```bash
npm run start:dev          # Start development server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run build              # Build for production
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
```

### Frontend Commands (run in `frontend/` directory)
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npx shadcn@latest add [component]  # Add UI components
```

### Setup Commands (run in root directory)
```bash
node setup-workspace.js    # Interactive database setup
```

## File Organization Rules

### When creating new features:
1. **Backend**: Create modules in `backend/src/[feature]/`
   - `[feature].module.ts` - Module definition
   - `[feature].controller.ts` - HTTP endpoints
   - `[feature].service.ts` - Business logic
   - `[feature].entity.ts` - Database entities (if using TypeORM)
   - `dto/` - Data transfer objects

2. **Frontend**: Create components in `frontend/src/components/[feature]/`
   - Use TypeScript for all components
   - Follow Next.js 14 App Router conventions
   - Place pages in `frontend/src/app/[route]/`

### API Integration:
- Backend API base URL: `http://localhost:3001`
- Frontend API client: Configure in `frontend/src/lib/api.ts`
- Use TypeScript interfaces for API responses
- Handle errors consistently across both applications

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Common Tasks

### Adding a new API endpoint:
1. Create/update controller in `backend/src/`
2. Add service method for business logic
3. Update Prisma schema if database changes needed
4. Create frontend API client function
5. Update TypeScript types for request/response

### Adding a new page:
1. Create page in `frontend/src/app/[route]/page.tsx`
2. Add any required components in `frontend/src/components/`
3. Configure API calls if backend data needed
4. Add navigation links if needed

### Database changes:
1. Update `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate` in backend
3. Run `npm run prisma:generate` to update client
4. Update backend services to use new schema
5. Update frontend types if API responses change