---
inclusion: always
---

# API Routing System

## Critical Rule: Module Registration

**ALWAYS import feature modules in `app.module.ts` or routes won't exist.**

### Backend Module Registration

**File**: `backend/src/app.module.ts`

```typescript
// ❌ WRONG - Module not imported
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    // SearchModule missing!
  ],
})

// ✅ CORRECT - Module imported
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SearchModule, // Routes now registered
  ],
})
```

**Common Error**: `404 Not Found` on valid endpoint = module not imported.

---

## Backend Routes (NestJS)

### Controller Path Structure

```typescript
@Controller('feature')  // Base: /feature
export class FeatureController {
  @Get()              // GET /feature
  @Get(':id')         // GET /feature/:id
  @Post()             // POST /feature
  @Put(':id')         // PUT /feature/:id
  @Patch(':id')       // PATCH /feature/:id
  @Delete(':id')      // DELETE /feature/:id
}
```

### Nested Routes

```typescript
@Controller('profile')
export class ProfileController {
  @Get('two-factor/status')        // GET /profile/two-factor/status
  @Post('two-factor/enable')       // POST /profile/two-factor/enable
  @Post('two-factor/disable')      // POST /profile/two-factor/disable
}
```

### Route Order Matters

```typescript
// ❌ WRONG - :id catches 'status'
@Get(':id')
@Get('status')

// ✅ CORRECT - Specific routes first
@Get('status')
@Get(':id')
```

### Query Parameters

```typescript
@Get('search')
async search(@Query('q') query: string) {
  // GET /search?q=test
}
```

---

## Frontend API Calls (Next.js)

### API Client Methods

**File**: `frontend/src/lib/api.ts`

```typescript
export class FeatureApi {
  // GET request
  static async getAll() {
    return ApiClient.get('/feature');
  }
  
  // GET with ID
  static async getById(id: string) {
    return ApiClient.get(`/feature/${id}`);
  }
  
  // POST request
  static async create(data: any) {
    return ApiClient.post('/feature', data);
  }
  
  // PUT request
  static async update(id: string, data: any) {
    return ApiClient.put(`/feature/${id}`, data);
  }
  
  // PATCH request
  static async patch(id: string, data: any) {
    return ApiClient.patch(`/feature/${id}`, data);
  }
  
  // DELETE request
  static async delete(id: string) {
    return ApiClient.delete(`/feature/${id}`);
  }
}
```

### Query Parameters

```typescript
// Simple query
ApiClient.get('/search?q=test');

// Multiple parameters
ApiClient.get('/search?q=test&type=users&page=1');
```

---

## HTTP Method Matching

**CRITICAL**: Frontend and backend HTTP methods MUST match exactly.

```typescript
// ❌ WRONG - Method mismatch
// Backend
@Post('two-factor/enable')

// Frontend
ApiClient.put('/profile/two-factor/enable', {});

// ✅ CORRECT - Methods match
// Backend
@Post('two-factor/enable')

// Frontend
ApiClient.post('/profile/two-factor/enable', {});
```

**Common Error**: `404 Not Found` with correct path = wrong HTTP method.

---

## Route Guards

### Protected Routes

```typescript
@Controller('feature')
@UseGuards(JwtAuthGuard)  // All routes require auth
export class FeatureController {
  @Get()
  findAll() {}  // Requires JWT token
}
```

### Public Routes

```typescript
@Controller('auth')
export class AuthController {
  @Public()  // Override guard
  @Post('login')
  login() {}  // No auth required
}
```

---

## Common Issues & Solutions

### Issue 1: 404 Not Found (Valid Path)

**Symptoms**: 
```json
{"message": "Cannot GET /search/quick", "error": "Not Found", "statusCode": 404}
```

**Causes**:
1. Module not imported in `app.module.ts`
2. Wrong HTTP method (GET vs POST)
3. Typo in path

**Solution**:
```typescript
// 1. Check app.module.ts
@Module({
  imports: [SearchModule], // Add missing module
})

// 2. Match HTTP methods
// Backend: @Get('quick')
// Frontend: ApiClient.get('/search/quick')

// 3. Verify paths match exactly
```

### Issue 2: 404 Wrong Method

**Symptoms**:
```json
{"message": "Cannot PUT /profile/two-factor/enable", "error": "Not Found", "statusCode": 404}
```

**Solution**: Change frontend to match backend method.

```typescript
// Backend uses POST
@Post('two-factor/enable')

// Frontend must use POST
ApiClient.post('/profile/two-factor/enable', {});
```

### Issue 3: Route Conflicts

**Problem**: Dynamic routes catch specific routes.

```typescript
// ❌ WRONG
@Get(':id')      // Catches everything
@Get('status')   // Never reached

// ✅ CORRECT
@Get('status')   // Specific first
@Get(':id')      // Dynamic last
```

---

## New Feature Checklist

When adding a new feature with API routes:

**Backend**:
- [ ] Create controller: `@Controller('feature')`
- [ ] Define routes: `@Get()`, `@Post()`, etc.
- [ ] Create module with controller
- [ ] **Import module in `app.module.ts`** (CRITICAL!)
- [ ] Add guards if needed: `@UseGuards(JwtAuthGuard)`

**Frontend**:
- [ ] Add API class in `frontend/src/lib/api.ts`
- [ ] Match HTTP methods exactly
- [ ] Match paths exactly
- [ ] Test all endpoints

**Verification**:
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Test API calls from frontend
- [ ] Check network tab for correct requests

---

## Quick Reference

### HTTP Method Mapping

| Backend Decorator | Frontend Method | Purpose |
|------------------|-----------------|---------|
| `@Get()` | `ApiClient.get()` | Fetch data |
| `@Post()` | `ApiClient.post()` | Create data |
| `@Put()` | `ApiClient.put()` | Replace data |
| `@Patch()` | `ApiClient.patch()` | Update data |
| `@Delete()` | `ApiClient.delete()` | Remove data |

### Common Paths

| Feature | Backend | Frontend |
|---------|---------|----------|
| List all | `@Get()` | `ApiClient.get('/feature')` |
| Get one | `@Get(':id')` | `ApiClient.get('/feature/123')` |
| Create | `@Post()` | `ApiClient.post('/feature', data)` |
| Update | `@Put(':id')` | `ApiClient.put('/feature/123', data)` |
| Delete | `@Delete(':id')` | `ApiClient.delete('/feature/123')` |
| Search | `@Get('search')` | `ApiClient.get('/feature/search?q=test')` |

---

## Remember

1. **Module Registration**: Import in `app.module.ts` or routes don't exist
2. **Method Matching**: Frontend and backend HTTP methods must match exactly
3. **Route Order**: Specific routes before dynamic routes
4. **Path Matching**: Paths must match exactly (case-sensitive)
5. **Guards**: Apply `@UseGuards()` for protected routes
