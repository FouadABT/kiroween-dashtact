---
inclusion: always
---

# MCP Tools Usage Guidelines

## Overview

This project uses Model Context Protocol (MCP) servers for specialized operations. **Always use MCP tools when available** - they provide superior functionality, reliability, and performance compared to shell commands.

**Stack**: GitHub MCP + Postgres MCP + Time MCP + shadcn/ui MCP

---

## Available MCP Servers

### 1. Postgres MCP (`mcp_postgres_*`)
**Purpose**: PostgreSQL database operations, analysis, and optimization

**Configuration**:
- Mode: `unrestricted` (full read/write access)
- Database: `postgresql://postgres:d1d1d1f1@localhost:5432/myapp`

**When to Use**:
- ✅ **ALWAYS** for database queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Database schema inspection
- ✅ Performance analysis and optimization
- ✅ Index recommendations
- ✅ Database health checks

**Available Tools**:
- `mcp_postgres_execute_sql` - Run any SQL (read/write)
- `mcp_postgres_list_schemas` - List database schemas
- `mcp_postgres_list_objects` - List tables, views, sequences
- `mcp_postgres_get_object_details` - Get table structure, indexes
- `mcp_postgres_explain_query` - Analyze query performance
- `mcp_postgres_get_top_queries` - Find slow queries
- `mcp_postgres_analyze_workload_indexes` - Index recommendations
- `mcp_postgres_analyze_db_health` - Health checks

**Example**:
```typescript
// ✅ CORRECT
mcp_postgres_execute_sql("SELECT * FROM users WHERE email = 'user@example.com'")

// ❌ WRONG
executePwsh("psql -c 'SELECT * FROM users'")
```

### 2. GitHub MCP (`mcp_github_*`)
**Purpose**: GitHub repository operations, code search, and collaboration

**Available Tools**:
- `mcp_github_search_repositories` - Find repositories
- `mcp_github_create_repository` - Create new repos
- `mcp_github_get_file_contents` - Read files from GitHub
- `mcp_github_push_files` - Push multiple files in one commit
- `mcp_github_create_issue` - Create issues
- `mcp_github_create_pull_request` - Create PRs
- `mcp_github_list_commits` - View commit history
- `mcp_github_search_code` - Search code across repos

**Example**:
```typescript
// ✅ CORRECT
mcp_github_search_repositories({query: "nextjs authentication"})

// ❌ WRONG
executePwsh("gh repo search 'nextjs authentication'")
```

### 3. Time MCP (`mcp_time_*`)
**Purpose**: Timezone-aware time operations

**Configuration**: Local timezone: `America/New_York`

**Available Tools**:
- `mcp_time_get_current_time` - Get current time in timezone
- `mcp_time_convert_time` - Convert between timezones

### 4. shadcn/ui MCP (`mcp_shadcn_*`)
**Purpose**: UI component discovery and usage

**Available Tools**:
- `mcp_shadcn_search_items_in_registries` - Search components
- `mcp_shadcn_view_items_in_registries` - View component details
- `mcp_shadcn_get_item_examples_from_registries` - Get usage examples
- `mcp_shadcn_get_add_command_for_items` - Get CLI install command

---

## Usage Rules

### Rule 1: Prefer MCP Over Shell Commands

**Database Operations**:
```typescript
// ✅ CORRECT
mcp_postgres_execute_sql("SELECT * FROM users")

// ❌ WRONG
executePwsh("psql -c 'SELECT * FROM users'")
```

**GitHub Operations**:
```typescript
// ✅ CORRECT
mcp_github_create_repository({name: "my-repo"})

// ❌ WRONG
executePwsh("gh repo create my-repo")
```

### Rule 2: Always Verify Write Operations

After INSERT/UPDATE/DELETE, verify with SELECT:
```sql
-- 1. Insert
INSERT INTO notifications (id, user_id, title, message, category, priority, created_at, updated_at)
VALUES (gen_random_uuid(), 'user_id', 'Title', 'Message', 'SYSTEM', 'NORMAL', NOW(), NOW())
RETURNING id, title, created_at;

-- 2. Verify
SELECT * FROM notifications WHERE id = 'returned_id';
```

### Rule 3: Use Proper Type Casting

PostgreSQL requires explicit type casting:
```sql
-- JSON/JSONB
'{"key": "value"}'::jsonb

-- Arrays
ARRAY['item1', 'item2']

-- Timestamps
NOW(), CURRENT_TIMESTAMP
```

### Rule 4: Error Handling

If an MCP tool fails:
1. Read the error message carefully
2. Fix the issue (syntax, types, constraints)
3. Retry with corrections
4. **Don't fall back to shell commands**

---

## Response Format

### When Using MCP Tools

**Always provide**:
1. ✅ What you did (brief summary)
2. ✅ The result (key data points)
3. ✅ Verification (if write operation)
4. ✅ Thank you message

**Example**:
```
✅ Added notification to your account (fouad.abt@gmail.com)

Details:
- Title: "MCP Integration Success! 🎉"
- Priority: HIGH
- Status: Unread
- Created: 2025-11-16 19:41:56

Verified: Notification appears in your notifications table.

Thank you! The postgres MCP is working perfectly with full write access.
```

---

## Best Practices

### Database Queries

```sql
-- ✅ Good: Specific columns, proper joins
SELECT u.id, u.email, u.name, n.title, n.created_at
FROM users u
JOIN notifications n ON n.user_id = u.id
WHERE u.email = 'user@example.com'
ORDER BY n.created_at DESC
LIMIT 10;

-- ❌ Bad: SELECT *, no filters
SELECT * FROM notifications;
```

### Write Operations

```sql
-- ✅ Good: Use RETURNING to get created data
INSERT INTO notifications (id, user_id, title, message, category, priority, created_at, updated_at)
VALUES (gen_random_uuid(), 'user_id', 'Title', 'Message', 'SYSTEM', 'NORMAL', NOW(), NOW())
RETURNING id, title, created_at;

-- ❌ Bad: No RETURNING clause
INSERT INTO notifications (...) VALUES (...);
```

### Performance Analysis

When asked about performance:
1. Use `mcp_postgres_get_top_queries`
2. Use `mcp_postgres_explain_query` for specific queries
3. Use `mcp_postgres_analyze_workload_indexes` for recommendations

---

## Common Scenarios

### Scenario 1: Add Data to Database

1. Get user/entity ID if needed
2. Use `mcp_postgres_execute_sql` with INSERT
3. Use RETURNING to get created record
4. Verify with SELECT
5. Summarize and thank

### Scenario 2: Check Database Performance

1. Use `mcp_postgres_analyze_db_health`
2. Use `mcp_postgres_get_top_queries`
3. Provide recommendations
4. Thank user

### Scenario 3: Find GitHub Examples

1. Use `mcp_github_search_repositories` or `mcp_github_search_code`
2. Show relevant results
3. Offer to view specific files if needed
4. Thank user

---

## What NOT to Do

### Don't Use Shell Commands for MCP Tasks

```
❌ executePwsh("psql ...")
❌ executePwsh("gh ...")
❌ executePwsh("curl github.com ...")
```

### Don't Skip Verification

```
❌ Insert data without checking it was created
❌ Update without confirming changes
❌ Delete without verifying removal
```

### Don't Ignore MCP Errors

```
❌ "MCP failed, let me try shell commands instead"
✅ "MCP failed, let me fix the SQL syntax and retry"
```

---

## Quick Reference

### Database Operations
```typescript
// ✅ Use Postgres MCP
mcp_postgres_execute_sql("SELECT * FROM users WHERE email = 'user@example.com'")

// ❌ Don't use shell
executePwsh("psql -c 'SELECT * FROM users'")
```

### GitHub Operations
```typescript
// ✅ Use GitHub MCP
mcp_github_search_repositories({query: "nextjs authentication"})

// ❌ Don't use shell
executePwsh("gh repo search 'nextjs authentication'")
```

### Response Pattern
```
✅ [Action completed]

[Key details]

[Verification if write operation]

Thank you! [Brief positive note]
```

---

## Remember

1. **MCP First** - Always check if an MCP tool exists for the task
2. **Verify** - Confirm write operations succeeded
3. **Summarize** - Provide clear, concise results
4. **Thank** - End with appreciation
5. **No Shell** - Avoid shell commands for MCP-capable tasks
