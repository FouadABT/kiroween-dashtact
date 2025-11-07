# Agent Hooks Reference

## Prisma Database Sync Agent

### Purpose
Automatically maintains type safety and data consistency across your PostgreSQL database, NestJS backend, and Next.js frontend when schema or type files are modified.

### Quick Start

1. **The hook is enabled by default** - It monitors file changes automatically
2. **When you edit monitored files**, the agent will trigger and:
   - Analyze your changes
   - Sync backend and frontend
   - Generate tests
   - Verify consistency
   - Provide a detailed report

### Monitored Files
```
backend/prisma/schema.prisma          # Database schema
frontend/src/types/*.ts               # Frontend types
backend/src/**/*.entity.ts            # Backend entities
backend/src/**/*.dto.ts               # Data transfer objects
frontend/src/lib/api.ts               # API client
```

### What Happens Automatically

#### Phase 1: Analysis
- Identifies which file changed
- Checks for breaking changes
- Creates backup plan

#### Phase 2: Backend Sync
- Generates Prisma migration
- Regenerates Prisma client
- Updates NestJS services/controllers
- Updates DTOs

#### Phase 3: Frontend Sync
- Updates TypeScript interfaces
- Syncs API client methods
- Ensures type consistency

#### Phase 4: Testing
- Generates service unit tests
- Tests CRUD operations
- Validates DTOs
- Checks database constraints
- Verifies Prisma queries

#### Phase 5: Verification
- Compares Prisma models with frontend types
- Checks TypeScript compilation
- Validates type consistency
- Tests API endpoints

#### Phase 6: Report
- Summary of changes
- Test results
- Breaking changes
- Manual verification commands
- Rollback instructions

### Manual Verification Tools

#### Check Sync Status
```bash
node .kiro/scripts/verify-prisma-sync.js
```
Verifies that Prisma schema, backend DTOs, and frontend types are in sync.

#### Generate Tests
```bash
node .kiro/scripts/generate-sync-tests.js
```
Creates comprehensive unit tests for all Prisma models.

### Safety Features

The agent follows strict safety rules:
- ✅ Never deletes existing migrations
- ✅ Always verifies types match
- ✅ Creates tests before completing
- ✅ Checks for compilation errors
- ✅ Stops if verification fails
- ✅ Preserves existing functionality
- ✅ Uses minimal changes
- ✅ Validates model consistency

### Configuration

Edit `.kiro/hooks/prisma-sync-agent.kiro.hook` to:
- Enable/disable the hook
- Modify monitored file patterns
- Adjust the agent prompt

### Troubleshooting

#### Hook Not Triggering
1. Check if hook is enabled in `.kiro/hooks/prisma-sync-agent.kiro.hook`
2. Verify file matches one of the monitored patterns
3. Check Kiro Agent Hooks view for status

#### Sync Issues
1. Run manual verification: `node .kiro/scripts/verify-prisma-sync.js`
2. Check for compilation errors in backend and frontend
3. Verify Prisma client is generated: `npm run prisma:generate`
4. Review the agent's report for specific issues

#### Test Failures
1. Regenerate tests: `node .kiro/scripts/generate-sync-tests.js`
2. Update mock data in test files
3. Ensure Prisma schema matches test expectations

### Best Practices

1. **Review Agent Reports**: Always read the sync report to understand changes
2. **Run Manual Verification**: Use verification script after major changes
3. **Test Locally**: Run tests before committing: `npm test`
4. **Check Compilation**: Ensure both backend and frontend compile
5. **Review Breaking Changes**: Pay attention to breaking change warnings
6. **Keep Backups**: The agent provides rollback instructions - keep them handy

### Example Workflow

1. Edit `backend/prisma/schema.prisma` to add a new field
2. Save the file
3. Agent hook triggers automatically
4. Agent analyzes the change
5. Agent generates migration and updates client
6. Agent updates backend services and DTOs
7. Agent creates/updates frontend types
8. Agent generates tests
9. Agent verifies consistency
10. Agent provides detailed report
11. Review report and run manual verification if needed
12. Commit changes

### Disabling the Hook

If you prefer manual control:

1. Open `.kiro/hooks/prisma-sync-agent.kiro.hook`
2. Set `"enabled": false`
3. Use manual sync workflow from `.kiro/steering/database-sync.md`

### Support

For issues or questions:
1. Check `.kiro/steering/database-sync.md` for detailed guidelines
2. Review agent reports for specific error messages
3. Run verification script for diagnostic information
4. Check backend and frontend logs for errors
