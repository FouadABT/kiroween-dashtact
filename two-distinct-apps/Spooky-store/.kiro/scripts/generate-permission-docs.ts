#!/usr/bin/env ts-node

/**
 * Permission Documentation Generator
 * 
 * Scans backend controllers for @Permissions() decorators and generates
 * comprehensive markdown documentation of all protected endpoints.
 * 
 * Usage:
 *   npm run generate:permission-docs
 *   or
 *   ts-node .kiro/scripts/generate-permission-docs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface EndpointInfo {
  method: string;
  path: string;
  permission: string;
  description: string;
  controller: string;
  handler: string;
}

interface ControllerInfo {
  name: string;
  basePath: string;
  endpoints: EndpointInfo[];
}

/**
 * Extract controller base path from @Controller decorator
 */
function extractControllerPath(content: string): string {
  const match = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
  return match ? match[1] : '';
}

/**
 * Extract HTTP method from decorator
 */
function extractHttpMethod(line: string): string | null {
  const methods = ['Get', 'Post', 'Patch', 'Put', 'Delete'];
  for (const method of methods) {
    if (line.includes(`@${method}(`)) {
      const match = line.match(/@\w+\(['"]([^'"]+)['"]\)/);
      return `${method.toUpperCase()} ${match ? match[1] : ''}`;
    }
    if (line.includes(`@${method}`)) {
      return method.toUpperCase();
    }
  }
  return null;
}

/**
 * Extract permission from @Permissions decorator
 */
function extractPermission(content: string, startIndex: number): string | null {
  const lines = content.substring(startIndex).split('\n');
  
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (line.includes('@Permissions(')) {
      const match = line.match(/@Permissions\(['"]([^'"]+)['"]\)/);
      return match ? match[1] : null;
    }
  }
  
  return null;
}

/**
 * Extract description from JSDoc comment
 */
function extractDescription(content: string, startIndex: number): string {
  const beforeContent = content.substring(0, startIndex);
  const lines = beforeContent.split('\n').reverse();
  
  const descriptionLines: string[] = [];
  let inComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('*/')) {
      inComment = true;
      continue;
    }
    
    if (trimmed.startsWith('/**')) {
      break;
    }
    
    if (inComment && trimmed.startsWith('*')) {
      const text = trimmed.substring(1).trim();
      if (text && !text.startsWith('@')) {
        descriptionLines.unshift(text);
      }
    }
  }
  
  return descriptionLines.join(' ') || 'No description';
}

/**
 * Parse a controller file and extract endpoint information
 */
function parseControllerFile(filePath: string): ControllerInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const controllerName = fileName.replace('.controller.ts', '');
    
    const basePath = extractControllerPath(content);
    if (!basePath) {
      return null;
    }
    
    const endpoints: EndpointInfo[] = [];
    
    // Find all method decorators
    const methodRegex = /@(Get|Post|Patch|Put|Delete)/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      const startIndex = match.index;
      const method = extractHttpMethod(content.substring(startIndex));
      
      if (!method) continue;
      
      // Extract permission
      const permission = extractPermission(content, startIndex);
      
      // Only include endpoints with permissions
      if (!permission) continue;
      
      // Extract description
      const description = extractDescription(content, startIndex);
      
      // Extract handler name
      const handlerMatch = content.substring(startIndex).match(/async\s+(\w+)\s*\(/);
      const handler = handlerMatch ? handlerMatch[1] : 'unknown';
      
      // Build full path
      const [httpMethod, routePath] = method.split(' ');
      const fullPath = routePath 
        ? `/${basePath}/${routePath}`.replace(/\/+/g, '/')
        : `/${basePath}`;
      
      endpoints.push({
        method: httpMethod,
        path: fullPath,
        permission,
        description,
        controller: controllerName,
        handler,
      });
    }
    
    if (endpoints.length === 0) {
      return null;
    }
    
    return {
      name: controllerName,
      basePath: `/${basePath}`,
      endpoints,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Recursively find all controller files
 */
function findControllerFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        files.push(...findControllerFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.controller.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Load default roles and their permissions from seed data
 */
function loadRolePermissions(): Map<string, string[]> {
  const rolePermissions = new Map<string, string[]>();
  
  try {
    const seedPath = path.join(process.cwd(), 'backend/prisma/seed-data/auth.seed.ts');
    const content = fs.readFileSync(seedPath, 'utf-8');
    
    // Extract DEFAULT_ROLES object
    const rolesMatch = content.match(/export const DEFAULT_ROLES = \{([\s\S]*?)\};/);
    if (!rolesMatch) return rolePermissions;
    
    const rolesContent = rolesMatch[1];
    
    // Parse each role
    const roleMatches = rolesContent.matchAll(/(\w+):\s*\{[\s\S]*?permissions:\s*\[([\s\S]*?)\]/g);
    
    for (const match of roleMatches) {
      const roleName = match[1];
      const permsContent = match[2];
      
      // Extract permission strings
      const permissions = permsContent
        .match(/['"]([^'"]+)['"]/g)
        ?.map(p => p.replace(/['"]/g, '')) || [];
      
      rolePermissions.set(roleName, permissions);
    }
  } catch (error) {
    console.warn('Could not load role permissions from seed data:', error);
  }
  
  return rolePermissions;
}

/**
 * Check which roles have access to a permission
 */
function getRolesForPermission(permission: string, rolePermissions: Map<string, string[]>): string[] {
  const roles: string[] = [];
  
  for (const [roleName, permissions] of rolePermissions.entries()) {
    // Check for exact match
    if (permissions.includes(permission)) {
      roles.push(roleName);
      continue;
    }
    
    // Check for wildcard permissions
    if (permissions.includes('*:*')) {
      roles.push(roleName);
      continue;
    }
    
    // Check for resource wildcard (e.g., users:*)
    const [resource] = permission.split(':');
    if (permissions.includes(`${resource}:*`)) {
      roles.push(roleName);
    }
  }
  
  return roles;
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(controllers: ControllerInfo[], rolePermissions: Map<string, string[]>): string {
  const lines: string[] = [];
  
  lines.push('# API Permissions Documentation');
  lines.push('');
  lines.push('> Auto-generated documentation of all protected API endpoints');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Table of contents
  lines.push('## Table of Contents');
  lines.push('');
  for (const controller of controllers) {
    const title = controller.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    lines.push(`- [${title}](#${controller.name.toLowerCase()})`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Permission summary
  lines.push('## Permission Summary');
  lines.push('');
  const allPermissions = new Set<string>();
  for (const controller of controllers) {
    for (const endpoint of controller.endpoints) {
      allPermissions.add(endpoint.permission);
    }
  }
  
  lines.push('| Permission | Description | Roles with Access |');
  lines.push('|------------|-------------|-------------------|');
  
  for (const permission of Array.from(allPermissions).sort()) {
    const [resource, action] = permission.split(':');
    const description = `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
    const roles = getRolesForPermission(permission, rolePermissions);
    const rolesStr = roles.length > 0 ? roles.join(', ') : 'None';
    
    lines.push(`| \`${permission}\` | ${description} | ${rolesStr} |`);
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Detailed endpoint documentation
  for (const controller of controllers) {
    const title = controller.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    lines.push(`## ${title}`);
    lines.push('');
    lines.push(`**Base Path:** \`${controller.basePath}\``);
    lines.push('');
    
    // Group endpoints by permission
    const byPermission = new Map<string, EndpointInfo[]>();
    for (const endpoint of controller.endpoints) {
      if (!byPermission.has(endpoint.permission)) {
        byPermission.set(endpoint.permission, []);
      }
      byPermission.get(endpoint.permission)!.push(endpoint);
    }
    
    for (const [permission, endpoints] of byPermission) {
      const roles = getRolesForPermission(permission, rolePermissions);
      
      for (const endpoint of endpoints) {
        lines.push(`### ${endpoint.method} ${endpoint.path}`);
        lines.push('');
        lines.push(`**Description:** ${endpoint.description}`);
        lines.push('');
        lines.push(`**Permission Required:** \`${endpoint.permission}\``);
        lines.push('');
        lines.push(`**Role Access:** ${roles.length > 0 ? roles.join(', ') : 'None'}`);
        lines.push('');
        lines.push(`**Handler:** \`${endpoint.handler}()\``);
        lines.push('');
        lines.push('---');
        lines.push('');
      }
    }
  }
  
  // Footer
  lines.push('## Notes');
  lines.push('');
  lines.push('- All endpoints require authentication via JWT token in the `Authorization` header');
  lines.push('- Endpoints return `401 Unauthorized` if the token is missing or invalid');
  lines.push('- Endpoints return `403 Forbidden` if the user lacks the required permission');
  lines.push('- Super Admin role (`*:*` permission) has access to all endpoints');
  lines.push('- Wildcard permissions (e.g., `users:*`) grant access to all actions on that resource');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This documentation is auto-generated. Do not edit manually.*');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning backend controllers for permissions...\n');
  
  const backendSrc = path.join(process.cwd(), 'backend/src');
  const controllerFiles = findControllerFiles(backendSrc);
  
  console.log(`Found ${controllerFiles.length} controller files\n`);
  
  const controllers: ControllerInfo[] = [];
  
  for (const file of controllerFiles) {
    const info = parseControllerFile(file);
    if (info) {
      console.log(`✓ ${info.name}: ${info.endpoints.length} protected endpoints`);
      controllers.push(info);
    }
  }
  
  console.log('');
  
  if (controllers.length === 0) {
    console.log('⚠️  No protected endpoints found');
    return;
  }
  
  // Load role permissions
  console.log('📋 Loading role permissions from seed data...\n');
  const rolePermissions = loadRolePermissions();
  console.log(`Found ${rolePermissions.size} roles\n`);
  
  // Generate documentation
  console.log('📝 Generating documentation...\n');
  const markdown = generateMarkdown(controllers, rolePermissions);
  
  // Write to file
  const outputPath = path.join(process.cwd(), 'API_PERMISSIONS.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  
  console.log(`✅ Documentation generated: ${outputPath}\n`);
  
  // Summary
  const totalEndpoints = controllers.reduce((sum, c) => sum + c.endpoints.length, 0);
  const uniquePermissions = new Set(
    controllers.flatMap(c => c.endpoints.map(e => e.permission))
  ).size;
  
  console.log('Summary:');
  console.log(`  Controllers: ${controllers.length}`);
  console.log(`  Endpoints: ${totalEndpoints}`);
  console.log(`  Unique Permissions: ${uniquePermissions}`);
  console.log(`  Roles: ${rolePermissions.size}`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main, parseControllerFile, findControllerFiles };
