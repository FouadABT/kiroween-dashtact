# 🚀 Dashtact Deployment - Quick Reference

## 🌐 URLs
- **App:** https://kit.dashtact.com
- **API:** https://kit.dashtact.com/api

## 🔑 SSH Access
```bash
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109
```

## 📊 Service Status
```bash
# View all services
pm2 list

# View logs
pm2 logs kit-backend
pm2 logs kit-frontend
pm2 logs  # All logs
```

## 🔄 Restart Services
```bash
# Restart backend
pm2 restart kit-backend

# Restart frontend
pm2 restart kit-frontend

# Restart all
pm2 restart all

# Reload Nginx
sudo systemctl reload nginx
```

## 📁 Directories
- Backend: `/home/ubuntu/apps/kit-dashtact/backend/`
- Frontend: `/home/ubuntu/apps/kit-dashtact/frontend/`
- Backups: `/home/ubuntu/backups/`

## 🔧 Quick Fixes

### Backend not responding:
```bash
cd /home/ubuntu/apps/kit-dashtact/backend
pm2 restart kit-backend
pm2 logs kit-backend --lines 50
```

### Frontend not responding:
```bash
cd /home/ubuntu/apps/kit-dashtact/frontend
pm2 restart kit-frontend
pm2 logs kit-frontend --lines 50
```

### Nginx issues:
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/kit.dashtact.com.error.log
```

### Database issues:
```bash
sudo systemctl status postgresql
PGPASSWORD='UcbMjpOJEbocT32GqNS20SYHSTr59JiS' psql -U kit_dashtact_user -d kit_dashtact_db
```

## 🔄 Redeploy

### Backend only:
```bash
cd /home/ubuntu/apps/kit-dashtact/backend
git pull  # or upload new files
npm install
npm run build
pm2 restart kit-backend
```

### Frontend only:
```bash
cd /home/ubuntu/apps/kit-dashtact/frontend
git pull  # or upload new files
npm install
npm run build
pm2 restart kit-frontend
```

## 💾 Database Backup
```bash
PGPASSWORD='UcbMjpOJEbocT32GqNS20SYHSTr59JiS' pg_dump -U kit_dashtact_user -d kit_dashtact_db > /home/ubuntu/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🆘 Emergency Rollback
```bash
pm2 resurrect
sudo systemctl reload nginx
```
