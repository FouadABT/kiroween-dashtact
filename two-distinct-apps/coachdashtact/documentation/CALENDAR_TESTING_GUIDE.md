# Calendar System - Testing Guide

## 🧪 How to Test All Fixes

### Prerequisites
```bash
# 1. Start backend
cd backend
npm run start:dev

# 2. Start frontend (in new terminal)
cd frontend
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## Test 1: API Error Fix ✅

### Test Widgets Load Without Errors

**Steps**:
1. Go to dashboard: `http://localhost:3000/dashboard`
2. Look for calendar widgets:
   - UpcomingEventsWidget
   - MiniCalendarWidget
   - TeamScheduleWidget
3. Check browser console (F12)

**Expected Result**:
- ✅ No "Internal server error" messages
- ✅ Widgets display events or "No events" message
- ✅ No red error messages in console

**If Still Failing**:
```bash
# Check backend logs
cd backend
npm run start:dev
# Look for errors in terminal

# Check API directly
curl http://localhost:3001/calendar/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Test 2: Calendar Page Loads ✅

### Test Main Calendar View

**Steps**:
1. Navigate to: `http://localhost:3000/dashboard/calendar`
2. Wait for page to load

**Expected Result**:
- ✅ Page header shows "Calendar"
- ✅ "New Event" button visible (top right)
- ✅ "Demo Event" button visible
- ✅ Calendar toolbar shows current month
- ✅ View switcher shows Month/Week/Day/Agenda
- ✅ No error messages

**Visual Check**:
```
┌─────────────────────────────────────────┐
│  Calendar                    [Demo] [+] │  ← Should see this
│  Manage your events and schedule        │
├─────────────────────────────────────────┤
│  [Today] [<] [>]  November 2025         │  ← Navigation
│  [Month] [Week] [Day] [Agenda] [Filter] │  ← View switcher
└─────────────────────────────────────────┘
```

---

## Test 3: Event Creation with Attendees ✅

### Test New Attendee Feature

**Steps**:
1. Click "New Event" button
2. Fill in basic details:
   - Title: "Test Meeting"
   - Start Date: Tomorrow
   - Start Time: 10:00 AM
   - End Time: 11:00 AM
3. Scroll down to "Attendees" section
4. Click "Add attendees" button
5. Search for a user
6. Click on user to add
7. Verify user appears as badge with avatar
8. Click X on badge to remove (test removal)
9. Add user again
10. Click "Create Event"

**Expected Result**:
- ✅ "Add attendees" button opens search popup
- ✅ Can search and find users
- ✅ Selected users show as badges with avatars
- ✅ Can remove users with X button
- ✅ Event saves successfully
- ✅ Toast shows "Event created successfully"
- ✅ Event appears in calendar

**Visual Check**:
```
Attendees:
[+ Add attendees]
[👤 John Doe ×] [👤 Jane Smith ×]  ← Should see this
```

---

## Test 4: Edit Event with Attendees ✅

### Test Attendee Editing

**Steps**:
1. Click on an existing event in calendar
2. Click "Edit" button in event details panel
3. Check "Attendees" section
4. Verify existing attendees are pre-loaded
5. Add a new attendee
6. Remove an existing attendee
7. Click "Update Event"

**Expected Result**:
- ✅ Existing attendees load correctly
- ✅ Can add new attendees
- ✅ Can remove attendees
- ✅ Changes save successfully
- ✅ Updated attendees show in event details

---

## Test 5: Widget Functionality ✅

### Test UpcomingEventsWidget

**Steps**:
1. Go to dashboard
2. Find UpcomingEventsWidget
3. Check if events display

**Expected Result**:
- ✅ Shows upcoming events (next 30 days)
- ✅ Events sorted by date
- ✅ Shows event time, location, category
- ✅ Click event opens details
- ✅ "View All Events" link works

### Test TeamScheduleWidget

**Steps**:
1. Find TeamScheduleWidget on dashboard
2. Select team members from list
3. Change view (Today/This Week)
4. Navigate dates with arrows

**Expected Result**:
- ✅ Shows selected team members
- ✅ Displays their events
- ✅ Can switch between Today/Week view
- ✅ Navigation works
- ✅ No API errors

### Test MiniCalendarWidget

**Steps**:
1. Find MiniCalendarWidget
2. Check current month display
3. Look for event indicators (dots)
4. Click on a date with events

**Expected Result**:
- ✅ Shows current month
- ✅ Dots appear on dates with events
- ✅ Today is highlighted
- ✅ Click date navigates to full calendar

---

## Test 6: Mobile Responsiveness ✅

### Test on Different Screen Sizes

**Steps**:
1. Open browser DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Expected Result**:
- ✅ Mobile: Stacked layout, simplified buttons
- ✅ Tablet: Compact view switcher
- ✅ Desktop: Full toolbar with all options
- ✅ All buttons accessible
- ✅ No horizontal scrolling
- ✅ Text readable at all sizes

---

## Test 7: Calendar Views ✅

### Test All View Types

**Steps**:
1. Go to calendar page
2. Click "Month" view
3. Click "Week" view
4. Click "Day" view
5. Click "Agenda" view

**Expected Result**:
- ✅ Each view renders correctly
- ✅ Events display in all views
- ✅ Navigation works in each view
- ✅ No layout issues
- ✅ Smooth transitions

---

## Test 8: Filters ✅

### Test Event Filtering

**Steps**:
1. Click "Filters" button in toolbar
2. Filter panel opens
3. Select a category
4. Select a user
5. Set date range
6. Apply filters

**Expected Result**:
- ✅ Filter panel opens/closes
- ✅ Can select multiple filters
- ✅ Events update based on filters
- ✅ Clear filters works
- ✅ Filters persist during navigation

---

## Test 9: Demo Event ✅

### Test Quick Demo Creation

**Steps**:
1. Click "Demo Event" button
2. Wait for toast notification

**Expected Result**:
- ✅ Toast shows "Demo event created!"
- ✅ Event appears in calendar (1 hour from now)
- ✅ Event has title "Demo Meeting"
- ✅ Event has description
- ✅ Event has location "Conference Room A"
- ✅ Event has 15 and 60 minute reminders

---

## Test 10: Settings Integration ✅

### Test Calendar Settings

**Steps**:
1. Go to: `http://localhost:3000/dashboard/settings/calendar`
2. Check "View Calendar" button in header
3. Click button

**Expected Result**:
- ✅ Button visible in page header
- ✅ Clicking navigates to calendar page
- ✅ Settings tabs work (General/Categories/Permissions)

---

## Common Issues & Solutions

### Issue: "Internal server error" in widgets
**Solution**: 
- Already fixed! Clear browser cache and refresh
- Check backend is running on port 3001
- Verify user is logged in

### Issue: Can't see attendee selector
**Solution**:
- Make sure you're using latest code
- Check browser console for errors
- Verify UserApi is accessible
- User needs `users:read` permission

### Issue: Events not showing
**Solution**:
- Check date range (try "Today" button)
- Verify user has `calendar:read` permission
- Check if any filters are active
- Look for events in database

### Issue: Can't create events
**Solution**:
- User needs `calendar:create` permission
- At least one category must exist
- Backend must be running
- Check browser console for errors

---

## Performance Testing

### Load Time Test
**Steps**:
1. Open DevTools Network tab
2. Navigate to calendar page
3. Check load times

**Expected**:
- ✅ Initial load < 2 seconds
- ✅ API calls < 500ms
- ✅ No failed requests
- ✅ Smooth scrolling

### Widget Performance
**Steps**:
1. Add multiple calendar widgets to dashboard
2. Check page responsiveness

**Expected**:
- ✅ All widgets load in parallel
- ✅ No blocking requests
- ✅ Page remains responsive
- ✅ No memory leaks

---

## Accessibility Testing

### Keyboard Navigation
**Steps**:
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Use arrow keys in calendar

**Expected**:
- ✅ All interactive elements focusable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Keyboard shortcuts work

### Screen Reader
**Steps**:
1. Enable screen reader (NVDA/JAWS)
2. Navigate calendar page
3. Listen to announcements

**Expected**:
- ✅ Page title announced
- ✅ Buttons have labels
- ✅ Form fields have labels
- ✅ Events are readable

---

## Browser Compatibility

### Test Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### What to Check
- ✅ Layout renders correctly
- ✅ All features work
- ✅ No console errors
- ✅ Smooth animations
- ✅ Touch gestures work (mobile)

---

## Automated Testing

### Run Backend Tests
```bash
cd backend
npm test
npm run test:e2e
```

### Run Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

---

## Sign-Off Checklist

Before marking as complete, verify:

### Functionality
- [ ] Calendar page loads without errors
- [ ] Can create events with attendees
- [ ] Can edit events and modify attendees
- [ ] Can delete events
- [ ] All widgets work correctly
- [ ] Filters work properly
- [ ] All views render correctly

### UI/UX
- [ ] Modern, professional design
- [ ] Responsive on all devices
- [ ] Smooth animations
- [ ] Clear visual hierarchy
- [ ] Intuitive navigation

### Performance
- [ ] Fast load times
- [ ] No API errors
- [ ] Efficient data fetching
- [ ] No memory leaks

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast sufficient

### Browser Support
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile

---

## 🎉 Success Criteria

All tests pass when:
- ✅ No API errors in console
- ✅ All widgets display correctly
- ✅ Event creation with attendees works
- ✅ Calendar views render properly
- ✅ Mobile responsive
- ✅ Accessible
- ✅ Fast performance

**If all tests pass, the calendar system is production-ready!** 🚀
