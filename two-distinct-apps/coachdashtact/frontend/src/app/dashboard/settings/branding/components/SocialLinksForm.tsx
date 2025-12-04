'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import type { UpdateBrandSettingsDto } from '@/types/branding';

const socialLinksSchema = z.object({
  twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;

interface SocialLinksFormProps {
  initialData?: UpdateBrandSettingsDto['socialLinks'];
  onChange: (data: UpdateBrandSettingsDto['socialLinks']) => void;
}

export function SocialLinksForm({ initialData, onChange }: SocialLinksFormProps) {
  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      twitter: initialData?.twitter || '',
      linkedin: initialData?.linkedin || '',
      facebook: initialData?.facebook || '',
      instagram: initialData?.instagram || '',
    },
  });

  const handleChange = () => {
    const values = form.getValues();
    onChange({
      twitter: values.twitter || undefined,
      linkedin: values.linkedin || undefined,
      facebook: values.facebook || undefined,
      instagram: values.instagram || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add links to your social media profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://twitter.com/yourhandle"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/company/yourcompany"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/yourpage"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/yourhandle"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleChange();
                      }}
                    />
                  </FormControl>
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
