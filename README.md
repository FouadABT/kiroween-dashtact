# 🏗️ Full-Stack Skeleton/Template Dashboard

> **A professional application skeleton** - Your foundation for building custom full-stack applications

This is a **SKELETON/TEMPLATE** project, not a finished product. Think of it as the bones of your application - a solid, production-ready foundation that you build upon and customize for your specific needs.

## 🦴 What is a Skeleton/Template?

A **skeleton** provides:
- ✅ Complete architecture and structure (the bones)
- ✅ Core systems already implemented (auth, database, API)
- ✅ Best practices and patterns built-in
- ✅ Ready to extend with your unique features

**You provide**:
- 💪 Your business logic and workflows
- 💪 Custom features specific to your use case
- 💪 Your brand and design customization
- 💪 Domain-specific functionality

**Result**: A complete, custom application built on a solid foundation in a fraction of the time!

## 🏗️ Project Structure

```
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # NestJS + Prisma + PostgreSQL
└── setup-workspace.js # Database setup tool
```

## 🚀 Quick Start

### 1. Database Setup (Required First)

Run the interactive database setup tool:

```bash
node setup-workspace.js
```

This tool will:
- ✅ Test your PostgreSQL connection
- ✅ Create the database if it doesn't exist
- ✅ Generate and save connection strings
- ✅ Configure environment variables for both frontend and backend

### 2. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React + TypeScript)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build Tool**: Vite (built into Next.js)

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Config**: @nestjs/config
- **HTTP Server**: Express (via NestJS)

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (running and accessible)
- npm or yarn

## 🔧 Manual Setup (Alternative)

If you prefer manual setup instead of using the setup tool:

### Backend Environment
Create `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### Frontend Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📚 Available Scripts

### Backend (`cd backend`)
- `npm run start:dev` - Start development server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:setup` - Run database setup tool

### Frontend (`cd frontend`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npx shadcn@latest add [component]` - Add UI components

## 🎯 Development Workflow

1. Run the database setup tool: `node setup-workspace.js`
2. Start backend: `cd backend && npm run start:dev`
3. Start frontend: `cd frontend && npm run dev`
4. Access your app at `http://localhost:3000`
5. API available at `http://localhost:3001`

## 📖 Next Steps

- Define your database schema in `backend/prisma/schema.prisma`
- Add API endpoints in `backend/src/`
- Build UI components in `frontend/src/`
- Use `npx shadcn@latest add button` to add pre-built components

---

🎉 **Your full-stack template is ready to use!**