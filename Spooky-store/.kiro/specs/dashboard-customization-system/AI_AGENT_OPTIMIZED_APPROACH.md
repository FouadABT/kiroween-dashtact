# AI-Agent-Optimized Dashboard Customization System

## 🎯 Core Goal

Make the dashboard **maximally discoverable and modifiable by AI agents** like Kiro, enabling:
- AI can discover all available widgets
- AI can understand how to add new features
- AI can customize dashboard layouts programmatically
- AI can modify navigation structure
- AI can understand the system architecture instantly

## 🤖 Why This Matters for AI Agents

### Current Problem:
- AI agents have to parse React components to understand what's available
- Navigation is hardcoded in NavigationContext.tsx
- No central registry of capabilities
- No structured way to discover features
- Adding features requires understanding complex code

### Solution:
- **Database-driven metadata** = AI can query capabilities
- **Widget registry** = AI knows what components exist
- **Structured APIs** = AI can modify system declaratively
- **Self-documenting** = AI reads metadata, not code
- **Discovery endpoints** = AI asks "what can I do?"

## ✅ Revised Approach: AI-First Design

### Phase 1: AI Discovery Layer (HIGH PRIORITY)

#### 1.1 Capabilities Endpoint
```typescript
GET /api/capabilities
Response: {
  widgets: [...],           // All available widgets
  navigation: [...],        // Current navigation structure
  layouts: [...],           // Available layouts
  permissions: [...],       // User's permissions
  features: {...},          // Feature flags
  metadata: {...}           // System metadata
}
```

**Why**: AI can ask "what can this dashboard do?" in ONE API call

#### 1.2 Widget Registry (Database + Frontend)
```typescript
// Database: WidgetDefinition table
{
  key: "revenue-chart",
  name: "Revenue Chart",
  description: "AI-readable description of what this does",
  category: "analytics",
  configSchema: {...},      // JSON Schema for configuration
  dataRequirements: {...},  // What data it needs
  useCases: [...],          // When to use this widget
  examples: [...]           // Sample configurations
}

// Frontend: widget-registry.ts maps keys to components
```

**Why**: AI can discover widgets without parsing React code

#### 1.3 Steering Guide Enhancement
```markdown
# .kiro/steering/dashboard-capabilities.md

## Available Widgets
- revenue-chart: Shows revenue over time (use for: financial dashboards)
- data-table: Displays tabular data (use for: list views)
- stats-card: Single metric display (use for: KPIs)
[... all 40+ widgets documented]

## How to Add a New Widget
1. Create component in frontend/src/components/widgets/
2. Add to widget-registry.ts
3. Seed definition in database
4. Widget automatically appears in system

## How to Add Navigation Item
1. Add to Pages table with showInNavigation=true
2. Set icon, displayOrder, permission
3. Automatically appears in sidebar

## How to Create Dashboard Layout
1. Query GET /api/widgets/registry for available widgets
2. Create layout with POST /api/dashboard-layouts
3. Add widgets with POST /api/dashboard-layouts/:id/widgets
```

**Why**: AI reads this file and understands the entire system

### Phase 2: Simplified Implementation (REVISED SCOPE)

#### What to Build:

**✅ DO BUILD (AI Discovery Value)**:
1. **Widget Metadata System**
   - WidgetDefinition table (metadata only)
   - Widget registry API endpoints
   - Auto-scan existing widgets script
   - **Value**: AI can discover all 40+ widgets

2. **Dashboard Layout System**
   - DashboardLayout + WidgetInstance tables
   - Layout management API
   - WidgetContext + DashboardGrid components
   - **Value**: AI can create custom layouts programmatically

3. **AI Discovery Endpoints**
   - GET /api/capabilities (master endpoint)
   - GET /api/widgets/registry/search
   - OpenAPI/Swagger documentation
   - **Value**: AI can query system capabilities

4. **Enhanced Steering Guides**
   - Complete widget documentation
   - How-to guides for common tasks
   - Architecture overview
   - **Value**: AI understands system instantly

**❌ DON'T BUILD (Already Have It)**:
1. Navigation database tables (use existing Pages)
2. DynamicSidebar (keep current Sidebar)
3. Navigation Editor (enhance Pages editor)
4. Widget components (already have 40+)

#### Revised Database Schema (3 tables only):

```prisma
// 1. Widget metadata (for AI discovery)
model WidgetDefinition {
  id                String   @id @default(cuid())
  key               String   @unique
  name              String
  description       String   // AI-readable description
  category          String
  icon              String
  component         String
  configSchema      Json     // JSON Schema
  dataRequirements  Json     // API endpoints, permissions
  useCases          String[] // When to use this
  examples          Json[]   // Sample configs
  tags              String[] // Searchable keywords
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("widget_definitions")
}

// 2. Dashboard layouts (user customization)
model DashboardLayout {
  id          String   @id @default(cuid())
  pageId      String   // "overview", "analytics", etc.
  userId      String?  // null = global
  scope       String   @default("global")
  name        String
  description String?
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user            User?            @relation(fields: [userId], references: [id])
  widgetInstances WidgetInstance[]
  
  @@unique([pageId, userId])
  @@map("dashboard_layouts")
}

// 3. Widget instances (layout composition)
model WidgetInstance {
  id        String   @id @default(cuid())
  layoutId  String
  widgetKey String   // references WidgetDefinition.key
  position  Int
  gridSpan  Int      @default(6)
  config    Json     // Widget-specific config
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  layout DashboardLayout @relation(fields: [layoutId], references: [id], onDelete: Cascade)
  
  @@map("widget_instances")
}
```

### Phase 3: AI-Friendly Features

#### 3.1 Widget Auto-Discovery Script
```typescript
// backend/scripts/discover-widgets.ts
// Scans frontend/src/components/widgets/
// Extracts JSDoc comments
// Generates WidgetDefinition records
// AI can run this to update registry
```

#### 3.2 Natural Language Widget Search
```typescript
GET /api/widgets/registry/search?query=show revenue over time
// Returns: revenue-chart, line-chart, area-chart
// AI can search by intent, not just keywords
```

#### 3.3 Layout Templates with Descriptions
```typescript
GET /api/dashboard-layouts/templates
Response: [
  {
    name: "Analytics Dashboard",
    description: "Use for: financial reporting, KPI tracking",
    widgets: [
      { key: "revenue-chart", position: 0, span: 6 },
      { key: "stats-grid", position: 1, span: 6 }
    ],
    useCases: ["financial", "analytics", "reporting"]
  }
]
```

#### 3.4 Validation & Suggestions
```typescript
POST /api/dashboard-layouts/validate
Request: { widgets: [...] }
Response: {
  valid: true,
  suggestions: [
    "Consider adding stats-card for KPI summary",
    "revenue-chart works well with date-range-picker"
  ],
  warnings: ["Grid span exceeds 12 columns"]
}
```

## 📊 Revised Task Count

### Original Spec: 140 tasks
### AI-Optimized Spec: ~45 tasks

**Breakdown**:
- Database & Backend: 15 tasks
- Frontend Components: 12 tasks
- AI Discovery Layer: 8 tasks
- Documentation & Steering: 10 tasks

**Time Estimate**: 2-3 weeks
**Credit Cost**: Moderate
**Risk**: LOW (no breaking changes)
**AI Value**: VERY HIGH

## 🎯 Success Metrics for AI Agents

1. **Discovery Time**: AI can understand full system in <5 minutes
2. **Add Widget**: AI can add new widget in <10 minutes
3. **Create Layout**: AI can create custom layout in <5 minutes
4. **Modify Navigation**: AI can add menu item in <2 minutes
5. **Zero Code Reading**: AI never needs to parse React components

## 💡 Key Innovations for AI

### 1. Self-Documenting System
```typescript
// Every widget has AI-readable metadata
{
  key: "revenue-chart",
  description: "Displays revenue trends over time with period selection",
  useCases: [
    "Show monthly revenue trends",
    "Compare revenue across periods",
    "Display financial KPIs"
  ],
  examples: [
    {
      name: "Monthly Revenue",
      config: { period: "month", showComparison: true }
    }
  ]
}
```

### 2. Intent-Based Search
```typescript
// AI searches by what it wants to accomplish
"I need to show user growth" → returns: line-chart, area-chart, stats-card
"I need to display a list of orders" → returns: data-table, card-grid
```

### 3. Declarative Configuration
```typescript
// AI generates JSON, not React code
{
  pageId: "sales-dashboard",
  widgets: [
    { key: "revenue-chart", span: 8, config: { period: "month" } },
    { key: "stats-grid", span: 4, config: { metrics: ["sales", "orders"] } }
  ]
}
```

### 4. Validation & Guardrails
```typescript
// System validates AI's configuration
// Prevents invalid layouts
// Suggests improvements
// Catches errors before execution
```

## 🚀 Implementation Priority

### Week 1: Foundation
- [ ] Add 3 database tables
- [ ] Create widget auto-discovery script
- [ ] Seed widget definitions from existing widgets
- [ ] Build widget registry API

### Week 2: Layout System
- [ ] Build layout management API
- [ ] Create WidgetContext
- [ ] Build DashboardGrid component
- [ ] Build WidgetRenderer component

### Week 3: AI Discovery
- [ ] Build /api/capabilities endpoint
- [ ] Add widget search with intent matching
- [ ] Create layout templates
- [ ] Add validation & suggestions

### Week 4: Documentation
- [ ] Write comprehensive steering guides
- [ ] Document all 40+ widgets
- [ ] Create how-to guides
- [ ] Add OpenAPI documentation

## 📝 Next Steps

Would you like me to:

1. ✅ **Create the revised tasks.md** (45 tasks, AI-optimized)
2. ✅ **Update the requirements.md** (focus on AI discoverability)
3. ✅ **Create enhanced steering guide** (complete widget documentation)
4. ✅ **Start implementation** (begin with Phase 1)

This approach gives you:
- **Maximum AI agent value**
- **Minimal breaking changes**
- **Leverages existing work**
- **Clear path forward**

What do you think? Should I proceed with creating the revised spec? 🚀
