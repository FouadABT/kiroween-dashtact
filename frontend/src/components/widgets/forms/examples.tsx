'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DateRange } from 'react-day-picker';
import { FormCard, DateRangePicker, MultiSelect, FileUpload, UploadedFile } from './index';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * Form Widgets Examples
 * 
 * Demonstrates usage of all form widgets
 */

// Example 1: FormCard with basic form
const basicFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
});

type BasicFormData = z.infer<typeof basicFormSchema>;

export function FormCardExample() {
  const form = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  const onSubmit = async (data: BasicFormData) => {
    console.log('Form submitted:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Form submitted successfully!');
  };

  return (
    <FormCard
      title="User Profile"
      description="Update your profile information"
      form={form}
      onSubmit={onSubmit}
      submitText="Save Changes"
      showCancel
      onCancel={() => alert('Cancelled')}
      isSubmitting={form.formState.isSubmitting}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormDescription>Your full name</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="john@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Input placeholder="Tell us about yourself..." {...field} />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormCard>
  );
}

// Example 2: DateRangePicker standalone
export function DateRangePickerExample() {
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Date Range Picker</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a date range with preset options
        </p>
      </div>

      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        showPresets
        placeholder="Select date range"
      />

      {dateRange?.from && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Selected:</strong>{' '}
            {dateRange.from.toLocaleDateString()}
            {dateRange.to && ` - ${dateRange.to.toLocaleDateString()}`}
          </p>
        </div>
      )}
    </div>
  );
}

// Example 3: MultiSelect standalone
export function MultiSelectExample() {
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'Next.js', value: 'nextjs' },
    { label: 'Nuxt.js', value: 'nuxtjs' },
    { label: 'Remix', value: 'remix' },
    { label: 'Astro', value: 'astro' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Multi Select</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select multiple frameworks (max 3)
        </p>
      </div>

      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder="Select frameworks..."
        showCount
        showSelectAll
        maxSelections={3}
      />

      {selected.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Selected ({selected.length}):</strong>{' '}
            {selected.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Example 4: FileUpload standalone
export function FileUploadExample() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleUpload = async (uploadFiles: File[]): Promise<string[]> => {
    // Simulate upload to backend
    console.log('Uploading files:', uploadFiles);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Return mock URLs
    return uploadFiles.map((file) => `/uploads/${file.name}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">File Upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload images or documents with drag & drop
        </p>
      </div>

      <FileUpload
        accept={['image/*', '.pdf', '.doc', '.docx']}
        maxSize={5 * 1024 * 1024} // 5MB
        multiple
        maxFiles={5}
        onUpload={handleUpload}
        onChange={setFiles}
        showFileList
      />

      {files.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Uploaded Files:</p>
          <ul className="text-sm space-y-1">
            {files.map((file, index) => (
              <li key={index}>
                {file.file.name} - {file.url}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Example 5: Complete form with all widgets
const completeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date().optional(),
  }).optional(),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  files: z.array(z.string()).optional(),
});

type CompleteFormData = z.infer<typeof completeFormSchema>;

export function CompleteFormExample() {
  const form = useForm<CompleteFormData>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categories: [],
      files: [],
    },
  });

  const categoryOptions = [
    { label: 'Technology', value: 'tech' },
    { label: 'Design', value: 'design' },
    { label: 'Business', value: 'business' },
    { label: 'Marketing', value: 'marketing' },
  ];

  const handleUpload = async (uploadFiles: File[]): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return uploadFiles.map((file) => `/uploads/${file.name}`);
  };

  const onSubmit = async (data: CompleteFormData) => {
    console.log('Complete form submitted:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Form submitted successfully!');
  };

  return (
    <FormCard
      title="Create Project"
      description="Fill in the details to create a new project"
      form={form}
      onSubmit={onSubmit}
      submitText="Create Project"
      showCancel
      onCancel={() => alert('Cancelled')}
      isSubmitting={form.formState.isSubmitting}
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Title</FormLabel>
            <FormControl>
              <Input placeholder="My Awesome Project" {...field} />
            </FormControl>
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
              <Input placeholder="Describe your project..." {...field} />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dateRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Duration</FormLabel>
            <FormControl>
              <DateRangePicker
                value={field.value}
                onChange={field.onChange}
                showPresets
                placeholder="Select project duration"
              />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categories</FormLabel>
            <FormControl>
              <MultiSelect
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select categories..."
                showSelectAll
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="files"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Attachments</FormLabel>
            <FormControl>
              <FileUpload
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                multiple
                maxFiles={3}
                onUpload={handleUpload}
                onChange={(files: UploadedFile[]) => {
                  field.onChange(files.map((f) => f.url).filter(Boolean));
                }}
              />
            </FormControl>
            <FormDescription>Optional - Max 3 files, 5MB each</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormCard>
  );
}

// Export all examples
export const formWidgetExamples = {
  FormCardExample,
  DateRangePickerExample,
  MultiSelectExample,
  FileUploadExample,
  CompleteFormExample,
};
