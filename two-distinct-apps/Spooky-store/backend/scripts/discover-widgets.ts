/**
 * Widget Auto-Discovery Script
 * 
 * Scans the frontend widgets directory and generates WidgetDefinition records
 * by extracting metadata from JSDoc comments, TypeScript prop types, and
 * directory structure.
 * 
 * Usage:
 *   npm run discover:widgets
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// ============================================================================
// Types
// ============================================================================

interface WidgetMetadata {
  key: string;
  name: string;
  description: string;
  component: string;
  category: string;
  icon: string;
  defaultGridSpan: number;
  minGridSpan: number;
  maxGridSpan: number;
  configSchema: Record<string, any>;
  dataRequirements: {
    endpoints?: string[];
    permissions?: string[];
    refreshInterval?: number;
    dependencies?: string[];
  };
  useCases: string[];
  examples: Array<{
    title: string;
    code: string;
  }>;
  tags: string[];
  isSystemWidget: boolean;
}

interface JSDocMetadata {
  description: string;
  category?: string;
  useCases: string[];
  examples: Array<{ title: string; code: string }>;
  tags: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const WIDGETS_DIR = path.resolve(__dirname, '../../frontend/src/components/widgets');
const OUTPUT_FILE = path.resolve(__dirname, '../prisma/seed-data/widgets.seed.ts');

// Category mapping from directory names
const CATEGORY_MAP: Record<string, string> = {
  core: 'core',
  'data-display': 'data-display',
  forms: 'forms',
  interactive: 'interactive',
  layout: 'layout',
  advanced: 'advanced',
  specialized: 'specialized',
  utility: 'utility',
  integration: 'integration',
};

// Default icon mapping by category
const DEFAULT_ICONS: Record<string, string> = {
  core: 'LayoutDashboard',
  'data-display': 'BarChart3',
  forms: 'FileInput',
  interactive: 'MousePointerClick',
  layout: 'Layout',
  advanced: 'Sparkles',
  specialized: 'Puzzle',
  utility: 'Wrench',
  integration: 'Plug',
};

// ============================================================================
// Widget Scanner
// ============================================================================

/**
 * Recursively scan directory for widget files
 */
function scanWidgetFiles(dir: string, category?: string): Array<{ filePath: string; category: string }> {
  const results: Array<{ filePath: string; category: string }> = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip certain directories
      if (entry.name === 'types' || entry.name === '__tests__') {
        continue;
      }
      
      // Determine category from directory name
      const dirCategory = CATEGORY_MAP[entry.name] || category || 'core';
      results.push(...scanWidgetFiles(fullPath, dirCategory));
    } else if (entry.isFile()) {
      // Only process .tsx files (not .ts, not index.ts, not examples.tsx, not README)
      if (
        entry.name.endsWith('.tsx') &&
        !entry.name.includes('index') &&
        !entry.name.includes('examples') &&
        !entry.name.includes('test') &&
        !entry.name.includes('README')
      ) {
        results.push({
          filePath: fullPath,
          category: category || 'core',
        });
      }
    }
  }
  
  return results;
}

/**
 * Extract JSDoc metadata from source code
 */
function extractJSDocMetadata(sourceFile: ts.SourceFile): JSDocMetadata {
  const metadata: JSDocMetadata = {
    description: '',
    useCases: [],
    examples: [],
    tags: [],
  };
  
  // Find the main component function/export
  ts.forEachChild(sourceFile, (node) => {
    // Look for function declarations or variable declarations with JSDoc
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isExportAssignment(node)
    ) {
      const jsDocTags = ts.getJSDocTags(node);
      const jsDocComments = ts.getJSDocCommentsAndTags(node);
      
      // Extract description from JSDoc comment
      for (const comment of jsDocComments) {
        if (ts.isJSDoc(comment)) {
          const commentText = comment.comment;
          if (typeof commentText === 'string') {
            metadata.description = commentText.trim();
          }
        }
      }
      
      // Extract tags
      for (const tag of jsDocTags) {
        const tagName = tag.tagName.text;
        const tagComment = typeof tag.comment === 'string' ? tag.comment : '';
        
        if (tagName === 'category') {
          metadata.category = tagComment.trim();
        } else if (tagName === 'useCase') {
          metadata.useCases.push(tagComment.trim());
        } else if (tagName === 'example') {
          // Extract example title and code
          const lines = tagComment.split('\n');
          const title = lines[0]?.trim() || 'Example';
          const code = lines.slice(1).join('\n').trim();
          metadata.examples.push({ title, code });
        } else if (tagName === 'tag') {
          metadata.tags.push(tagComment.trim());
        }
      }
    }
  });
  
  // If no description found in JSDoc, try to extract from leading comment
  if (!metadata.description) {
    const fullText = sourceFile.getFullText();
    const commentMatch = fullText.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (commentMatch) {
      metadata.description = commentMatch[1];
    }
  }
  
  return metadata;
}

/**
 * Extract prop types and generate config schema
 */
function extractConfigSchema(sourceFile: ts.SourceFile, componentName: string): Record<string, any> {
  const schema: Record<string, any> = {
    type: 'object',
    properties: {},
    required: [],
  };
  
  // Find the Props interface
  const propsInterfaceName = `${componentName}Props`;
  
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === propsInterfaceName) {
      // Extract properties from interface
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          const isOptional = member.questionToken !== undefined;
          
          // Skip base widget props
          if (['loading', 'error', 'permission', 'className'].includes(propName)) {
            continue;
          }
          
          // Determine type
          let propType = 'string';
          if (member.type) {
            const typeText = member.type.getText(sourceFile);
            if (typeText.includes('number')) propType = 'number';
            else if (typeText.includes('boolean')) propType = 'boolean';
            else if (typeText.includes('[]')) propType = 'array';
            else if (typeText.includes('{')) propType = 'object';
          }
          
          schema.properties[propName] = {
            type: propType,
            description: '', // Could extract from JSDoc if available
          };
          
          if (!isOptional) {
            schema.required.push(propName);
          }
        }
      }
    }
  });
  
  return schema;
}

/**
 * Detect required permissions from PermissionGuard usage
 */
function detectPermissions(sourceCode: string): string[] {
  const permissions: string[] = [];
  
  // Look for PermissionGuard usage
  const permissionGuardRegex = /<PermissionGuard\s+permission=["']([^"']+)["']/g;
  let match;
  
  while ((match = permissionGuardRegex.exec(sourceCode)) !== null) {
    permissions.push(match[1]);
  }
  
  // Look for permission prop usage
  const permissionPropRegex = /permission=["']([^"']+)["']/g;
  while ((match = permissionPropRegex.exec(sourceCode)) !== null) {
    if (!permissions.includes(match[1])) {
      permissions.push(match[1]);
    }
  }
  
  return permissions;
}

/**
 * Generate widget key from component name
 */
function generateWidgetKey(componentName: string): string {
  // Convert PascalCase to kebab-case
  return componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Generate AI-friendly description
 */
function generateDescription(componentName: string, jsDocDesc: string, category: string): string {
  if (jsDocDesc) {
    return jsDocDesc;
  }
  
  // Generate intelligent descriptions based on component name
  const name = componentName.toLowerCase();
  
  // Specific component descriptions
  const descriptions: Record<string, string> = {
    'statscard': 'Display a single key metric with optional icon, trend indicator, and color coding. Perfect for dashboard KPIs.',
    'chartwidget': 'Versatile chart component supporting line, bar, pie, area, and composed charts. Uses Recharts with theme integration.',
    'datatable': 'Full-featured data table with sorting, filtering, pagination, and row actions. Built on TanStack Table.',
    'activityfeed': 'Display a chronological list of user activities and system events with timestamps and user avatars.',
    'statsgrid': 'Grid layout for displaying multiple statistics cards in a responsive layout.',
    'widgetcontainer': 'Base container component providing consistent styling, loading states, and error handling for all widgets.',
    'metriccard': 'Large metric display with comparison data, percentage changes, and formatted values (currency, percentage, number).',
    'listwidget': 'Generic list component for displaying collections of items with icons and metadata.',
    'cardgrid': 'Responsive grid layout for displaying multiple cards with consistent spacing.',
    'progresswidget': 'Visual progress indicator with percentage display and customizable colors.',
    'calendar': 'Interactive calendar component for displaying and managing events with multiple view modes.',
    'kanbanboard': 'Drag-and-drop Kanban board for task management and workflow visualization.',
    'timeline': 'Vertical timeline component for displaying chronological events and milestones.',
    'treeview': 'Hierarchical tree structure for displaying nested data with expand/collapse functionality.',
    'filterp anel': 'Advanced filtering interface with multiple filter types (text, select, date, range).',
    'searchbar': 'Search input with debouncing, suggestions, and keyboard navigation.',
    'quickactions': 'Collection of action buttons with icons and permission-based visibility.',
    'notificationwidget': 'Display system notifications with real-time updates and action buttons.',
    'daterangepicker': 'Date range selection with preset ranges and calendar interface.',
    'fileupload': 'File upload component with drag-and-drop, progress tracking, and validation.',
    'formcard': 'Card container for forms with consistent styling and layout.',
    'multiselect': 'Multi-selection dropdown with search and tag display.',
    'pageheader': 'Page header with title, description, breadcrumbs, and action buttons.',
    'emptystate': 'Empty state placeholder with icon, message, and call-to-action.',
    'errorboundary': 'Error boundary component for graceful error handling and fallback UI.',
    'skeletonloader': 'Loading skeleton for various content types (text, card, table, chart).',
    'chatwidget': 'Chat interface with message history, input, and real-time updates.',
    'comparisontable': 'Side-by-side comparison table for features, plans, or products.',
    'mapwidget': 'Interactive map component for displaying geographic data.',
    'pricingcard': 'Pricing plan card with features list and call-to-action button.',
    'usercard': 'User profile card with avatar, name, role, and action buttons.',
    'avatar': 'User avatar with fallback initials and status indicator.',
    'badge': 'Small badge component for labels, counts, and status indicators.',
    'modal': 'Modal dialog with customizable size and permission-based access.',
    'tooltip': 'Tooltip component for displaying contextual information on hover.',
    'apiwidget': 'Generic API data fetcher with auto-refresh and render prop pattern.',
    'bulkactions': 'Bulk action toolbar for performing operations on multiple selected items.',
    'exportbutton': 'Export data to various formats (CSV, PDF, Excel, JSON).',
    'permissionwrapper': 'Permission-based visibility wrapper for protecting UI elements.',
    'themepreview': 'Live theme preview component for testing color schemes.',
  };
  
  if (descriptions[name]) {
    return descriptions[name];
  }
  
  // Fallback: Generate basic description from component name
  const readable = componentName.replace(/([A-Z])/g, ' $1').trim();
  return `${readable} component for ${category} functionality`;
}

/**
 * Generate use cases based on component type
 */
function generateUseCases(componentName: string, category: string, jsDocUseCases: string[]): string[] {
  if (jsDocUseCases.length > 0) {
    return jsDocUseCases;
  }
  
  // Generate specific use cases based on component name
  const name = componentName.toLowerCase();
  
  const specificUseCases: Record<string, string[]> = {
    'statscard': ['Display KPIs on dashboard', 'Show revenue metrics', 'Track user growth', 'Monitor conversion rates'],
    'chartwidget': ['Visualize revenue trends', 'Display sales data', 'Show user analytics', 'Track performance metrics'],
    'datatable': ['List users with actions', 'Display product inventory', 'Show order history', 'Manage customer data'],
    'activityfeed': ['Show recent user actions', 'Display system events', 'Track audit logs', 'Monitor user activity'],
    'statsgrid': ['Dashboard overview page', 'Executive summary', 'KPI dashboard', 'Performance monitoring'],
    'metriccard': ['Display monthly revenue', 'Show conversion rates', 'Track active users', 'Monitor growth metrics'],
    'listwidget': ['Display recent orders', 'Show notification list', 'List team members', 'Display search results'],
    'progresswidget': ['Show task completion', 'Display upload progress', 'Track goal achievement', 'Monitor project status'],
    'calendar': ['Schedule meetings', 'Display events', 'Manage appointments', 'Track deadlines'],
    'kanbanboard': ['Manage tasks', 'Track project workflow', 'Organize sprints', 'Visualize pipeline'],
    'timeline': ['Display project milestones', 'Show order history', 'Track user journey', 'Visualize process steps'],
    'treeview': ['Display file structure', 'Show organization hierarchy', 'Navigate categories', 'Browse nested data'],
    'filterpanel': ['Filter product listings', 'Search users', 'Refine search results', 'Apply data filters'],
    'searchbar': ['Search products', 'Find users', 'Look up orders', 'Query database'],
    'quickactions': ['Dashboard shortcuts', 'Common tasks', 'Frequent operations', 'Quick access menu'],
    'notificationwidget': ['Display alerts', 'Show system messages', 'User notifications', 'Real-time updates'],
    'daterangepicker': ['Select report period', 'Filter by date', 'Choose time range', 'Set date filters'],
    'fileupload': ['Upload product images', 'Import CSV data', 'Upload documents', 'Attach files'],
    'formcard': ['User registration', 'Profile editing', 'Settings forms', 'Data entry'],
    'multiselect': ['Select categories', 'Choose tags', 'Pick options', 'Filter by multiple values'],
    'pageheader': ['Page title and navigation', 'Breadcrumb display', 'Action buttons', 'Page context'],
    'emptystate': ['No data placeholder', 'Empty search results', 'First-time user experience', 'Onboarding prompts'],
    'errorboundary': ['Graceful error handling', 'Prevent app crashes', 'Error recovery', 'Fallback UI'],
    'skeletonloader': ['Loading states', 'Content placeholders', 'Perceived performance', 'Progressive loading'],
    'chatwidget': ['Customer support', 'Team communication', 'Live chat', 'Messaging interface'],
    'comparisontable': ['Compare pricing plans', 'Feature comparison', 'Product comparison', 'Plan selection'],
    'mapwidget': ['Display store locations', 'Show delivery zones', 'Visualize geographic data', 'Location picker'],
    'pricingcard': ['Display subscription plans', 'Show pricing tiers', 'Feature comparison', 'Plan selection'],
    'usercard': ['Display user profiles', 'Team member cards', 'Contact information', 'User directory'],
    'avatar': ['User identification', 'Profile pictures', 'Team member display', 'Comment authors'],
    'badge': ['Status indicators', 'Notification counts', 'Labels and tags', 'Category badges'],
    'modal': ['Confirmation dialogs', 'Form overlays', 'Detail views', 'Action confirmations'],
    'tooltip': ['Help text', 'Additional information', 'Icon explanations', 'Contextual hints'],
    'apiwidget': ['Fetch and display API data', 'Real-time data updates', 'External data integration', 'Dynamic content'],
    'bulkactions': ['Delete multiple items', 'Bulk edit', 'Mass operations', 'Batch processing'],
    'exportbutton': ['Export reports', 'Download data', 'Generate PDFs', 'Create backups'],
    'permissionwrapper': ['Role-based UI', 'Feature access control', 'Permission-based visibility', 'Secure components'],
    'themepreview': ['Theme customization', 'Color scheme testing', 'Design system preview', 'Brand customization'],
  };
  
  if (specificUseCases[name]) {
    return specificUseCases[name];
  }
  
  // Fallback to category-based use cases
  const useCaseMap: Record<string, string[]> = {
    core: ['Dashboard overview', 'Analytics display', 'Key metrics monitoring'],
    'data-display': ['Data visualization', 'Report generation', 'Metric tracking'],
    forms: ['User input', 'Data collection', 'Form submission'],
    interactive: ['User interaction', 'Dynamic filtering', 'Real-time updates'],
    layout: ['Page structure', 'Content organization', 'UI scaffolding'],
    advanced: ['Complex workflows', 'Advanced features', 'Power user tools'],
    specialized: ['Domain-specific tasks', 'Custom functionality', 'Specialized views'],
    utility: ['Helper functions', 'Common UI patterns', 'Reusable components'],
    integration: ['API integration', 'External services', 'Data synchronization'],
  };
  
  return useCaseMap[category] || ['General purpose widget'];
}

/**
 * Generate searchable tags
 */
function generateTags(componentName: string, category: string): string[] {
  const tags: string[] = [category];
  
  // Add tags based on component name
  const name = componentName.toLowerCase();
  
  if (name.includes('chart')) tags.push('chart', 'visualization', 'analytics');
  if (name.includes('table')) tags.push('table', 'data', 'list');
  if (name.includes('card')) tags.push('card', 'display', 'summary');
  if (name.includes('form')) tags.push('form', 'input', 'validation');
  if (name.includes('stats')) tags.push('stats', 'metrics', 'kpi');
  if (name.includes('filter')) tags.push('filter', 'search', 'query');
  if (name.includes('button')) tags.push('button', 'action', 'interactive');
  if (name.includes('modal')) tags.push('modal', 'dialog', 'popup');
  if (name.includes('list')) tags.push('list', 'collection', 'items');
  if (name.includes('grid')) tags.push('grid', 'layout', 'responsive');
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Process a single widget file
 */
function processWidgetFile(filePath: string, category: string): WidgetMetadata | null {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    
    // Parse TypeScript
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );
    
    // Extract component name from filename
    const fileName = path.basename(filePath, '.tsx');
    const componentName = fileName;
    
    // Skip if it's a helper or utility file
    if (componentName.includes('Helper') || componentName.includes('Util')) {
      return null;
    }
    
    // Extract metadata
    const jsDocMetadata = extractJSDocMetadata(sourceFile);
    const configSchema = extractConfigSchema(sourceFile, componentName);
    const permissions = detectPermissions(sourceCode);
    
    // Generate widget metadata
    const widgetKey = generateWidgetKey(componentName);
    const description = generateDescription(componentName, jsDocMetadata.description, category);
    const useCases = generateUseCases(componentName, category, jsDocMetadata.useCases);
    const tags = generateTags(componentName, category);
    
    // Merge JSDoc tags with generated tags
    if (jsDocMetadata.tags.length > 0) {
      tags.push(...jsDocMetadata.tags);
    }
    
    const metadata: WidgetMetadata = {
      key: widgetKey,
      name: componentName,
      description,
      component: fileName,
      category,
      icon: DEFAULT_ICONS[category] || 'Box',
      defaultGridSpan: category === 'layout' ? 12 : 6,
      minGridSpan: 3,
      maxGridSpan: 12,
      configSchema,
      dataRequirements: {
        permissions: permissions.length > 0 ? permissions : undefined,
        endpoints: [],
        dependencies: [],
      },
      useCases,
      examples: jsDocMetadata.examples,
      tags: [...new Set(tags)],
      isSystemWidget: category === 'core' || category === 'layout',
    };
    
    return metadata;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

/**
 * Main discovery function
 */
export function discoverWidgets(): WidgetMetadata[] {
  console.log('🔍 Scanning widgets directory...');
  
  const widgetFiles = scanWidgetFiles(WIDGETS_DIR);
  console.log(`📁 Found ${widgetFiles.length} widget files`);
  
  const widgets: WidgetMetadata[] = [];
  
  for (const { filePath, category } of widgetFiles) {
    const relativePath = path.relative(WIDGETS_DIR, filePath);
    console.log(`  Processing: ${relativePath}`);
    
    const metadata = processWidgetFile(filePath, category);
    if (metadata) {
      widgets.push(metadata);
      console.log(`    ✅ ${metadata.key} (${metadata.category})`);
    }
  }
  
  console.log(`\n✨ Discovered ${widgets.length} widgets`);
  
  return widgets;
}

/**
 * Generate seed file content
 */
function generateSeedFile(widgets: WidgetMetadata[]): string {
  const content = `/**
 * Widget Definitions Seed Data
 * 
 * Auto-generated by discover-widgets.ts
 * DO NOT EDIT MANUALLY - Run 'npm run discover:widgets' to regenerate
 * 
 * Generated: ${new Date().toISOString()}
 */

export const widgetDefinitions = ${JSON.stringify(widgets, null, 2)};
`;
  
  return content;
}

/**
 * Save widgets to seed file
 */
export function saveWidgetSeedData(widgets: WidgetMetadata[]): void {
  const content = generateSeedFile(widgets);
  
  // Ensure directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`\n💾 Saved widget definitions to: ${OUTPUT_FILE}`);
}

// ============================================================================
// CLI Execution
// ============================================================================

if (require.main === module) {
  console.log('🚀 Widget Auto-Discovery Script\n');
  
  try {
    const widgets = discoverWidgets();
    saveWidgetSeedData(widgets);
    
    console.log('\n📊 Summary:');
    console.log(`  Total widgets: ${widgets.length}`);
    
    // Group by category
    const byCategory = widgets.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n  By category:');
    Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`    ${category}: ${count}`);
      });
    
    console.log('\n✅ Widget discovery complete!');
    console.log('\nNext steps:');
    console.log('  1. Review generated file: backend/prisma/seed-data/widgets.seed.ts');
    console.log('  2. Run: npm run prisma:seed');
    console.log('  3. Verify in Prisma Studio');
    
  } catch (error) {
    console.error('\n❌ Error during widget discovery:', error);
    process.exit(1);
  }
}
