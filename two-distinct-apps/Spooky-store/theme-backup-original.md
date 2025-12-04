# Theme Settings Backup - Original Design

**Backup Date**: December 2, 2025
**Purpose**: Rollback point before Halloween theme implementation

## Global Settings (ID: cminoh19t003fiw5sl1plkts4)

### Theme Configuration
- **Theme Mode**: dark
- **Active Theme**: default

### Light Palette
```json
{
  "background": "0 0% 100%",
  "foreground": "240 10% 3.9%",
  "card": "0 0% 100%",
  "cardForeground": "240 10% 3.9%",
  "popover": "0 0% 100%",
  "popoverForeground": "240 10% 3.9%",
  "primary": "240 5.9% 10%",
  "primaryForeground": "0 0% 98%",
  "secondary": "240 4.8% 95.9%",
  "secondaryForeground": "240 5.9% 10%",
  "muted": "240 4.8% 95.9%",
  "mutedForeground": "240 3.8% 46.1%",
  "accent": "240 4.8% 95.9%",
  "accentForeground": "240 5.9% 10%",
  "destructive": "0 84.2% 60.2%",
  "destructiveForeground": "0 0% 98%",
  "border": "240 5.9% 90%",
  "input": "240 5.9% 90%",
  "ring": "240 5.9% 10%",
  "radius": "0.625rem",
  "sidebar": "0 0% 98%",
  "sidebarForeground": "240 5.3% 26.1%",
  "sidebarPrimary": "240 5.9% 10%",
  "sidebarPrimaryForeground": "0 0% 98%",
  "sidebarAccent": "240 4.8% 95.9%",
  "sidebarAccentForeground": "240 5.9% 10%",
  "sidebarBorder": "220 13% 91%",
  "sidebarRing": "240 5.9% 10%",
  "chart1": "220 70% 50%",
  "chart2": "160 60% 45%",
  "chart3": "30 80% 55%",
  "chart4": "280 65% 60%",
  "chart5": "340 75% 55%"
}
```

### Dark Palette
```json
{
  "background": "222.2 84% 4.9%",
  "foreground": "210 40% 98%",
  "card": "222.2 84% 4.9%",
  "cardForeground": "210 40% 98%",
  "popover": "222.2 84% 4.9%",
  "popoverForeground": "210 40% 98%",
  "primary": "210 40% 98%",
  "primaryForeground": "222.2 47.4% 11.2%",
  "secondary": "217.2 32.6% 17.5%",
  "secondaryForeground": "210 40% 98%",
  "muted": "217.2 32.6% 17.5%",
  "mutedForeground": "215 20.2% 65.1%",
  "accent": "217.2 32.6% 17.5%",
  "accentForeground": "210 40% 98%",
  "destructive": "0 62.8% 30.6%",
  "destructiveForeground": "210 40% 98%",
  "border": "217.2 32.6% 17.5%",
  "input": "217.2 32.6% 17.5%",
  "ring": "212.7 26.8% 83.9%",
  "radius": "0.625rem",
  "sidebar": "222.2 84% 4.9%",
  "sidebarForeground": "210 40% 98%",
  "sidebarPrimary": "217.2 91.2% 59.8%",
  "sidebarPrimaryForeground": "222.2 47.4% 11.2%",
  "sidebarAccent": "217.2 32.6% 17.5%",
  "sidebarAccentForeground": "210 40% 98%",
  "sidebarBorder": "217.2 32.6% 17.5%",
  "sidebarRing": "217.2 91.2% 59.8%",
  "chart1": "220 70% 50%",
  "chart2": "160 60% 45%",
  "chart3": "30 80% 55%",
  "chart4": "280 65% 60%",
  "chart5": "340 75% 55%"
}
```

### Typography
```json
{
  "fontFamily": {
    "sans": ["Inter", "system-ui", "sans-serif"],
    "serif": ["Georgia", "serif"],
    "mono": ["Fira Code", "monospace"]
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem"
  },
  "fontWeight": {
    "light": 300,
    "normal": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700,
    "extrabold": 800
  },
  "lineHeight": {
    "tight": 1.25,
    "normal": 1.5,
    "relaxed": 1.75,
    "loose": 2
  },
  "letterSpacing": {
    "tighter": "-0.05em",
    "tight": "-0.025em",
    "normal": "0",
    "wide": "0.025em",
    "wider": "0.05em"
  }
}
```

---

## User Settings (ID: cmintk33w000aiw702a2cmhou)
**User ID**: cminoh56y008viw5suk73ex30

Same configuration as global settings.

---

## Rollback Instructions

To restore original theme, run:

```sql
UPDATE settings 
SET 
  light_palette = '{"card": "0 0% 100%", "ring": "240 5.9% 10%", "input": "240 5.9% 90%", "muted": "240 4.8% 95.9%", "accent": "240 4.8% 95.9%", "border": "240 5.9% 90%", "chart1": "220 70% 50%", "chart2": "160 60% 45%", "chart3": "30 80% 55%", "chart4": "280 65% 60%", "chart5": "340 75% 55%", "radius": "0.625rem", "popover": "0 0% 100%", "primary": "240 5.9% 10%", "sidebar": "0 0% 98%", "secondary": "240 4.8% 95.9%", "background": "0 0% 100%", "foreground": "240 10% 3.9%", "destructive": "0 84.2% 60.2%", "sidebarRing": "240 5.9% 10%", "sidebarAccent": "240 4.8% 95.9%", "sidebarBorder": "220 13% 91%", "cardForeground": "240 10% 3.9%", "sidebarPrimary": "240 5.9% 10%", "mutedForeground": "240 3.8% 46.1%", "accentForeground": "240 5.9% 10%", "popoverForeground": "240 10% 3.9%", "primaryForeground": "0 0% 98%", "sidebarForeground": "240 5.3% 26.1%", "secondaryForeground": "240 5.9% 10%", "destructiveForeground": "0 0% 98%", "sidebarAccentForeground": "240 5.9% 10%", "sidebarPrimaryForeground": "0 0% 98%"}'::jsonb,
  dark_palette = '{"card": "222.2 84% 4.9%", "ring": "212.7 26.8% 83.9%", "input": "217.2 32.6% 17.5%", "muted": "217.2 32.6% 17.5%", "accent": "217.2 32.6% 17.5%", "border": "217.2 32.6% 17.5%", "chart1": "220 70% 50%", "chart2": "160 60% 45%", "chart3": "30 80% 55%", "chart4": "280 65% 60%", "chart5": "340 75% 55%", "radius": "0.625rem", "popover": "222.2 84% 4.9%", "primary": "210 40% 98%", "sidebar": "222.2 84% 4.9%", "secondary": "217.2 32.6% 17.5%", "background": "222.2 84% 4.9%", "foreground": "210 40% 98%", "destructive": "0 62.8% 30.6%", "sidebarRing": "217.2 91.2% 59.8%", "sidebarAccent": "217.2 32.6% 17.5%", "sidebarBorder": "217.2 32.6% 17.5%", "cardForeground": "210 40% 98%", "sidebarPrimary": "217.2 91.2% 59.8%", "mutedForeground": "215 20.2% 65.1%", "accentForeground": "210 40% 98%", "popoverForeground": "210 40% 98%", "primaryForeground": "222.2 47.4% 11.2%", "sidebarForeground": "210 40% 98%", "secondaryForeground": "210 40% 98%", "destructiveForeground": "210 40% 98%", "sidebarAccentForeground": "210 40% 98%", "sidebarPrimaryForeground": "222.2 47.4% 11.2%"}'::jsonb,
  typography = '{"fontSize": {"lg": "1.125rem", "sm": "0.875rem", "xl": "1.25rem", "xs": "0.75rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem", "base": "1rem"}, "fontFamily": {"mono": ["Fira Code", "monospace"], "sans": ["Inter", "system-ui", "sans-serif"], "serif": ["Georgia", "serif"]}, "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600, "extrabold": 800}, "lineHeight": {"loose": 2, "tight": 1.25, "normal": 1.5, "relaxed": 1.75}, "letterSpacing": {"wide": "0.025em", "tight": "-0.025em", "wider": "0.05em", "normal": "0", "tighter": "-0.05em"}}'::jsonb,
  updated_at = NOW()
WHERE scope = 'global';
```
