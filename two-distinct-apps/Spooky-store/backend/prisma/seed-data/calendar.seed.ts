import { PrismaClient } from '@prisma/client';

export async function seedCalendar(prisma: PrismaClient) {
  console.log('Seeding calendar data...');

  // Default event categories
  const categories = [
    {
      name: 'Meeting',
      slug: 'meeting',
      description: 'Team meetings, client calls, and discussions',
      color: '#3B82F6', // Blue
      icon: 'Users',
      isSystem: true,
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Task',
      slug: 'task',
      description: 'Tasks and to-do items',
      color: '#10B981', // Green
      icon: 'CheckSquare',
      isSystem: true,
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Deadline',
      slug: 'deadline',
      description: 'Project deadlines and due dates',
      color: '#EF4444', // Red
      icon: 'AlertCircle',
      isSystem: true,
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Booking',
      slug: 'booking',
      description: 'Appointments and reservations',
      color: '#8B5CF6', // Purple
      icon: 'Calendar',
      isSystem: true,
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Class',
      slug: 'class',
      description: 'Training sessions and classes',
      color: '#F59E0B', // Amber
      icon: 'BookOpen',
      isSystem: true,
      displayOrder: 5,
      isActive: true,
    },
    {
      name: 'Promotion',
      slug: 'promotion',
      description: 'Marketing campaigns and promotions',
      color: '#EC4899', // Pink
      icon: 'TrendingUp',
      isSystem: true,
      displayOrder: 6,
      isActive: true,
    },
    {
      name: 'Reminder',
      slug: 'reminder',
      description: 'Personal reminders and notes',
      color: '#6366F1', // Indigo
      icon: 'Bell',
      isSystem: true,
      displayOrder: 7,
      isActive: true,
    },
    {
      name: 'Custom',
      slug: 'custom',
      description: 'Custom events and activities',
      color: '#64748B', // Slate
      icon: 'Star',
      isSystem: false,
      displayOrder: 8,
      isActive: true,
    },
  ];

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✓ Seeded ${categories.length} event categories`);

  // Create global calendar settings
  const existingGlobalSettings = await prisma.calendarSettings.findFirst({
    where: { userId: null },
  });

  if (!existingGlobalSettings) {
    await prisma.calendarSettings.create({
      data: {
        userId: null,
        defaultView: 'month',
        weekStartsOn: 0,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        workingDays: [1, 2, 3, 4, 5],
        timeZone: 'UTC',
        defaultReminders: [15],
        showWeekNumbers: false,
      },
    });
    console.log('✓ Seeded global calendar settings');
  } else {
    console.log('⏭️  Global calendar settings already exist');
  }

  // Create calendar notification templates
  const notificationTemplates = [
    {
      key: 'calendar_event_reminder',
      name: 'Event Reminder',
      description: 'Notification sent before an event starts',
      category: 'CALENDAR' as const,
      title: 'Reminder: {{event_title}}',
      message: 'Your event "{{event_title}}" starts {{time_until}}',
      variables: ['event_title', 'time_until', 'event_id'],
      isActive: true,
    },
    {
      key: 'calendar_event_created',
      name: 'Event Invitation',
      description: 'Notification sent when user is invited to an event',
      category: 'CALENDAR' as const,
      title: 'Event Invitation: {{event_title}}',
      message: 'You\'ve been invited to "{{event_title}}" by {{invited_by}}',
      variables: ['event_title', 'invited_by', 'event_id'],
      isActive: true,
    },
    {
      key: 'calendar_event_updated',
      name: 'Event Updated',
      description: 'Notification sent when an event is updated',
      category: 'CALENDAR' as const,
      title: 'Event Updated: {{event_title}}',
      message: '"{{event_title}}" has been updated by {{updated_by}}',
      variables: ['event_title', 'updated_by', 'event_id'],
      isActive: true,
    },
    {
      key: 'calendar_event_cancelled',
      name: 'Event Cancelled',
      description: 'Notification sent when an event is cancelled',
      category: 'CALENDAR' as const,
      title: 'Event Cancelled: {{event_title}}',
      message: 'The event "{{event_title}}" has been cancelled by {{cancelled_by}}',
      variables: ['event_title', 'cancelled_by', 'event_id'],
      isActive: true,
    },
    {
      key: 'calendar_attendee_added',
      name: 'Added to Event',
      description: 'Notification sent when user is added to an event',
      category: 'CALENDAR' as const,
      title: 'Added to Event: {{event_title}}',
      message: 'You\'ve been added to "{{event_title}}"',
      variables: ['event_title', 'event_id'],
      isActive: true,
    },
    {
      key: 'calendar_attendee_removed',
      name: 'Removed from Event',
      description: 'Notification sent when user is removed from an event',
      category: 'CALENDAR' as const,
      title: 'Removed from Event: {{event_title}}',
      message: 'You\'ve been removed from "{{event_title}}"',
      variables: ['event_title', 'event_id'],
      isActive: true,
    },
  ];

  for (const template of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
  }

  console.log(`✓ Seeded ${notificationTemplates.length} calendar notification templates`);
}
