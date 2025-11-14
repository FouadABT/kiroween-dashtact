/**
 * Profile Management Hooks
 * 
 * React Query hooks for profile data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileApi } from '@/lib/api';
import { ProfileResponse, UpdateProfileData, ChangePasswordData, AvatarUploadResponse } from '@/types/profile';
import { UploadProgress } from '@/types/upload';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Query key for profile data
 */
export const PROFILE_QUERY_KEY = ['profile'];

/**
 * Hook to fetch user profile
 */
export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => ProfileApi.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook to update user profile with optimistic updates
 */
export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => ProfileApi.updateProfile(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<ProfileResponse>(PROFILE_QUERY_KEY);

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<ProfileResponse>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          ...newData,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (error, _newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile);
      }

      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    },
    onSuccess: () => {
      toast.success('Your profile has been updated successfully');
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/**
 * Hook to upload profile avatar
 */
export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: UploadProgress) => void;
    }) => {
      console.log('[useAvatarUpload] Starting avatar upload:', file.name);
      return ProfileApi.uploadAvatar(file, onProgress);
    },
    onMutate: async () => {
      console.log('[useAvatarUpload] Mutation started');
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<ProfileResponse>(PROFILE_QUERY_KEY);
      console.log('[useAvatarUpload] Previous avatar:', previousProfile?.avatarUrl);

      return { previousProfile };
    },
    onError: (error, _variables, context) => {
      console.error('[useAvatarUpload] Upload failed:', error);
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile);
      }

      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    },
    onSuccess: async (data: AvatarUploadResponse) => {
      console.log('[useAvatarUpload] Upload successful, new avatar URL:', data.url);
      
      // Update profile with new avatar URL
      const previousProfile = queryClient.getQueryData<ProfileResponse>(PROFILE_QUERY_KEY);
      if (previousProfile) {
        console.log('[useAvatarUpload] Updating React Query cache with new avatar');
        queryClient.setQueryData<ProfileResponse>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          avatarUrl: data.url,
          updatedAt: new Date().toISOString(),
        });
      }

      // Refresh user data in AuthContext to update header avatar
      console.log('[useAvatarUpload] Calling refreshUser() to update AuthContext');
      await refreshUser();
      console.log('[useAvatarUpload] refreshUser() completed');

      toast.success('Your profile picture has been updated successfully');
    },
    onSettled: () => {
      console.log('[useAvatarUpload] Mutation settled, invalidating queries');
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete profile avatar
 */
export function useAvatarDelete() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: () => ProfileApi.deleteAvatar(),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<ProfileResponse>(PROFILE_QUERY_KEY);

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<ProfileResponse>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          avatarUrl: null,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile);
      }

      toast.error(error instanceof Error ? error.message : 'Failed to delete avatar');
    },
    onSuccess: async () => {
      // Refresh user data in AuthContext to update header avatar
      await refreshUser();
      
      toast.success('Your profile picture has been removed');
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/**
 * Hook to change password
 */
export function usePasswordChange() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => ProfileApi.changePassword(data),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    },
    onSuccess: async () => {
      toast.success('Your password has been changed successfully. Please log in again.');

      // Wait a moment for the toast to be visible
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Logout user (backend invalidates all tokens)
      await logout();
    },
  });
}
