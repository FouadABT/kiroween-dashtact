# Form Widgets

Collection of form-related widgets with react-hook-form integration, validation, and theme-aware styling.

## Components

### FormCard

Wraps form content in a Card with title, description, and action buttons.

**Features:**
- Integration with react-hook-form
- Submit/cancel buttons
- Loading state during submission
- Theme-aware styling

**Example:**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormCard } from '@/components/widgets/forms';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <FormCard
      title="User Profile"
      description="Update your profile information"
      form={form}
      onSubmit={onSubmit}
      submitText="Save Changes"
      showCancel
      onCancel={() => router.back()}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
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
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormCard>
  );
}
```

### DateRangePicker

Date range picker with preset ranges and calendar selection.

**Features:**
- react-day-picker integration
- Preset ranges (today, last 7 days, last 30 days, etc.)
- Custom presets support
- Date formatting with date-fns
- Min/max date constraints

**Example:**
```tsx
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/widgets/forms';

function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      showPresets
      placeholder="Select date range"
    />
  );
}
```

**Custom Presets:**
```tsx
const customPresets = [
  {
    label: 'Last 90 days',
    range: {
      from: subDays(new Date(), 89),
      to: new Date(),
    },
  },
  {
    label: 'This quarter',
    range: {
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    },
  },
];

<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  presets={customPresets}
  showPresets
/>
```

### MultiSelect

Searchable multi-select dropdown with checkboxes.

**Features:**
- Searchable options
- Select all / Clear all
- Selected count badge
- Maximum selections limit
- Disabled options support

**Example:**
```tsx
import { useState } from 'react';
import { MultiSelect } from '@/components/widgets/forms';

function MyComponent() {
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte', disabled: true },
  ];

  return (
    <MultiSelect
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Select frameworks..."
      showCount
      showSelectAll
      maxSelections={3}
    />
  );
}
```

### FileUpload

Drag-and-drop file upload with progress tracking.

**Features:**
- react-dropzone integration
- File type validation
- File size validation
- Upload progress display
- Multiple file support
- File list with remove buttons

**Example:**
```tsx
import { FileUpload } from '@/components/widgets/forms';

function MyComponent() {
  const handleUpload = async (files: File[]) => {
    // Upload to backend
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.urls; // Return array of uploaded file URLs
  };

  return (
    <FileUpload
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      multiple
      maxFiles={5}
      onUpload={handleUpload}
      showFileList
    />
  );
}
```

**With react-hook-form:**
```tsx
import { useForm, Controller } from 'react-hook-form';
import { FileUpload, UploadedFile } from '@/components/widgets/forms';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="files"
        control={control}
        render={({ field }) => (
          <FileUpload
            accept="image/*,.pdf"
            maxSize={10 * 1024 * 1024}
            multiple
            onUpload={handleUpload}
            onChange={(files: UploadedFile[]) => {
              field.onChange(files.map(f => f.url));
            }}
          />
        )}
      />
    </form>
  );
}
```

## Integration with react-hook-form

All form widgets are designed to work seamlessly with react-hook-form:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormCard, DateRangePicker, MultiSelect } from '@/components/widgets/forms';

const schema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <FormCard form={form} onSubmit={onSubmit} title="Filter Data">
      <Controller
        name="dateRange"
        control={form.control}
        render={({ field }) => (
          <DateRangePicker
            value={field.value}
            onChange={field.onChange}
            showPresets
          />
        )}
      />
      
      <Controller
        name="categories"
        control={form.control}
        render={({ field }) => (
          <MultiSelect
            options={categoryOptions}
            value={field.value}
            onChange={field.onChange}
            showSelectAll
          />
        )}
      />
    </FormCard>
  );
}
```

## Theme Integration

All form widgets automatically adapt to the current theme (light/dark mode) using CSS custom properties from the theme system.

## Accessibility

All form widgets include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Error message associations

## Requirements

- Requirements: 1.1, 13.1, 13.2, 13.3, 13.4, 9.1-9.5
