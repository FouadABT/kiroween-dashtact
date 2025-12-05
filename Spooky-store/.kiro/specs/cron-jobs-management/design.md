# Cron Jobs Management System - Design Document

## Overview

The Cron Jobs Management System provides a comprehensive solution for scheduling, monitoring, and managing periodic tasks in the application. Built on NestJS's `@nestjs/schedule` package, the system features a decorator-based job registration pattern, persistent execution logging, and a super admin dashboard for real-time monitoring and control.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cron Jobs Dashboard (Super Admin Only)                │ │
│  │  - Job List View                                       │ │
│  │  - Job Detail View with Execution History             │ │
│  │  - Job Controls (Enable/Disable/Run Now)              │ │
│  │  - Schedule Editor                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Cron Jobs Module                          │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  CronJobsController (API Endpoints)              │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  CronJobsService (Job Management)                │ │ │
│  │  │  - Job Registry                                  │ │ │
│  │  │  - Job Execution                                 │ │ │
│  │  │  - Status Management                             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  CronJobsLogger (Execution Tracking)             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Registered Cron Jobs (Extensible)              │ │
│  │  - TwoFactorCleanupJob                                 │ │
│  │  - [Future Jobs...]                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   PostgreSQL  │
                    │   - CronJob   │
                    │   - CronLog   │
                    └───────────────┘
```

### Technology Stack

- **Backend Scheduling**: `@nestjs/schedule` with `node-cron`
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 with shadcn/ui components
- **Authentication**: JWT with role-based access control
- **Notifications**: Existing notification system integration

## Components and Interfaces

### Database Schema

```prisma
model CronJob {
  id              String   @id @default(uuid())
  name            String   @unique
  description     String?
  schedule        String   // Cron expression
  handler         String   // Service method identifier
  isEnabled       Boolean  @default(true)
  isLocked        Boolean  @default(false) // Prevents UI schedule changes
  lastRunAt       DateTime?
  nextRunAt       DateTime?
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  consecutiveFailures Int  @default(0)
  averageDuration Float?   // In milliseconds
  notifyOnFailure Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  logs            CronLog[]
  
  @@index([isEnabled])
  @@index([nextRunAt])
}

model CronLog {
  id          String   @id @default(uuid())
  jobId       String
  job         CronJob  @relation(fields: [jobId], references: [id], onDelete: Cascade)
  status      CronLogStatus
  startedAt   DateTime @default(now())
  completedAt DateTime?
  duration    Int?     // In milliseconds
  error       String?  @db.Text
  stackTrace  String?  @db.Text
  metadata    Json?    // Additional context
  
  @@index([jobId, startedAt])
  @@index([status])
}

enum CronLogStatus {
  RUNNING
  SUCCESS
  FAILED
}
```

### Backend Components

#### 1. CronJob Decorator

```typescript
// decorators/cron-job.decorator.ts
export interface CronJobOptions {
  name: string;
  description?: string;
  schedule: string;
  isLocked?: boolean;
  notifyOnFailure?: boolean;
}

export const RegisterCronJob = (options: CronJobOptions): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // Store metadata for discovery
    Reflect.defineMetadata('cronJob:options', options, target, propertyKey);
    Reflect.defineMetadata('cronJob:handler', `${target.constructor.name}.${String(propertyKey)}`, target, propertyKey);
  };
};
```

#### 2. CronJobsService

```typescript
// cron-jobs/cron-jobs.service.ts
@Injectable()
export class CronJobsService {
  private jobRegistry: Map<string, ScheduledTask> = new Map();
  
  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private notificationsService: NotificationsService,
  ) {}
  
  // Job Discovery & Registration
  async discoverAndRegisterJobs(): Promise<void>;
  async registerJob(options: CronJobOptions, handler: Function): Promise<void>;
  
  // Job Management
  async getAllJobs(): Promise<CronJob[]>;
  async getJobById(id: string): Promise<CronJob>;
  async enableJob(id: string): Promise<CronJob>;
  async disableJob(id: string): Promise<CronJob>;
  async updateSchedule(id: string, schedule: string): Promise<CronJob>;
  async triggerJobManually(id: string): Promise<void>;
  
  // Execution & Logging
  async executeJob(jobId: string): Promise<void>;
  async logExecution(jobId: string, status: CronLogStatus, duration?: number, error?: Error): Promise<void>;
  async getJobLogs(jobId: string, filters?: LogFilters): Promise<CronLog[]>;
  
  // Statistics
  async updateJobStatistics(jobId: string): Promise<void>;
  async getJobStatistics(jobId: string): Promise<JobStatistics>;
}
```

#### 3. CronJobsController

```typescript
// cron-jobs/cron-jobs.controller.ts
@Controller('cron-jobs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('system.cron.manage')
export class CronJobsController {
  constructor(private cronJobsService: CronJobsService) {}
  
  @Get()
  async getAllJobs(): Promise<CronJob[]>;
  
  @Get(':id')
  async getJob(@Param('id') id: string): Promise<CronJob>;
  
  @Get(':id/logs')
  async getJobLogs(@Param('id') id: string, @Query() filters: LogFiltersDto): Promise<CronLog[]>;
  
  @Get(':id/statistics')
  async getJobStatistics(@Param('id') id: string): Promise<JobStatistics>;
  
  @Post(':id/enable')
  async enableJob(@Param('id') id: string): Promise<CronJob>;
  
  @Post(':id/disable')
  async disableJob(@Param('id') id: string): Promise<CronJob>;
  
  @Post(':id/trigger')
  async triggerJob(@Param('id') id: string): Promise<{ message: string }>;
  
  @Patch(':id/schedule')
  async updateSchedule(@Param('id') id: string, @Body() dto: UpdateScheduleDto): Promise<CronJob>;
}
```

#### 4. Example Job Implementation

```typescript
// auth/services/two-factor-cleanup.service.ts
@Injectable()
export class TwoFactorCleanupService {
  constructor(private prisma: PrismaService) {}
  
  @RegisterCronJob({
    name: 'two-factor-token-cleanup',
    description: 'Removes expired two-factor authentication tokens',
    schedule: '0 */6 * * *', // Every 6 hours
    isLocked: true,
    notifyOnFailure: true,
  })
  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.prisma.twoFactorToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    console.log(`Cleaned up ${result.count} expired 2FA tokens`);
  }
}
```

### Frontend Components

#### 1. Cron Jobs Dashboard Page

```typescript
// app/(dashboard)/admin/cron-jobs/page.tsx
export default async function CronJobsPage() {
  // Server component - fetch initial data
  const jobs = await CronJobsApi.getAllJobs();
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Cron Jobs Management"
        description="Monitor and manage scheduled tasks"
      />
      <CronJobsClient initialJobs={jobs} />
    </div>
  );
}
```

#### 2. Cron Jobs Client Component

```typescript
// components/admin/cron-jobs/CronJobsClient.tsx
'use client';

export function CronJobsClient({ initialJobs }: Props) {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CronJobsList
          jobs={jobs}
          onSelectJob={setSelectedJob}
          onJobUpdate={handleJobUpdate}
        />
      </div>
      <div>
        {selectedJob && (
          <CronJobDetails
            job={selectedJob}
            onUpdate={handleJobUpdate}
          />
        )}
      </div>
    </div>
  );
}
```

#### 3. Job List Component

```typescript
// components/admin/cron-jobs/CronJobsList.tsx
export function CronJobsList({ jobs, onSelectJob, onJobUpdate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => (
              <CronJobRow
                key={job.id}
                job={job}
                onSelect={onSelectJob}
                onUpdate={onJobUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

#### 4. Job Details Component

```typescript
// components/admin/cron-jobs/CronJobDetails.tsx
export function CronJobDetails({ job, onUpdate }: Props) {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.name}</CardTitle>
        <CardDescription>{job.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <JobStatistics job={job} />
        <JobControls job={job} onUpdate={onUpdate} />
        {showScheduleEditor && (
          <ScheduleEditor job={job} onUpdate={onUpdate} />
        )}
        <ExecutionHistory logs={logs} />
      </CardContent>
    </Card>
  );
}
```

## Data Models

### TypeScript Interfaces

```typescript
// Frontend types
export interface CronJob {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  handler: string;
  isEnabled: boolean;
  isLocked: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  averageDuration?: number;
  notifyOnFailure: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CronLog {
  id: string;
  jobId: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  stackTrace?: string;
  metadata?: any;
}

export interface JobStatistics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  lastSuccess?: string;
  lastFailure?: string;
  uptime: number; // Percentage
}

export interface LogFilters {
  status?: 'SUCCESS' | 'FAILED';
  startDate?: string;
  endDate?: string;
  limit?: number;
}
```

### DTOs

```typescript
// Backend DTOs
export class UpdateScheduleDto {
  @IsString()
  @Matches(/^(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})$/)
  schedule: string;
}

export class LogFiltersDto {
  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILED'])
  status?: 'SUCCESS' | 'FAILED';
  
  @IsOptional()
  @IsDateString()
  startDate?: string;
  
  @IsOptional()
  @IsDateString()
  endDate?: string;
  
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
```

## Error Handling

### Backend Error Handling

```typescript
// Custom exceptions
export class CronJobNotFoundException extends NotFoundException {
  constructor(jobId: string) {
    super(`Cron job with ID ${jobId} not found`);
  }
}

export class CronJobAlreadyRunningException extends BadRequestException {
  constructor(jobName: string) {
    super(`Cron job ${jobName} is already running`);
  }
}

export class InvalidCronExpressionException extends BadRequestException {
  constructor(expression: string) {
    super(`Invalid cron expression: ${expression}`);
  }
}

// Error handling in service
async executeJob(jobId: string): Promise<void> {
  const job = await this.getJobById(jobId);
  
  if (!job.isEnabled) {
    throw new BadRequestException('Cannot execute disabled job');
  }
  
  const logId = await this.createExecutionLog(jobId);
  const startTime = Date.now();
  
  try {
    const handler = this.getJobHandler(job.handler);
    await handler();
    
    const duration = Date.now() - startTime;
    await this.completeExecutionLog(logId, 'SUCCESS', duration);
    await this.handleJobSuccess(jobId);
  } catch (error) {
    const duration = Date.now() - startTime;
    await this.completeExecutionLog(logId, 'FAILED', duration, error);
    await this.handleJobFailure(jobId, error);
  }
}
```

### Frontend Error Handling

```typescript
// API client with error handling
export class CronJobsApi {
  static async triggerJob(jobId: string): Promise<void> {
    try {
      await ApiClient.post(`/cron-jobs/${jobId}/trigger`, {});
      toast.success('Job triggered successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to trigger job');
      }
      throw error;
    }
  }
}
```

## Testing Strategy

### Backend Tests

#### Unit Tests

```typescript
// cron-jobs.service.spec.ts
describe('CronJobsService', () => {
  describe('registerJob', () => {
    it('should register a new cron job');
    it('should throw error for invalid cron expression');
    it('should update existing job if already registered');
  });
  
  describe('executeJob', () => {
    it('should execute job and log success');
    it('should log failure and notify on error');
    it('should prevent concurrent execution');
    it('should disable job after 3 consecutive failures');
  });
  
  describe('updateSchedule', () => {
    it('should update job schedule');
    it('should throw error for locked jobs');
    it('should validate cron expression');
  });
});
```

#### Integration Tests

```typescript
// cron-jobs.controller.spec.ts
describe('CronJobsController (e2e)', () => {
  it('GET /cron-jobs - should return all jobs for super admin');
  it('GET /cron-jobs - should deny access for non-super admin');
  it('POST /cron-jobs/:id/trigger - should trigger job manually');
  it('POST /cron-jobs/:id/enable - should enable disabled job');
  it('PATCH /cron-jobs/:id/schedule - should update schedule');
});
```

### Frontend Tests

```typescript
// CronJobsList.test.tsx
describe('CronJobsList', () => {
  it('should render list of jobs');
  it('should show job status indicators');
  it('should handle enable/disable actions');
  it('should handle manual trigger');
  it('should show loading state during actions');
});

// CronJobDetails.test.tsx
describe('CronJobDetails', () => {
  it('should display job statistics');
  it('should load execution history');
  it('should filter logs by status');
  it('should show schedule editor for unlocked jobs');
  it('should prevent schedule editing for locked jobs');
});
```

## Security Considerations

1. **Access Control**: Only super admins can access cron jobs management
2. **Permission Check**: `system.cron.manage` permission required
3. **Locked Jobs**: Critical jobs cannot have schedules modified via UI
4. **Audit Logging**: All schedule changes logged with admin user info
5. **Input Validation**: Cron expressions validated before saving
6. **Rate Limiting**: Manual trigger actions rate-limited per user
7. **Error Sanitization**: Stack traces sanitized before sending to frontend

## Performance Considerations

1. **Job Execution**: Jobs run in separate async context to avoid blocking
2. **Log Retention**: Automatic cleanup of logs older than 90 days
3. **Database Indexing**: Indexes on `jobId`, `startedAt`, and `status`
4. **Pagination**: Execution logs paginated (50 per page)
5. **Caching**: Job list cached for 30 seconds
6. **Concurrent Execution**: Prevent same job from running concurrently
7. **Batch Operations**: Bulk log cleanup using batch deletes

## Deployment Considerations

1. **Migration**: Database migration creates `CronJob` and `CronLog` tables
2. **Seeding**: Seed script registers existing jobs (two-factor cleanup)
3. **Permission Seeding**: Add `system.cron.manage` permission for super admin
4. **Environment Variables**: Optional configuration for log retention period
5. **Monitoring**: Integration with existing notification system
6. **Graceful Shutdown**: Jobs complete before application shutdown
7. **Cluster Mode**: Use distributed locks if running multiple instances
