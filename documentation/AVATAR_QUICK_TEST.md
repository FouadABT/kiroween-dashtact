# Avatar Issue - Quick Test Guide

## 🚀 Quick Start

1. **Restart Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Restart Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser Console**: Press `F12`

4. **Clear Console**: Press `Ctrl+L` (Windows) or `Cmd+K` (Mac)

## 🔍 Test 1: Login Flow (2 minutes)

1. Log out if logged in
2. Log back in with: `fouad.abt@gmail.com`
3. **Watch console for**:
   ```
   [AuthContext] Login response received: { avatarUrl: "...", hasAvatar: true }
   [Header] Rendering with user: { avatarUrl: "...", hasAvatar: true }
   ```

**✅ Success**: Avatar appears in header
**❌ Fail**: Share console logs

## 🔍 Test 2: Page Refresh (1 minute)

1. Refresh page (F5)
2. **Watch console for**:
   ```
   [AuthContext] User profile loaded: { avatarUrl: "...", hasAvatar: true }
   [Header] Rendering with user: { avatarUrl: "...", hasAvatar: true }
   ```

**✅ Success**: Avatar persists
**❌ Fail**: Share console logs

## 🔍 Test 3: Avatar Upload (2 minutes)

1. Go to `/dashboard/profile`
2. Upload new avatar
3. **Watch console for**:
   ```
   [useAvatarUpload] Upload successful, new avatar URL: ...
   [AuthContext] User profile refreshed: { avatarChanged: true }
   [Header] Rendering with user: { avatarUrl: "...", hasAvatar: true }
   ```

**✅ Success**: Header updates immediately
**❌ Fail**: Share console logs

## 📊 What to Share If Issue Persists

### Backend Logs (Terminal)
Look for lines starting with `[AuthService]`

### Frontend Logs (Browser Console)
Look for lines starting with:
- `[AuthContext]`
- `[Header]`
- `[useAvatarUpload]`

### Network Tab
1. Open DevTools → Network tab
2. Find `POST /auth/login` request
3. Click → Response tab
4. Check if `user.avatarUrl` exists

## 🎯 Expected Results

### Your Current Avatar URL
```
http://localhost:3001/uploads/avatars/cmhr1gmum0001iwrswetmk40m-5131b51c-0fe7-4c1e-a375-f0ca84e9e9ee.webp
```

### What Should Happen
1. **Login**: Avatar appears immediately
2. **Refresh**: Avatar persists
3. **Upload**: Header updates without refresh

## 🐛 Common Issues

| Issue | Console Shows | Solution |
|-------|---------------|----------|
| Avatar not in DB | `avatarUrl: null` everywhere | Re-upload avatar |
| Not in login response | Backend has URL, frontend doesn't | Check backend logs |
| Not in AuthContext | Login has URL, Header doesn't | Check state updates |
| Not refreshing | Upload succeeds, no refresh log | Check refreshUser() |

## 📝 Quick Checklist

Before testing:
- [ ] Backend server restarted
- [ ] Frontend server restarted
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Console open (F12)
- [ ] Console cleared (Ctrl+L)

During testing:
- [ ] Watch for `[AuthContext]` logs
- [ ] Watch for `[Header]` logs
- [ ] Check `avatarUrl` value in each log
- [ ] Check `hasAvatar` is `true`

## 💡 Pro Tips

1. **Filter Console**: Type `[AuthContext]` in console filter to see only auth logs
2. **Preserve Log**: Check "Preserve log" in console to keep logs across page loads
3. **Copy Logs**: Right-click console → "Save as..." to save all logs

## 🆘 Still Not Working?

Share these 3 things:
1. **Backend terminal output** (lines with `[AuthService]`)
2. **Browser console output** (all logs)
3. **Network tab screenshot** of `/auth/login` response

---

**Time to test**: ~5 minutes
**Expected result**: Avatar shows in header after login
**Logs added**: ✅ Complete coverage of avatar flow
