'use client';

/**
 * Modal Component
 * 
 * A flexible modal dialog component with size variants, permission checks,
 * and theme integration. Built on shadcn/ui Dialog component.
 * 
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit User"
 *   size="md"
 *   permission="users:write"
 * >
 *   <UserForm />
 * </Modal>
 * ```
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ModalProps } from '../types/widget.types';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * Modal component with size variants and permission checks
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  permission,
  className,
}: ModalProps) {
  // Size classes for dialog content
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  const content = (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          'bg-card text-card-foreground',
          size === 'full' && 'overflow-y-auto',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogClose
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );

  // Wrap in permission guard if permission is specified
  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {content}
      </PermissionGuard>
    );
  }

  return content;
}

Modal.displayName = 'Modal';

