# 🎯 CoachDashtact - Coaching Platform Management System

> **Built from the Dashboard Skeleton Template** - A complete coaching and member management solution

CoachDashtact is a **comprehensive coaching platform** built on top of the full-stack dashboard skeleton template. It demonstrates how the skeleton's foundation can be extended into a specialized coaching management system with member profiles, session scheduling, direct booking, availability management, and integrated communication tools.

## 🌟 What Makes This Special?

This isn't just another booking system - it's a **complete coaching ecosystem** that showcases:

- ✅ **Coach-Member Relationships** - Structured coaching assignments with capacity limits
- ✅ **Direct Booking System** - Real-time slot availability with automatic scheduling
- ✅ **Session Management** - Complete lifecycle from booking to completion with ratings
- ✅ **Availability Control** - Flexible scheduling with buffer times and capacity limits
- ✅ **Integrated Communication** - Built-in messaging between coaches and members
- ✅ **Progress Tracking** - Member profiles with goals, notes, and session history

## 🏗️ Built on Solid Foundation

Extends the **Dashboard Skeleton Template** with:

### Core Features (From Skeleton)
- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 👥 **User Management** - Complete user and role management system
- 🎨 **Dynamic Theming** - OKLCH color system with dark/light mode
- 📊 **Dashboard Widgets** - Customizable dashboard with drag-and-drop widgets
- 📅 **Calendar System** - Event scheduling and management (integrated with sessions)
- 💬 **Messaging** - Real-time messaging between coaches and members
- 🔔 **Notifications** - WebSocket-powered notification system for session reminders
- 📧 **Email System** - Transactional emails with templates
- 🔍 **Global Search** - Search across members, sessions, and content
- 📱 **Responsive Design** - Mobile-first, accessible UI

### Coaching Platform Extensions
- 👨‍🏫 **Coach Profiles** - Specialization, bio, capacity settings, and ratings
- 👤 **Member Profiles** - Goals, progress tracking, onboarding status
- 📆 **Availability Management** - Weekly schedules with time slots and capacity limits
- 🎫 **Session Booking** - Direct booking with real-time availability updates
- ⏰ **Session Lifecycle** - Scheduled → In Progress → Completed → Rated
- ⭐ **Rating System** - Member feedback and coach performance tracking
- 🔄 **Buffer Time Management** - Prevent back-to-back session burnout
- 📊 **Coaching Analytics** - Session statistics, member progress, coach performance
- 🎯 **Onboarding Flow** - Guided member signup with coach selection
- 📝 **Session Notes** - Private coach notes and member feedback
- 🔔 **Smart Reminders** - 24-hour and 1-hour session notifications
- 🚀 **Real-time Updates** - WebSocket-powered slot availability

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (running and accessible)
- npm or yarn

### 1. Database Setup

#### Option A: Fresh Setup (Recommended for First Time)

```bash
node setup-workspace.js
```

This interactive tool will:
- Test PostgreSQL connection
- Create the database
- Configure environment variables
- Set up initial data with coach and member roles

#### Option B: Restore from Backup (For Testing with Real Data)

If you want to test with pre-populated data including coaches, members, and sessions, restore from the backup file:

```bash
# Make sure PostgreSQL is running
# Create the database first
createdb -U postgres coachgymdb

# Restore from backup
pg_restore -h localhost -U postgres -d coachgymdb -c backend/backup_coachgymdb_*.backup

# Or using full path to pg_restore (Windows)
"C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -h localhost -U postgres -d coachgymdb -c backend/backup_coachgymdb_*.backup
```

**Note**: The backup includes sample coaches, members, sessions, and availability data for testing purposes.

### 2. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The platform will be available at `http://localhost:3000`

### 4. Access the Platform

- **Member Portal**: http://localhost:3000/dashboard/member
- **Coach Dashboard**: http://localhost:3000/dashboard/coaching
- **Admin Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3001

**Default Admin Credentials** (created during setup):
- Email: admin@example.com
- Password: (set during setup)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + OKLCH colors
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Hooks
- **Real-time**: WebSocket client for live updates

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket (Socket.io)
- **Email**: Nodemailer
- **Validation**: class-validator
- **Scheduling**: Node-cron for reminders

## 📁 Project Structure

```
coachdashtact/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── coaching/      # Coach dashboard
│   │   │   │   │   ├── members/   # Member management
│   │   │   │   │   ├── sessions/  # Session management
│   │   │   │   │   ├── availability/ # Schedule management
│   │   │   │   │   └── messages/  # Coach messaging
│   │   │   │   └── member/        # Member portal
│   │   │   │       ├── sessions/  # Member sessions
│   │   │   │       ├── book-session/ # Booking interface
│   │   │   │       ├── profile/   # Member profile
│   │   │   │       └── messages/  # Member messaging
│   │   │   └── member-signup/     # Member registration
│   │   ├── components/
│   │   │   └── coaching/          # Coaching components
│   │   │       ├── AvailabilityGrid.tsx
│   │   │       ├── BookSessionForm.tsx
│   │   │       ├── CoachStatsCard.tsx
│   │   │       └── SessionCard.tsx
│   │   ├── lib/
│   │   │   └── api/
│   │   │       └── coaching.ts    # Coaching API client
│   │   └── types/
│   │       └── coaching.ts        # TypeScript types
│   └── public/
├── backend/
│   ├── src/
│   │   ├── members/               # Member management
│   │   │   ├── members.controller.ts
│   │   │   ├── members.service.ts
│   │   │   └── dto/
│   │   ├── coaches/               # Coach management
│   │   ├── sessions/              # Session management
│   │   ├── availability/          # Availability slots
│   │   ├── bookings/              # Booking system
│   │   └── ratings/               # Rating system
│   └── prisma/
│       ├── schema.prisma          # Database schema
│       └── migrations/
└── .kiro/
    ├── specs/
    │   └── coaching-platform/     # Coaching feature specs
    ├── hooks/                     # Kiro agent hooks
    └── steering/                  # Development guidelines
```

## 🎯 Key Features

### For Coaches

#### Member Management
- View all assigned members
- Member profiles with goals and progress
- Onboarding status tracking
- Member capacity limits
- Assignment management
- Member search and filtering

#### Availability Management
- Define weekly availability schedule
- Set time slots with start/end times
- Configure max sessions per slot
- Set buffer time between sessions
- Prevent overlapping slots
- View booking calendar

#### Session Management
- View today's sessions
- Upcoming sessions overview
- Session details and history
- Complete sessions with notes
- Cancel sessions with notifications
- View session ratings
- Private coach notes

#### Coach Dashboard
- Today's session schedule
- Upcoming week overview
- Active member count
- Recent member activity
- Quick actions (message, schedule)
- Performance statistics

#### Communication
- Direct messaging with members
- Session-specific conversations
- Notification preferences
- Email integration

### For Members

#### Coach Selection
- Browse available coaches
- View coach profiles and specializations
- See coach ratings and reviews
- Check coach availability
- Select coach during signup

#### Session Booking
- View coach's available time slots
- Real-time availability updates
- Select date and time
- Instant booking confirmation
- Booking history
- Cancel bookings

#### Member Dashboard
- Next session countdown
- Upcoming sessions list
- Quick booking button
- Message coach button
- Progress overview
- Session history

#### Session Experience
- Session details and preparation
- Join session (future: video integration)
- Add session notes
- Rate completed sessions
- View session history
- Download session summaries

#### Profile Management
- Personal information
- Goals and objectives
- Progress tracking
- Onboarding checklist
- Notification settings
- Account preferences

### For Administrators

#### Platform Management
- Manage all coaches and members
- Assign members to coaches
- Override capacity limits
- View all sessions
- Platform analytics
- System configuration

#### Analytics & Reports
- Total sessions by status
- Coach performance metrics
- Member engagement statistics
- Revenue tracking (future)
- Booking trends
- Cancellation rates

## 🔧 Coaching System Architecture

### Database Schema

#### Core Models
```prisma
model Member {
  id              String
  userId          String
  coachId         String?
  goals           String?
  onboardingStatus String
  joinedAt        DateTime
  sessions        Session[]
  ratings         SessionRating[]
}

model CoachProfile {
  id                    String
  userId                String
  specialization        String?
  bio                   String?
  maxMembers            Int
  isAcceptingMembers    Boolean
  sessionDuration       Int
  bufferTime            Int
  members               Member[]
  availabilitySlots     AvailabilitySlot[]
}

model AvailabilitySlot {
  id                  String
  coachId             String
  dayOfWeek           Int
  startTime           String
  endTime             String
  maxSessionsPerSlot  Int
  isActive            Boolean
}

model Session {
  id              String
  coachId         String
  memberId        String
  scheduledAt     DateTime
  duration        Int
  status          SessionStatus
  calendarEventId String?
  coachNotes      String?
  memberNotes     String?
  rating          SessionRating?
}

model SessionRating {
  id          String
  sessionId   String
  memberId    String
  rating      Int
  feedback    String?
  createdAt   DateTime
}
```

### Booking Algorithm

1. **Fetch Coach Availability** - Get weekly schedule
2. **Calculate Time Slots** - Generate slots based on duration and buffer
3. **Check Existing Bookings** - Count sessions per slot
4. **Apply Capacity Limits** - Filter full slots
5. **Return Available Slots** - Real-time availability
6. **Handle Concurrent Bookings** - Database transactions

### Session Lifecycle

```
PENDING → SCHEDULED → IN_PROGRESS → COMPLETED → RATED
                ↓
            CANCELLED
```

### Notification Flow

- **Booking Confirmed** → Immediate notification
- **24 Hours Before** → Reminder to both parties
- **1 Hour Before** → Final reminder
- **Session Completed** → Rating request to member
- **Session Cancelled** → Cancellation notification

## 📚 Available Scripts

### Backend
```bash
npm run start:dev          # Start development server
npm run build              # Build for production
npm run start:prod         # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run test               # Run tests
```

### Frontend
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/coachdashtact"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_NAME="CoachDashtact"
```

### Coach Settings

Coaches can configure:
- **Session Duration** - Default length of sessions (30, 45, 60 minutes)
- **Buffer Time** - Gap between sessions (0, 15, 30 minutes)
- **Max Members** - Maximum number of active members
- **Max Sessions Per Slot** - Concurrent session capacity
- **Accepting Members** - Toggle new member assignments

## 🚢 Deployment

### Production Build

1. **Build Backend**:
```bash
cd backend
npm run build
```

2. **Build Frontend**:
```bash
cd frontend
npm run build
```

3. **Set Production Environment Variables**

4. **Run Migrations**:
```bash
cd backend
npm run prisma:migrate deploy
```

5. **Start Services**:
```bash
# Backend
cd backend
npm run start:prod

# Frontend
cd frontend
npm run start
```

## 🎓 Learning from This Project

This project demonstrates:

1. **Role-Based Systems** - Coach, Member, Admin roles with specific features
2. **Booking Systems** - Real-time availability with capacity management
3. **Relationship Management** - Coach-member assignments and interactions
4. **Calendar Integration** - Linking sessions with calendar events
5. **Real-time Updates** - WebSocket for live slot availability
6. **Notification Systems** - Scheduled reminders and event notifications
7. **Rating Systems** - Feedback collection and performance tracking
8. **Onboarding Flows** - Guided user registration and setup
9. **Data Validation** - Complex business rules and constraints
10. **Scalable Architecture** - Extending a skeleton template

## 📖 Documentation

Detailed documentation available in:
- `.kiro/specs/coaching-platform/` - Coaching feature specifications
- `documentation/` - Implementation guides
- `backend/README.md` - Backend API documentation
- `frontend/README.md` - Frontend component documentation

## 🎯 Use Cases

This platform is perfect for:
- **Life Coaches** - Personal development coaching
- **Business Coaches** - Professional coaching services
- **Fitness Trainers** - Personal training sessions
- **Tutors** - Educational tutoring
- **Consultants** - Professional consulting
- **Mentors** - Mentorship programs
- **Therapists** - Counseling sessions (with HIPAA compliance)

## 🤝 Contributing

This is a demonstration project built for the Kiroween Hackathon. Feel free to:
- Fork and customize for your needs
- Report issues
- Suggest improvements
- Share your implementations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

Copyright (c) 2025 Fouad ABATOUY

## 🙏 Acknowledgments

- Built with [Kiro AI](https://kiro.dev) - AI-powered development assistant
- Based on the Dashboard Skeleton Template
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**CoachDashtact** - Demonstrating the power of the Dashboard Skeleton Template 🎯
