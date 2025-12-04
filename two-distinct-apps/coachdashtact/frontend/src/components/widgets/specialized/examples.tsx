'use client';

/**
 * Specialized Widgets Examples
 * 
 * This file contains example usage of all specialized widgets.
 * Use these examples as a reference for implementing widgets in your application.
 */

'use client';

import React, { useState } from 'react';
import { UserCard, UserCardUser, UserCardAction } from './UserCard';
import { PricingCard, PricingFeature } from './PricingCard';
import { ComparisonTable, ComparisonColumn, ComparisonFeatureCategory } from './ComparisonTable';
import { MapWidget, MapMarker } from './MapWidget';
import { ChatWidget, ChatMessage, ChatUser } from './ChatWidget';
import { Edit, Trash, Mail, Phone } from 'lucide-react';

// ============================================================================
// UserCard Examples
// ============================================================================

export function UserCardExample() {
  const user: UserCardUser = {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Senior Developer',
    status: 'online',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinedDate: new Date('2023-01-15'),
    bio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture.',
  };

  const actions: UserCardAction[] = [
    {
      label: 'Edit',
      onClick: (user) => console.log('Edit user:', user),
      icon: Edit,
      permission: 'users:write',
    },
    {
      label: 'Message',
      onClick: (user) => console.log('Message user:', user),
      icon: Mail,
      variant: 'outline',
    },
    {
      label: 'Delete',
      onClick: (user) => console.log('Delete user:', user),
      icon: Trash,
      variant: 'destructive',
      permission: 'users:delete',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Full User Card</h3>
        <UserCard user={user} actions={actions} showDetails />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Compact User Card</h3>
        <UserCard user={user} actions={actions} compact />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">User Card Grid</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <UserCard
              key={i}
              user={{
                ...user,
                id: `${i}`,
                name: `User ${i}`,
                email: `user${i}@example.com`,
              }}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PricingCard Examples
// ============================================================================

export function PricingCardExample() {
  const basicFeatures: PricingFeature[] = [
    { text: 'Up to 5 users', included: true },
    { text: '10GB storage', included: true },
    { text: 'Basic support', included: true },
    { text: 'API access', included: false },
    { text: 'Advanced analytics', included: false },
    { text: 'Custom integrations', included: false },
  ];

  const proFeatures: PricingFeature[] = [
    { text: 'Up to 25 users', included: true },
    { text: '100GB storage', included: true },
    { text: 'Priority support', included: true },
    { text: 'API access', included: true },
    { text: 'Advanced analytics', included: true },
    { text: 'Custom integrations', included: false },
  ];

  const enterpriseFeatures: PricingFeature[] = [
    { text: 'Unlimited users', included: true },
    { text: '1TB storage', included: true },
    { text: '24/7 dedicated support', included: true },
    { text: 'Full API access', included: true },
    { text: 'Advanced analytics', included: true },
    { text: 'Custom integrations', included: true },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Pricing Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingCard
          plan="Basic"
          price={9}
          period="month"
          description="Perfect for individuals"
          features={basicFeatures}
          onSelect={() => console.log('Selected Basic')}
        />

        <PricingCard
          plan="Professional"
          price={29}
          period="month"
          description="Great for growing teams"
          features={proFeatures}
          highlighted
          badge="Most Popular"
          onSelect={() => console.log('Selected Professional')}
        />

        <PricingCard
          plan="Enterprise"
          price="Custom"
          description="For large organizations"
          features={enterpriseFeatures}
          buttonText="Contact Sales"
          onSelect={() => console.log('Selected Enterprise')}
        />
      </div>
    </div>
  );
}

// ============================================================================
// ComparisonTable Examples
// ============================================================================

export function ComparisonTableExample() {
  const columns: ComparisonColumn[] = [
    { id: 'basic', label: 'Basic', highlighted: false },
    { id: 'pro', label: 'Professional', highlighted: true, badge: 'Popular' },
    { id: 'enterprise', label: 'Enterprise', highlighted: false },
  ];

  const features: ComparisonFeatureCategory[] = [
    {
      category: 'Core Features',
      items: [
        { label: 'Users', values: { basic: '5', pro: '25', enterprise: 'Unlimited' } },
        { label: 'Storage', values: { basic: '10GB', pro: '100GB', enterprise: '1TB' } },
        { label: 'Projects', values: { basic: '10', pro: '100', enterprise: 'Unlimited' } },
        { label: 'File uploads', values: { basic: true, pro: true, enterprise: true } },
      ],
    },
    {
      category: 'Collaboration',
      items: [
        { label: 'Team chat', values: { basic: false, pro: true, enterprise: true } },
        { label: 'Video calls', values: { basic: false, pro: true, enterprise: true } },
        { label: 'Screen sharing', values: { basic: false, pro: false, enterprise: true } },
        { label: 'Guest access', values: { basic: false, pro: true, enterprise: true } },
      ],
    },
    {
      category: 'Advanced Features',
      items: [
        { label: 'API access', values: { basic: false, pro: true, enterprise: true } },
        { label: 'Webhooks', values: { basic: false, pro: true, enterprise: true } },
        { label: 'Custom integrations', values: { basic: false, pro: false, enterprise: true } },
        { label: 'SSO/SAML', values: { basic: false, pro: false, enterprise: true } },
      ],
    },
    {
      category: 'Support',
      items: [
        { label: 'Email support', values: { basic: true, pro: true, enterprise: true } },
        { label: 'Priority support', values: { basic: false, pro: true, enterprise: true } },
        { label: '24/7 support', values: { basic: false, pro: false, enterprise: true } },
        { label: 'Dedicated account manager', values: { basic: false, pro: false, enterprise: true } },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Feature Comparison</h3>
      <ComparisonTable columns={columns} features={features} />
    </div>
  );
}

// ============================================================================
// MapWidget Examples
// ============================================================================

export function MapWidgetExample() {
  const markers: MapMarker[] = [
    {
      id: '1',
      lat: 40.7128,
      lng: -74.006,
      label: 'New York Office',
      color: '#ef4444',
    },
    {
      id: '2',
      lat: 40.7589,
      lng: -73.9851,
      label: 'Times Square',
      color: '#3b82f6',
    },
    {
      id: '3',
      lat: 40.7614,
      lng: -73.9776,
      label: 'Central Park',
      color: '#22c55e',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Map Widget</h3>
      <MapWidget
        center={{ lat: 40.7128, lng: -74.006 }}
        zoom={13}
        markers={markers}
        onMarkerClick={(marker) => console.log('Clicked marker:', marker)}
        height={500}
      />
    </div>
  );
}

// ============================================================================
// ChatWidget Examples
// ============================================================================

export function ChatWidgetExample() {
  const currentUser: ChatUser = {
    id: '1',
    name: 'You',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: {
        id: '2',
        name: 'Support Agent',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
      },
      timestamp: new Date(Date.now() - 300000),
      isOwn: false,
    },
    {
      id: '2',
      text: 'Hi! I have a question about my account.',
      sender: currentUser,
      timestamp: new Date(Date.now() - 240000),
      isOwn: true,
    },
    {
      id: '3',
      text: "Of course! I'd be happy to help. What would you like to know?",
      sender: {
        id: '2',
        name: 'Support Agent',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
      },
      timestamp: new Date(Date.now() - 180000),
      isOwn: false,
    },
  ]);

  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: `${messages.length + 1}`,
      text,
      sender: currentUser,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);

    // Simulate typing indicator
    setTypingUsers(['Support Agent']);
    setTimeout(() => {
      setTypingUsers([]);
      
      // Simulate response
      const response: ChatMessage = {
        id: `${messages.length + 2}`,
        text: 'Thanks for your message! Let me look into that for you.',
        sender: {
          id: '2',
          name: 'Support Agent',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
        },
        timestamp: new Date(),
        isOwn: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Chat Widget</h3>
      <div className="max-w-2xl">
        <ChatWidget
          messages={messages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          typingUsers={typingUsers}
          height={600}
        />
      </div>
    </div>
  );
}

// ============================================================================
// All Examples Combined
// ============================================================================

export function SpecializedWidgetsShowcase() {
  return (
    <div className="space-y-12 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Specialized Widgets</h2>
        <p className="text-muted-foreground mb-8">
          Domain-specific widgets for common use cases like user profiles, pricing, comparisons, maps, and chat.
        </p>
      </div>

      <UserCardExample />
      <PricingCardExample />
      <ComparisonTableExample />
      <MapWidgetExample />
      <ChatWidgetExample />
    </div>
  );
}

