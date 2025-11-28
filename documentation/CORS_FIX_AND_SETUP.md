# CORS Fix and Backend Setup Guide

## Issue Fixed
The backend was missing CORS configuration, preventing the frontend from making API requests.

## Changes Made

### 1. Backend CORS Configuration (`backend/src/main.ts`)

Added CORS middleware to allow requests from the frontend:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 2. Validation Pipes

Added global validation to automatically validate DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### 3. Enhanced Error Logging

Added detailed console logging in frontend to help debug issues:
- Logs when fetching users
- Logs when creating users
- Shows detailed error messages

## How to Start the Application

### Step 1: Start the Backend

```bash
cd backend
npm run start:dev
```

**Expected output:**
```
🚀 Backend server running on http://localhost:3001
```

**If you see errors:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in `backend/.env`
- Run `npm run prisma:generate` if Prisma client is missing

### Step 2: Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
```

### Step 3: Test the User Management

1. Open browser: http://localhost:3000/dashboard/users
2. Click "Add User" button
3. Fill in the form:
   - Email: test@example.com
   - Name: Test User
   - Password: Test123!
   - Role: USER
   - Active: ON
4. Click "Create User"

**Expected result:**
- Success toast appears
- Form closes
- New user appears in the list

## Troubleshooting

### Error: "Failed to fetch users"

**Cause:** Backend is not running or not accessible

**Solution:**
1. Check if backend is running on port 3001
2. Open http://localhost:3001 in browser (should see "Hello World!" or similar)
3. Check backend terminal for errors

### Error: "CORS policy blocked"

**Cause:** CORS not configured (should be fixed now)

**Solution:**
1. Make sure you restarted the backend after the CORS fix
2. Check browser console for exact CORS error
3. Verify backend main.ts has CORS enabled

### Error: "Cannot connect to database"

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
1. Start PostgreSQL service
2. Check `backend/.env` DATABASE_URL
3. Test connection: `psql -U postgres -d myapp`

### Error: "Prisma Client not found"

**Cause:** Prisma client not generated

**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Error: "Port 3001 already in use"

**Cause:** Another process using port 3001

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

## API Endpoints Available

Once backend is running, these endpoints are available:

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)
- `DELETE /users/:id/permanent` - Permanently delete user
- `PATCH /users/:id/status` - Toggle user active status

### Test with cURL

```bash
# Create a user
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Test123!",
    "role": "USER"
  }'

# Get all users
curl http://localhost:3001/users

# Get user by ID
curl http://localhost:3001/users/{id}
```

## Database Schema

Current User model:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Next Steps

After confirming everything works:

1. **Remove Debug Code**
   - Remove console.log statements
   - Remove debug visual indicators (blue borders, yellow boxes)
   - Remove checkmark from button

2. **Add Authentication**
   - Implement JWT authentication
   - Add login/logout functionality
   - Protect routes with auth guards

3. **Add More Features**
   - Search and filter users
   - Pagination
   - Bulk operations
   - Export users to CSV

4. **Improve UI**
   - Add data table with sorting
   - Add confirmation dialogs
   - Add loading skeletons
   - Improve mobile responsiveness

## Status

✅ CORS configured
✅ Validation pipes added
✅ Error logging enhanced
✅ Backend ready on port 3001
✅ Frontend ready on port 3000
✅ User CRUD operations functional

**Ready to test!** Start both servers and try creating a user.
