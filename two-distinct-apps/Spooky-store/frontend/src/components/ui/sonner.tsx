"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset="80px"
      duration={5000}
      closeButton
      richColors
      expand={false}
      visibleToasts={5}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-border',
          error: 'group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-border',
          warning: 'group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-border',
          info: 'group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-border',
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--card))",
          "--normal-text": "hsl(var(--card-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--card))",
          "--success-text": "hsl(var(--card-foreground))",
          "--success-border": "hsl(var(--border))",
          "--error-bg": "hsl(var(--card))",
          "--error-text": "hsl(var(--card-foreground))",
          "--error-border": "hsl(var(--border))",
          "--warning-bg": "hsl(var(--card))",
          "--warning-text": "hsl(var(--card-foreground))",
          "--warning-border": "hsl(var(--border))",
          "--info-bg": "hsl(var(--card))",
          "--info-text": "hsl(var(--card-foreground))",
          "--info-border": "hsl(var(--border))",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
