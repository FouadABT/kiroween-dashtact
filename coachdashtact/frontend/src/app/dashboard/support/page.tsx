'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMetadata } from '@/contexts/MetadataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  Database, 
  Layers, 
  Server, 
  Globe,
  ShoppingCart,
  Calendar,
  Bell,
  Users,
  Shield,
  Mail,
  MessageSquare,
  FileText,
  Palette,
  Layout,
  Boxes,
  Activity
} from 'lucide-react';

export default function SupportPage() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: 'Support & Documentation',
      description: 'Project overview, features, and business logic',
    });
  }, [updateMetadata]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Documentation"
        description="Complete overview of your dashboard application"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="business">Business Logic</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Same content as Spooky-store */}
        {/* Features Tab - Same content as Spooky-store */}
        {/* Architecture Tab - Same content as Spooky-store */}
        {/* Business Logic Tab - Same content as Spooky-store */}
        
        {/* (Content identical to Spooky-store version above) */}
      </Tabs>
    </div>
  );
}
