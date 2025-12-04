'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { TreeNode, BaseWidgetProps } from '../types/widget.types';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';

interface TreeViewProps extends BaseWidgetProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode) => void;
  onNodeCollapse?: (node: TreeNode) => void;
  onLoadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  defaultExpandedIds?: string[];
  selectedId?: string;
  title?: string;
  maxHeight?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  expandedIds: Set<string>;
  selectedId?: string;
  onToggle: (nodeId: string) => void;
  onNodeClick?: (node: TreeNode) => void;
  onLoadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  loadingIds: Set<string>;
  setLoadingIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  childrenCache: Map<string, TreeNode[]>;
  setChildrenCache: React.Dispatch<React.SetStateAction<Map<string, TreeNode[]>>>;
}

function TreeNodeItem({
  node,
  level,
  expandedIds,
  selectedId,
  onToggle,
  onNodeClick,
  onLoadChildren,
  loadingIds,
  setLoadingIds,
  childrenCache,
  setChildrenCache,
}: TreeNodeItemProps) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isLoading = loadingIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const canExpand = hasChildren || onLoadChildren;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!canExpand) return;

    if (!isExpanded && onLoadChildren && !childrenCache.has(node.id)) {
      // Lazy load children
      setLoadingIds((prev) => new Set(prev).add(node.id));
      try {
        const children = await onLoadChildren(node);
        setChildrenCache((prev) => new Map(prev).set(node.id, children));
      } catch (error) {
        console.error('Failed to load children:', error);
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      }
    }

    onToggle(node.id);
  };

  const handleClick = () => {
    onNodeClick?.(node);
  };

  const Icon = node.icon || (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);
  const children = childrenCache.get(node.id) || node.children || [];

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-accent transition-colors ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {canExpand ? (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center hover:bg-accent-foreground/10 rounded"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{node.label}</span>
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <span className="text-xs text-muted-foreground">
            {String(Object.values(node.metadata)[0])}
          </span>
        )}
      </div>
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
              onLoadChildren={onLoadChildren}
              loadingIds={loadingIds}
              setLoadingIds={setLoadingIds}
              childrenCache={childrenCache}
              setChildrenCache={setChildrenCache}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({
  data,
  onNodeClick,
  onNodeExpand,
  onNodeCollapse,
  onLoadChildren,
  defaultExpandedIds = [],
  selectedId,
  title = 'Tree View',
  maxHeight = '400px',
  permission,
  className = '',
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpandedIds)
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [childrenCache, setChildrenCache] = useState<Map<string, TreeNode[]>>(
    new Map()
  );

  const findNodeById = (nodes: TreeNode[], id: string, cache: Map<string, TreeNode[]>): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id, cache);
        if (found) return found;
      }
      const cached = cache.get(node.id);
      if (cached) {
        const found = findNodeById(cached, id, cache);
        if (found) return found;
      }
    }
    return null;
  };

  const handleToggle = useCallback(
    (nodeId: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        const wasExpanded = next.has(nodeId);
        
        if (wasExpanded) {
          next.delete(nodeId);
          const node = findNodeById(data, nodeId, childrenCache);
          if (node) {
            onNodeCollapse?.(node);
          }
        } else {
          next.add(nodeId);
          const node = findNodeById(data, nodeId, childrenCache);
          if (node) {
            onNodeExpand?.(node);
          }
        }
        
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, onNodeExpand, onNodeCollapse, childrenCache]
  );

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(data);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const content = (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }}>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items to display
            </div>
          ) : (
            <div className="space-y-0.5">
              {data.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  level={0}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  onToggle={handleToggle}
                  onNodeClick={onNodeClick}
                  onLoadChildren={onLoadChildren}
                  loadingIds={loadingIds}
                  setLoadingIds={setLoadingIds}
                  childrenCache={childrenCache}
                  setChildrenCache={setChildrenCache}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {content}
      </PermissionGuard>
    );
  }

  return content;
}
