'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { UpdateBrandSettingsDto } from '@/types/branding';

const brandInfoSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100, 'Brand name must be less than 100 characters'),
  tagline: z.string().max(200, 'Tagline must be less than 200 characters').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  supportEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

type BrandInfoFormValues = z.infer<typeof brandInfoSchema>;

interface BrandInfoFormProps {
  initialData?: UpdateBrandSettingsDto;
  onChange: (data: UpdateBrandSettingsDto) => void;
}

export function BrandInfoForm({ initialData, onChange }: BrandInfoFormProps) {
  const form = useForm<BrandInfoFormValues>({
    resolver: zodResolver(brandInfoSchema),
    defaultValues: {
      brandName: initialData?.brandName || '',
      tagline: initialData?.tagline || '',
      description: initialData?.description || '',
      websiteUrl: initialData?.websiteUrl || '',
      supportEmail: initialData?.supportEmail || '',
    },
  });

  const handleChange = () => {
    const values = form.getValues();
    onChange({
      brandName: values.brandName,
      tagline: values.tagline || undefined,
      description: values.description || undefined,
      websiteUrl: values.websiteUrl || undefined,
      supportEmail: values.supportEmail || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Information</CardTitle>
        <CardDescription>
          Configure your brand name, tagline, and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your brand name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Your organization or application name (1-100 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your tagline"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    A short, memorable phrase (max 200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description of your brand"
                      className="min-h-[100px]"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of your brand or organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Your organization's website URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supportEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="support@example.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Email address for customer support
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
