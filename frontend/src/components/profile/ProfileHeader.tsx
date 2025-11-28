/**
 * Profile Header Component
 * 
 * Simple avatar display with upload functionality
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { ProfileResponse } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Loader2, Shield, Mail, CheckCircle2, XCircle, Key } from 'lucide-react';
import { useAvatarUpload, useAvatarDelete } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileHeaderProps {
  profile: ProfileResponse;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useAvatarUpload();
  const deleteMutation = useAvatarDelete();

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Get user initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('File must be JPEG, PNG, WebP, or GIF');
      return;
    }

    uploadMutation.mutate({ file });
  }, [uploadMutation]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to upload
  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle delete avatar
  const handleDelete = useCallback(() => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  }, [deleteMutation]);

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Avatar with Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={profile.avatarUrl || undefined} 
                alt={profile.name || profile.email}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.name || profile.email)}
              </AvatarFallback>
            </Avatar>
            
            {/* Loading Overlay */}
            {(isUploading || isDeleting) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Upload/Delete Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClickUpload}
              disabled={isUploading || isDeleting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {profile.avatarUrl ? 'Change' : 'Upload'}
            </Button>

            {profile.avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isUploading || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            JPEG, PNG, WebP, or GIF. Max 5MB.
          </p>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {/* Account Info */}
        <div className="space-y-3 pt-4 border-t">
          {/* Role */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role</span>
            </div>
            <Badge variant="secondary">{profile.role.name}</Badge>
          </div>

          {/* Email Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email</span>
            </div>
            <div className="flex items-center gap-1">
              {profile.emailVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-600">Not Verified</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Joined</span>
            <span>{format(new Date(profile.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated</span>
            <span>{format(new Date(profile.updatedAt), 'MMM d, yyyy')}</span>
          </div>
          {profile.lastPasswordChange && (
            <div className="flex justify-between">
              <span>Password Changed</span>
              <span>{format(new Date(profile.lastPasswordChange), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Change Password Button */}
        <div className="pt-4 border-t">
          <Link href="/dashboard/settings/security" className="w-full block">
            <Button variant="outline" className="w-full" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </Link>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
