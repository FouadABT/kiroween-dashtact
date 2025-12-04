# Specialized Widgets

Domain-specific widgets for common use cases like user profiles, pricing, comparisons, maps, and chat.

## Components

### UserCard

Display user information with avatar, details, and action buttons.

**Props:**
- `user` - User data (name, email, avatar, role, status, etc.)
- `actions` - Array of action buttons with permission checks
- `showDetails` - Show additional details (phone, location, joined date)
- `compact` - Compact mode for smaller displays
- `onClick` - Click handler for the card
- `permission` - Permission required to view the card

**Example:**
```tsx
<UserCard
  user={{
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg',
    role: 'Admin',
    status: 'online',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    joinedDate: new Date('2023-01-15'),
    bio: 'Full-stack developer with 10 years of experience'
  }}
  actions={[
    { 
      label: 'Edit', 
      onClick: (user) => console.log('Edit', user),
      permission: 'users:write',
      icon: Edit
    },
    { 
      label: 'Delete', 
      onClick: (user) => console.log('Delete', user),
      permission: 'users:delete',
      variant: 'destructive',
      icon: Trash
    }
  ]}
/>
```

### PricingCard

Display pricing plans with features and call-to-action.

**Props:**
- `plan` - Plan name
- `price` - Price amount (number or string)
- `period` - Billing period ('month', 'year', 'one-time')
- `currency` - Currency code (default: 'USD')
- `description` - Plan description
- `features` - Array of features with included status
- `highlighted` - Highlight this plan
- `badge` - Badge text for highlighted plan
- `buttonText` - CTA button text
- `onSelect` - Selection handler

**Example:**
```tsx
<PricingCard
  plan="Professional"
  price={29}
  period="month"
  description="Perfect for growing teams"
  features={[
    { text: 'Unlimited projects', included: true },
    { text: '50GB storage', included: true },
    { text: 'Priority support', included: true },
    { text: 'Advanced analytics', included: false }
  ]}
  highlighted
  badge="Most Popular"
  onSelect={() => console.log('Selected Professional')}
/>
```

### ComparisonTable

Display feature comparison across multiple options.

**Props:**
- `columns` - Column definitions with labels and highlighting
- `features` - Feature categories and items with values
- `showCategories` - Show category headers (default: true)

**Example:**
```tsx
<ComparisonTable
  columns={[
    { id: 'basic', label: 'Basic', highlighted: false },
    { id: 'pro', label: 'Professional', highlighted: true, badge: 'Popular' },
    { id: 'enterprise', label: 'Enterprise', highlighted: false }
  ]}
  features={[
    {
      category: 'Core Features',
      items: [
        { 
          label: 'Users', 
          values: { basic: '5', pro: '25', enterprise: 'Unlimited' } 
        },
        { 
          label: 'Storage', 
          values: { basic: '10GB', pro: '100GB', enterprise: '1TB' } 
        },
        { 
          label: 'API Access', 
          values: { basic: false, pro: true, enterprise: true } 
        }
      ]
    },
    {
      category: 'Support',
      items: [
        { 
          label: '24/7 Support', 
          values: { basic: false, pro: false, enterprise: true } 
        }
      ]
    }
  ]}
/>
```

### MapWidget

Display a map with markers (placeholder implementation).

**Props:**
- `center` - Map center coordinates (lat, lng)
- `zoom` - Zoom level (1-20, default: 12)
- `markers` - Array of markers to display
- `onMarkerClick` - Marker click handler
- `height` - Map height (default: 400)
- `showControls` - Show zoom controls (default: true)

**Example:**
```tsx
<MapWidget
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  markers={[
    { 
      id: '1', 
      lat: 40.7128, 
      lng: -74.0060, 
      label: 'New York', 
      color: 'red' 
    },
    { 
      id: '2', 
      lat: 40.7589, 
      lng: -73.9851, 
      label: 'Times Square', 
      color: 'blue' 
    }
  ]}
  onMarkerClick={(marker) => console.log('Clicked:', marker)}
  height={500}
/>
```

**Note:** This is a placeholder implementation. For production use, integrate with react-leaflet or another mapping library.

### ChatWidget

Display a chat interface with messages and input.

**Props:**
- `messages` - Array of chat messages
- `currentUser` - Current user object
- `onSendMessage` - Send message handler
- `typingUsers` - Array of user names currently typing
- `height` - Widget height (default: 500)
- `placeholder` - Input placeholder text
- `disabled` - Disable input

**Example:**
```tsx
<ChatWidget
  messages={[
    {
      id: '1',
      text: 'Hello! How can I help you?',
      sender: { id: '1', name: 'Support', avatar: '/support.jpg' },
      timestamp: new Date('2024-01-15T10:00:00'),
      isOwn: false
    },
    {
      id: '2',
      text: 'I need help with my account',
      sender: { id: '2', name: 'Me', avatar: '/me.jpg' },
      timestamp: new Date('2024-01-15T10:01:00'),
      isOwn: true
    }
  ]}
  currentUser={{ id: '2', name: 'Me', avatar: '/me.jpg' }}
  onSendMessage={(text) => console.log('Send:', text)}
  typingUsers={['Support']}
  height={600}
/>
```

## Features

### Theme Integration
All specialized widgets use theme-aware styling:
- Automatic light/dark mode support
- OKLCH color tokens
- Consistent spacing and typography

### Permission Control
UserCard actions support permission-based visibility:
```tsx
actions={[
  { 
    label: 'Edit', 
    onClick: handleEdit,
    permission: 'users:write'  // Only shown if user has permission
  }
]}
```

### Responsive Design
- UserCard: Stacks content on mobile
- PricingCard: Adjusts padding and font sizes
- ComparisonTable: Horizontal scroll on mobile with hint
- MapWidget: Fullscreen mode available
- ChatWidget: Flexible height and responsive layout

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance

## Best Practices

### UserCard
- Use compact mode in lists or grids
- Provide meaningful action buttons
- Apply appropriate permissions to actions
- Include relevant user details

### PricingCard
- Highlight the recommended plan
- Use clear, concise feature descriptions
- Include both included and excluded features
- Make pricing transparent

### ComparisonTable
- Group features by category
- Use boolean values for yes/no features
- Highlight the recommended option
- Keep feature names short

### MapWidget
- Provide meaningful marker labels
- Use distinct colors for different marker types
- Handle marker clicks appropriately
- Consider integrating a real mapping library for production

### ChatWidget
- Auto-scroll to latest messages
- Show typing indicators for better UX
- Format timestamps appropriately
- Handle send errors gracefully

## Integration Examples

### User Profile Page
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="md:col-span-1">
    <UserCard
      user={userData}
      actions={userActions}
      showDetails
    />
  </div>
  <div className="md:col-span-2">
    {/* Other profile content */}
  </div>
</div>
```

### Pricing Page
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {plans.map(plan => (
    <PricingCard
      key={plan.id}
      {...plan}
      onSelect={() => handleSelectPlan(plan.id)}
    />
  ))}
</div>
```

### Feature Comparison
```tsx
<div className="max-w-6xl mx-auto">
  <ComparisonTable
    columns={planColumns}
    features={featureCategories}
  />
</div>
```

### Location Finder
```tsx
<MapWidget
  center={userLocation}
  markers={nearbyLocations}
  onMarkerClick={handleLocationClick}
  height="100%"
/>
```

### Support Chat
```tsx
<div className="fixed bottom-4 right-4 w-96">
  <ChatWidget
    messages={chatMessages}
    currentUser={currentUser}
    onSendMessage={handleSendMessage}
    typingUsers={typingUsers}
    height={500}
  />
</div>
```
