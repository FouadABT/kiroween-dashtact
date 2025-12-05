'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Edit,
  Trash2,
  Eye,
  Globe,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomPage } from '@/types/pages';
import { useRouter } from 'next/navigation';

interface PageHierarchyViewProps {
  pages: CustomPage[];
  onRefresh: () => void;
}

interface PageNode {
  page: CustomPage;
  children: PageNode[];
}

export function PageHierarchyView({ pages, onRefresh }: PageHierarchyViewProps) {
  const router = useRouter();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchy tree
  const buildTree = (pages: CustomPage[]): PageNode[] => {
    const pageMap = new Map<string, PageNode>();
    const rootNodes: PageNode[] = [];

    // Create nodes
    pages.forEach((page) => {
      pageMap.set(page.id, { page, children: [] });
    });

    // Build tree structure
    pages.forEach((page) => {
      const node = pageMap.get(page.id)!;
      if (page.parentPageId && pageMap.has(page.parentPageId)) {
        const parentNode = pageMap.get(page.parentPageId)!;
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Sort by display order
    const sortNodes = (nodes: PageNode[]) => {
      nodes.sort((a, b) => (a.page.displayOrder || 0) - (b.page.displayOrder || 0));
      nodes.forEach((node) => sortNodes(node.children));
    };
    sortNodes(rootNodes);

    return rootNodes;
  };

  const tree = buildTree(pages);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'ARCHIVED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'PUBLIC' ? (
      <Globe className="h-3 w-3" />
    ) : (
      <Lock className="h-3 w-3" />
    );
  };

  const renderNode = (node: PageNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.page.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.page.id}>
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors',
            depth > 0 && 'ml-6'
          )}
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleNode(node.page.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-6 w-6" />
          )}

          {/* Page Icon */}
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

          {/* Page Title */}
          <span className="font-medium flex-1 min-w-0 truncate">{node.page.title}</span>

          {/* Status Badge */}
          <Badge variant="outline" className={cn('text-xs', getStatusColor(node.page.status))}>
            {node.page.status}
          </Badge>

          {/* Visibility Icon */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getVisibilityIcon(node.page.visibility)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {node.page.status === 'PUBLISHED' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => window.open(`/${node.page.slug}`, '_blank')}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => router.push(`/dashboard/pages/${node.page.id}/edit`)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((childNode) => renderNode(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pages found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing page hierarchy with parent-child relationships
        </p>
        <Button variant="outline" size="sm" onClick={() => setExpandedNodes(new Set())}>
          Collapse All
        </Button>
      </div>
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
