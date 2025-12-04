# Radix UI Scrollbar White Line Fix

## The Problem

When you click on Radix UI components (Select, DropdownMenu, Popover, Dialog), a thin **white vertical line** appears on the right side of the screen.

### Root Cause Analysis

1. **Library**: All Radix UI components use `react-remove-scroll@2.7.1`
2. **Behavior**: When a Radix component opens:
   ```javascript
   // react-remove-scroll does this:
   document.body.style.overflow = 'hidden';  // Hides scrollbar
   document.body.style.paddingRight = '15px'; // Compensates for scrollbar width
   ```
3. **Result**: The scrollbar disappears, content shifts right, white gap appears

### Affected Components
- `<Select>` - Dropdown selects
- `<DropdownMenu>` - Menu dropdowns  
- `<Popover>` - Popover overlays
- `<Dialog>` - Modal dialogs
- `<Sheet>` - Side sheets

## The Solution (DEFINITIVE FIX - 2025)

Based on community research and Radix UI discussions, the working solution targets the `data-scroll-locked` attribute that `react-remove-scroll` adds to the body.

Applied in `frontend/src/app/globals.css`:

```css
/* Step 1: Always reserve scrollbar space */
html {
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-gutter: stable; /* Modern browsers */
}

/* Step 2: CRITICAL - Override react-remove-scroll behavior */
/* When Radix opens, it adds data-scroll-locked attribute */
body[data-scroll-locked] {
  margin-right: 0 !important;
  margin-left: 0 !important;
  padding-right: 0 !important;
  overflow: visible !important;
}
```

### How It Works

1. **`html { overflow-y: scroll; scrollbar-gutter: stable; }`**
   - Forces scrollbar to always be visible on HTML element
   - Reserves space for scrollbar to prevent layout shift
   - Works in Chrome 94+, Edge 94+, Firefox 97+

2. **`body[data-scroll-locked] { ... !important; }`**
   - Targets the exact attribute that react-remove-scroll adds
   - Cancels margin/padding compensation
   - Prevents overflow hidden behavior
   - This is the KEY fix that community found works reliably

3. **Why this works better than previous attempts:**
   - Previous fixes tried to override `body[style]` (inline styles)
   - But `react-remove-scroll` also adds `data-scroll-locked` attribute
   - Targeting the attribute is more reliable than fighting inline styles

## Testing

To verify the fix works:

1. Open your dashboard
2. Click on any dropdown (Select, notification bell, profile menu)
3. **Expected**: No white line appears
4. **Before fix**: White vertical line appeared on right side

## Browser Support

- ✅ Chrome/Edge 94+ (full support with scrollbar-gutter)
- ✅ Firefox 97+ (full support with scrollbar-gutter)
- ✅ Safari 15+ (works with overflow-y: scroll)
- ✅ All modern browsers (fallback to overflow-y: scroll)

## References

- [Radix UI Issue #1272](https://github.com/radix-ui/primitives/issues/1272)
- [react-remove-scroll](https://github.com/theKashey/react-remove-scroll)
- [Reddit Discussion](https://www.reddit.com/r/reactjs/comments/1fjcwkh/shadcnradix_ui_scrollbar_removal_bug/)

## Alternative Solutions (Not Used)

### Option 1: Disable react-remove-scroll
```typescript
// Not recommended - breaks scroll locking
<Select modal={false} />
```

### Option 2: Hide scrollbar completely
```css
/* Not recommended - bad UX
html::-webkit-scrollbar {
  display: none;
}
```

### Option 3: Use JavaScript
```typescript
// Not recommended - performance issues
useEffect(() => {
  document.body.style.paddingRight = '0px';
}, []);
```

## Why This Fix Works

The key insight is that `react-remove-scroll` manipulates the **body** element, but we force the scrollbar on the **html** element. This creates a separation:

- **HTML**: Always shows scrollbar (our control)
- **Body**: Can be manipulated by react-remove-scroll (doesn't affect scrollbar)

Result: No layout shift, no white line! ✅
