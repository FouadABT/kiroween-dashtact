# Landing CMS Visual Editor

## Overview

The Visual Editor provides a modern, intuitive interface for creating and managing landing page sections with drag-and-drop functionality, real-time preview, and comprehensive editing capabilities.

## Components

### VisualEditor

Main editor component with split-screen layout.

**Features:**
- ✅ Drag-and-drop section reordering
- ✅ Real-time preview synchronization
- ✅ Undo/redo functionality (last 50 changes)
- ✅ Debounced auto-save (3 seconds)
- ✅ Responsive preview modes (mobile, tablet, desktop, wide)
- ✅ Theme toggle (light/dark)
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+S)
- ✅ Section visibility toggle
- ✅ Section duplication
- ✅ Section deletion

**Props:**
```typescript
interface VisualEditorProps {
  initialSections: LandingPageSection[];
  onSave: (sections: LandingPageSection[]) => Promise<void>;
  autoSaveEnabled?: boolean;
}
```

**Usage:**
```tsx
import { VisualEditor } from '@/components/landing/VisualEditor';

<VisualEditor
  initialSections={sections}
  onSave={handleSave}
  autoSaveEnabled={true}
/>
```

### SectionListSidebar

Sidebar component displaying sections with drag handles and quick actions.

**Features:**
- ✅ Drag handles for reordering
- ✅ Visual feedback during drag
- ✅ Quick action buttons (edit, duplicate, delete, toggle visibility)
- ✅ Selected section highlighting
- ✅ Section order display
- ✅ Empty state message

### PreviewPanel

Preview panel with device frames and real-time updates.

**Features:**
- ✅ Device frame visualization (mobile, tablet, desktop, wide)
- ✅ Hover interactions with quick action buttons
- ✅ Selected section highlighting
- ✅ Theme-aware rendering
- ✅ Auto-scroll to selected section
- ✅ Responsive dimensions

**Device Dimensions:**
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1440x900
- Wide: 1920x1080

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + Y` | Redo (alternative) |
| `Ctrl/Cmd + S` | Save |

## Section Structure

```typescript
interface LandingPageSection {
  id: string;
  type: string;
  content: any;
  design?: SectionDesign;
  layout?: SectionLayout;
  animation?: SectionAnimation;
  advanced?: SectionAdvanced;
  visible: boolean;
  order: number;
}
```

## History Management

The editor maintains a history stack of up to 50 changes, allowing users to undo and redo modifications. Each history entry includes:
- Complete section state
- Timestamp

## Auto-Save

Auto-save is triggered 3 seconds after the last change (debounced). The saving indicator shows the current save status.

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators
- ✅ Screen reader friendly

## Integration

To integrate with your API:

```typescript
const handleSave = async (sections: LandingPageSection[]) => {
  await ApiClient.put('/landing/content', { sections });
};
```

## Example Page

See `frontend/src/app/admin/landing-editor/page.tsx` for a complete implementation example.
