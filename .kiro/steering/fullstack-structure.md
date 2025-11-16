---
inclusion: always
---

# Full-Stack Project Structure

## Root Directory Layout
```
├── frontend/               # Next.js 14 + TypeScript + Tailwind CSS
├── backend/                # NestJS + Prisma + PostgreSQL  
├── setup-workspace.js      # Database setup tool
├── workspace-README.md     # Full-stack documentation
└── root-package.json       # Root workspace configuration
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── page.tsx        # Home page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── custom/         # Custom components
│   ├── lib/                # Utility functions and configurations
│   │   ├── utils.ts        # General utilities
│   │   └── api.ts          # API client configuration
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── .env.local              # Frontend environment variables
├── tailwind.config.js      # Tailwind CSS configuration
├── next.config.js          # Next.js configuration
└── package.json            # Frontend dependencies
```

## Backend Structure (`backend/`)
```
backend/
├── src/                    # Application source code
│   ├── main.ts             # Application entry point
│   ├── app.module.ts       # Root module
│   ├── app.controller.ts   # Main controller
│   └── app.service.ts      # Main service
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Database seeding script
├── test/                   # End-to-end tests
├── dist/                   # Compiled output (generated)
├── .env                    # Backend environment variables
├── nest-cli.json           # NestJS CLI configuration
└── package.json            # Backend dependencies
```

## Development Workflow

### When working on Frontend:
- Navigate to `frontend/` directory for all frontend-related tasks
- Use Next.js 14 App Router conventions
- Components go in `src/components/`
- Pages go in `src/app/`
- Use shadcn/ui for UI components: `npx shadcn@latest add [component]`

### When working on Backend:
- Navigate to `backend/` directory for all backend-related tasks
- Follow NestJS module structure
- API endpoints in controllers
- Business logic in services
- Database operations through Prisma

### Full-Stack Development:
- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:3000`
- Frontend communicates with backend via API calls
- Shared types can be defined in both projects or extracted to a shared package