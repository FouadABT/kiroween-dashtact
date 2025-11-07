# Prisma Sync Agent - Quick Reference Card

## 🚀 Quick Commands

```bash
# Verify sync status
node .kiro/scripts/verify-prisma-sync.js

# Generate tests for all models
node .kiro/scripts/generate-sync-tests.js

# Backend: Generate Prisma client
cd backend && npm run prisma:generate

# Backend: Create migration
cd backend && npm run prisma:migrate

# Backend: Run tests
cd backend && npm test

# Frontend: Build check
cd frontend && npm run build
```

## 📁 Monitored Files

The hook automatically triggers when you edit:
- `backend/prisma/schema.prisma`
- `frontend/src/types/*.ts`
- `backend/src/**/*.entity.ts`
- `backend/src/**/*.dto.ts`
- `frontend/src/lib/api.ts`

## ✅ What Happens Automatically

1. **Analyzes** your changes
2. **Generates** Prisma migration
3. **Updates** backend services & DTOs
4. **Syncs** frontend types
5. **Creates** comprehensive tests
6. **Verifies** type consistency
7. **Reports** results with rollback instructions

## 🛡️ Safety Rules

- ✅ Never deletes migrations
- ✅ Verifies types match
- ✅ Creates tests first
- ✅ Checks compilation
- ✅ Stops on errors
- ✅ Preserves functionality
- ✅ Minimal changes only

## 📊 After Sync Checklist

- [ ] Review agent report
- [ ] Run verification script
- [ ] Check generated tests
- [ ] Run backend tests
- [ ] Build backend
- [ ] Build frontend
- [ ] Test API endpoints
- [ ] Commit changes

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Hook not triggering | Check `.kiro/hooks/prisma-sync-agent.kiro.hook` enabled |
| Type mismatch | Run `verify-prisma-sync.js` |
| Test failures | Run `generate-sync-tests.js` |
| Compilation errors | Check agent report for details |
| Prisma client issues | Run `npm run prisma:generate` |

## 📚 Documentation

- **Full Guide**: `.kiro/hooks/README.md`
- **Improvements**: `.kiro/hooks/IMPROVEMENTS.md`
- **Steering**: `.kiro/steering/database-sync.md`
- **Hook Config**: `.kiro/hooks/prisma-sync-agent.kiro.hook`

## 🎯 Common Workflows

### Adding a New Field
1. Edit `backend/prisma/schema.prisma`
2. Save (hook triggers)
3. Review report
4. Run verification
5. Test & commit

### Changing Frontend Type
1. Edit `frontend/src/types/*.ts`
2. Save (hook triggers)
3. Agent checks Prisma schema
4. Updates backend if needed
5. Review report

### Updating DTO
1. Edit `backend/src/*/*.dto.ts`
2. Save (hook triggers)
3. Agent syncs frontend types
4. Generates tests
5. Review report

## 🔄 Manual Override

Disable hook and use manual workflow:
1. Set `"enabled": false` in hook file
2. Edit schema manually
3. Run `npm run prisma:migrate`
4. Run `npm run prisma:generate`
5. Update types manually
6. Run `verify-prisma-sync.js`
7. Run `generate-sync-tests.js`

## 💡 Pro Tips

- Always review the agent's report
- Run verification after major changes
- Keep tests updated
- Check for breaking changes
- Use rollback instructions if needed
- Test locally before committing
