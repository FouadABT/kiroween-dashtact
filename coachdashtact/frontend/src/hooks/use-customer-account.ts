'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerAccountApi } from '@/lib/api';
import type { Customer, Wishlist, OrderListResponse } from '@/types/ecommerce';
import type { AccountSettings } from '@/types/account-settings';

/**
 * Query keys for customer account data
 */
export const customerAccountKeys = {
  all: ['customer-account'] as const,
  profile: () => [...customerAccountKeys.all, 'profile'] as const,
  addresses: () => [...customerAccountKeys.all, 'addresses'] as const,
  paymentMethods: () => [...customerAccountKeys.all, 'payment-methods'] as const,
  settings: () => [...customerAccountKeys.all, 'settings'] as const,
  wishlist: () => [...customerAccountKeys.all, 'wishlist'] as const,
  orders: (page?: number, limit?: number) => [...customerAccountKeys.all, 'orders', page, limit] as const,
};

/**
 * Hook to fetch customer profile
 */
export function useCustomerProfile() {
  return useQuery({
    queryKey: customerAccountKeys.profile(),
    queryFn: () => CustomerAccountApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch customer addresses
 */
export function useCustomerAddresses() {
  return useQuery({
    queryKey: customerAccountKeys.addresses(),
    queryFn: () => CustomerAccountApi.getAddresses(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch customer payment methods
 */
export function useCustomerPaymentMethods() {
  return useQuery({
    queryKey: customerAccountKeys.paymentMethods(),
    queryFn: () => CustomerAccountApi.getPaymentMethods(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch account settings
 */
export function useAccountSettings() {
  return useQuery({
    queryKey: customerAccountKeys.settings(),
    queryFn: () => CustomerAccountApi.getSettings(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch customer wishlist
 */
export function useCustomerWishlist() {
  return useQuery({
    queryKey: customerAccountKeys.wishlist(),
    queryFn: () => CustomerAccountApi.getWishlist(),
    staleTime: 2 * 60 * 1000, // 2 minutes (wishlist changes more frequently)
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch customer orders
 */
export function useCustomerOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: customerAccountKeys.orders(page, limit),
    queryFn: () => CustomerAccountApi.getOrders(page, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to update customer profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof CustomerAccountApi.updateProfile>[0]) =>
      CustomerAccountApi.updateProfile(data),
    onSuccess: (data) => {
      // Update the profile query cache
      queryClient.setQueryData(customerAccountKeys.profile(), data);
      // Invalidate to refetch on next access
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.profile() });
    },
  });
}

/**
 * Hook to create address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof CustomerAccountApi.createAddress>[0]) =>
      CustomerAccountApi.createAddress(data),
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
  });
}

/**
 * Hook to update address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: {
      addressId: string;
      data: Parameters<typeof CustomerAccountApi.updateAddress>[1];
    }) => CustomerAccountApi.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
  });
}

/**
 * Hook to delete address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => CustomerAccountApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
  });
}

/**
 * Hook to set default address
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => CustomerAccountApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
  });
}

/**
 * Hook to create payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof CustomerAccountApi.createPaymentMethod>[0]) =>
      CustomerAccountApi.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.paymentMethods() });
    },
  });
}

/**
 * Hook to update payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ methodId, data }: {
      methodId: string;
      data: Parameters<typeof CustomerAccountApi.updatePaymentMethod>[1];
    }) => CustomerAccountApi.updatePaymentMethod(methodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.paymentMethods() });
    },
  });
}

/**
 * Hook to delete payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (methodId: string) => CustomerAccountApi.deletePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.paymentMethods() });
    },
  });
}

/**
 * Hook to set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (methodId: string) => CustomerAccountApi.setDefaultPaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.paymentMethods() });
    },
  });
}

/**
 * Hook to update account settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof CustomerAccountApi.updateSettings>[0]) =>
      CustomerAccountApi.updateSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(customerAccountKeys.settings(), data);
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.settings() });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: {
      oldPassword: string;
      newPassword: string;
    }) => CustomerAccountApi.changePassword(oldPassword, newPassword),
  });
}

/**
 * Hook to enable 2FA
 */
export function useEnable2FA() {
  return useMutation({
    mutationFn: () => CustomerAccountApi.enable2FA(),
  });
}

/**
 * Hook to verify 2FA
 */
export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => CustomerAccountApi.verify2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.settings() });
    },
  });
}

/**
 * Hook to disable 2FA
 */
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => CustomerAccountApi.disable2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerAccountKeys.settings() });
    },
  });
}

/**
 * Hook to add item to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productVariantId }: {
      productId: string;
      productVariantId?: string;
    }) => CustomerAccountApi.addToWishlist(productId, productVariantId),
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(customerAccountKeys.wishlist(), data);
    },
  });
}

/**
 * Hook to remove item from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => CustomerAccountApi.removeFromWishlist(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(customerAccountKeys.wishlist(), data);
    },
  });
}

/**
 * Hook to delete account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => CustomerAccountApi.deleteAccount(password),
  });
}
