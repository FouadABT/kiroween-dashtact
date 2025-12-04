// Messaging System Seed Data

export const MESSAGING_PERMISSIONS = [
  {
    name: 'messaging:access',
    description: 'Access to messaging system',
    resource: 'messaging',
    action: 'access',
  },
  {
    name: 'messaging:settings:read',
    description: 'View messaging settings',
    resource: 'messaging',
    action: 'settings:read',
  },
  {
    name: 'messaging:settings:write',
    description: 'Update messaging settings',
    resource: 'messaging',
    action: 'settings:write',
  },
  {
    name: 'messaging:admin',
    description: 'Full messaging administration',
    resource: 'messaging',
    action: 'admin',
  },
];

export const DEFAULT_MESSAGING_SETTINGS = {
  enabled: false,
  maxMessageLength: 2000,
  messageRetentionDays: 90,
  maxGroupParticipants: 50,
  allowFileAttachments: false,
  maxFileSize: 5242880, // 5MB in bytes
  allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  typingIndicatorTimeout: 3000, // milliseconds
};
