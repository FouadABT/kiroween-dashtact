# 🎨 Branding Setup Guide

## Overview

The setup CLI now includes an optional branding configuration step that allows you to set up your brand identity during initial setup.

## What Gets Configured

### ✅ During Setup CLI (Step 5)

**Text-Based Configuration**:
- **Brand Name**: Your company/application name
- **Tagline**: Short slogan or tagline
- **Description**: Longer description
- **Website URL**: Company website
- **Support Email**: Support contact email

### 📤 After Setup (Dashboard)

**File-Based Configuration** (Dashboard → Settings → Branding):
- Light theme logo
- Dark theme logo
- Favicon
- Social media links (Twitter, LinkedIn, Facebook, Instagram)

## Setup Flow

### 1. Run Setup CLI

```bash
node setup-cli.js
```

### 2. Branding Configuration (Step 5)

You'll be asked:
```
Would you like to configure branding now? (y/n):
```

**Option A: Configure Now**
- Enter brand name, tagline, description, etc.
- Data is saved to database during seeding

**Option B: Skip**
- Default values are used
- You can configure later from dashboard

### 3. Example Interaction

```
🎨 Branding Configuration
─────────────────────────────────────────────────────────────

Set up your brand identity for the application.
Press Enter to use default values or skip optional fields.

Would you like to configure branding now? (y/n): y

📝 Enter your brand information:
   (Leave empty to use defaults)

Brand Name [Dashboard]: My Awesome Company
Tagline (optional): Building the future
Description (optional): We provide innovative solutions for modern businesses
Website URL (optional): https://mycompany.com
Support Email (optional): support@mycompany.com

💡 Note: Logos and favicon can be uploaded from Dashboard → Settings → Branding
   • Light theme logo
   • Dark theme logo
   • Favicon
```

## Database Storage

**Table**: `brand_settings`

**Fields**:
```typescript
{
  id: string;
  brandName: string;        // From CLI
  tagline: string | null;   // From CLI
  description: string | null; // From CLI
  websiteUrl: string | null;  // From CLI
  supportEmail: string | null; // From CLI
  logoUrl: string | null;     // Upload later
  logoDarkUrl: string | null; // Upload later
  faviconUrl: string | null;  // Upload later
  socialLinks: {              // Configure later
    twitter: string;
    linkedin: string;
    facebook: string;
    instagram: string;
  };
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

## How It Works

### 1. CLI Collects Data

The setup CLI collects branding information and passes it as environment variables to the seed script:

```javascript
const seedEnv = {
  BRAND_NAME: 'My Awesome Company',
  BRAND_TAGLINE: 'Building the future',
  BRAND_DESCRIPTION: 'We provide innovative solutions...',
  BRAND_WEBSITE_URL: 'https://mycompany.com',
  BRAND_SUPPORT_EMAIL: 'support@mycompany.com',
};
```

### 2. Seed Script Reads Variables

The `branding.seed.ts` file reads these environment variables:

```typescript
const brandName = process.env.BRAND_NAME || 'Dashboard';
const tagline = process.env.BRAND_TAGLINE || 'Your powerful admin dashboard';
// ... etc
```

### 3. Data Inserted to Database

During `npm run prisma:seed`, the branding data is inserted:

```typescript
await prisma.brandSettings.create({
  data: {
    brandName,
    tagline,
    description,
    websiteUrl,
    supportEmail,
    // Logos set to null (upload later)
    logoUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
  },
});
```

## Updating Branding Later

### Via Dashboard

1. Navigate to **Dashboard → Settings → Branding**
2. Update any field:
   - Brand name, tagline, description
   - Upload logos (light/dark)
   - Upload favicon
   - Add social media links
3. Click **Save Changes**

### Via Database

```sql
UPDATE brand_settings 
SET 
  brand_name = 'New Name',
  tagline = 'New Tagline',
  logo_url = '/public/logos/logo.png'
WHERE id = 'your-brand-id';
```

### Via API

```typescript
// PATCH /api/branding/:id
await BrandingApi.update(id, {
  brandName: 'New Name',
  tagline: 'New Tagline',
  logoUrl: '/public/logos/logo.png',
});
```

## Default Values

If you skip branding configuration, these defaults are used:

```typescript
{
  brandName: 'Dashboard',
  tagline: 'Your powerful admin dashboard',
  description: 'A modern, customizable dashboard for managing your application',
  websiteUrl: null,
  supportEmail: null,
  logoUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  socialLinks: {
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: '',
  },
}
```

## Benefits

### ✅ Quick Setup
- Configure branding during initial setup
- No need to log in to dashboard first

### ✅ Flexible
- Skip if you want to configure later
- All fields are optional

### ✅ Professional
- Separates text input (CLI) from file uploads (Dashboard)
- Clear guidance on what to do next

### ✅ Consistent
- Branding data available immediately after setup
- Used across landing pages, emails, and dashboard

## Where Branding Is Used

### 1. Landing Page
- Hero section
- Footer
- SEO metadata

### 2. Email Templates
- Email headers/footers
- Support contact information

### 3. Dashboard
- Application title
- Sidebar branding
- Settings pages

### 4. Public Pages
- Custom pages
- Blog posts
- Legal pages

## Troubleshooting

### Branding Not Showing

**Check database**:
```sql
SELECT * FROM brand_settings;
```

**Verify seed ran**:
```bash
cd backend
npm run prisma:seed
```

### Update Branding After Setup

**Option 1: Dashboard UI**
- Navigate to Settings → Branding
- Update fields
- Save changes

**Option 2: Re-run Seed**
```bash
# Delete existing branding
DELETE FROM brand_settings;

# Re-run seed with new env vars
BRAND_NAME="New Name" npm run prisma:seed
```

### Logo Upload Issues

**Check public directory**:
```bash
ls backend/public/logos/
```

**Verify file permissions**:
```bash
chmod 755 backend/public/logos/
```

**Check file size**:
- Max size: 5MB
- Supported formats: PNG, JPG, SVG

## Best Practices

### 1. Use Descriptive Names
```
✅ "Acme Corporation"
❌ "My App"
```

### 2. Keep Tagline Short
```
✅ "Building the future of commerce"
❌ "We are a company that builds amazing products for businesses..."
```

### 3. Professional Email
```
✅ support@company.com
❌ john.doe@gmail.com
```

### 4. Complete Website URL
```
✅ https://www.company.com
❌ company.com
```

### 5. Upload High-Quality Logos
- Use SVG for scalability
- Provide both light and dark versions
- Maintain consistent branding

## Next Steps

After configuring branding:

1. ✅ Complete setup CLI
2. ✅ Start backend and frontend servers
3. ✅ Log in to dashboard
4. ✅ Navigate to Settings → Branding
5. ✅ Upload logos and favicon
6. ✅ Add social media links
7. ✅ Review landing page
8. ✅ Test email templates

---

**Happy branding! 🎨**
