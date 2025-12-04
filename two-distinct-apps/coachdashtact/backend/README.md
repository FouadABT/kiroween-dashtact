# Backend - NestJS + Prisma + PostgreSQL

## Tech Stack
- **Framework**: NestJS (Node.js backend framework)
- **Language**: TypeScript
- **ORM**: Prisma ORM
- **Database**: PostgreSQL
- **Config**: @nestjs/config for environment management
- **HTTP Server**: Express (via NestJS)

## Setup Instructions

1. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update database connection string in `.env`

2. **Database Setup**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   
   # Open Prisma Studio
   npm run prisma:studio
   ```

3. **Development**:
   ```bash
   # Start development server
   npm run start:dev
   
   # Start with debugging
   npm run start:debug
   ```

## Available Scripts
- `npm run start:dev` - Start development server with hot reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (visual DB browser)
- `npm run prisma:seed` - Seed database with initial data

## Project Structure
```
src/
├── app.controller.ts    # Main application controller
├── app.module.ts        # Root application module
├── app.service.ts       # Main application service
└── main.ts             # Application entry point

prisma/
├── schema.prisma       # Database schema
└── seed.ts            # Database seeding script
```