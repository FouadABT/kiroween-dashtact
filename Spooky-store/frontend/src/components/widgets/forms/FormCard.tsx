'use client';

import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { BaseWidgetProps } from '../types/widget.types';

/**
 * FormCard Props
 */
export interface FormCardProps<TFieldValues extends FieldValues = FieldValues> extends BaseWidgetProps {
  /** Form title */
  title: string;
  /** Optional form description */
  description?: string;
  /** react-hook-form methods */
  form: UseFormReturn<TFieldValues>;
  /** Form submit handler */
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  /** Form children (form fields) */
  children: React.ReactNode;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Cancel button handler */
  onCancel?: () => void;
  /** Show cancel button */
  showCancel?: boolean;
  /** Loading state during submission */
  isSubmitting?: boolean;
}

/**
 * FormCard Component
 * 
 * Wraps form content in a shadcn/ui Card with:
 * - Title and description
 * - Submit/cancel action buttons
 * - Loading state during submission
 * - Integration with react-hook-form
 * 
 * Requirements: 1.1, 13.1
 * 
 * @example
 * ```tsx
 * const form = useForm<FormData>({
 *   resolver: zodResolver(schema),
 * });
 * 
 * <FormCard
 *   title="User Profile"
 *   description="Update your profile information"
 *   form={form}
 *   onSubmit={handleSubmit}
 *   submitText="Save Changes"
 *   showCancel
 *   onCancel={() => router.back()}
 * >
 *   <FormField
 *     control={form.control}
 *     name="name"
 *     render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Name</FormLabel>
 *         <FormControl>
 *           <Input {...field} />
 *         </FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )}
 *   />
 * </FormCard>
 * ```
 */
export function FormCard<TFieldValues extends FieldValues = FieldValues>({
  title,
  description,
  form,
  onSubmit,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  showCancel = false,
  isSubmitting = false,
  loading = false,
  className,
}: FormCardProps<TFieldValues>) {
  const isLoading = loading || isSubmitting;

  return (
    <Card className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>

          <CardContent className="space-y-4">
            {children}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            {showCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
