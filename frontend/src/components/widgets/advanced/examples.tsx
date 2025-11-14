'use client';

import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import { Calendar } from './Calendar';
import { TreeView } from './TreeView';
import { Timeline } from './Timeline';
import { Folder, File, FileText, Image } from 'lucide-react';

// KanbanBoard Example
export function KanbanBoardExample() {
  const columns = [
    {
      id: 'backlog',
      title: 'Backlog',
      items: [
        {
          id: '1',
          title: 'Design new landing page',
          description: 'Create mockups and wireframes',
          columnId: 'backlog',
          metadata: { priority: 'High', assignee: 'John' },
        },
        {
          id: '2',
          title: 'Update documentation',
          description: 'Add API reference docs',
          columnId: 'backlog',
          metadata: { priority: 'Medium' },
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      items: [
        {
          id: '3',
          title: 'Implement authentication',
          description: 'JWT-based auth system',
          columnId: 'in-progress',
          metadata: { priority: 'High', assignee: 'Jane' },
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      items: [
        {
          id: '4',
          title: 'Fix responsive issues',
          columnId: 'review',
          metadata: { priority: 'Medium', assignee: 'Bob' },
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      items: [
        {
          id: '5',
          title: 'Setup CI/CD pipeline',
          description: 'GitHub Actions workflow',
          columnId: 'done',
          metadata: { priority: 'High' },
        },
      ],
    },
  ];

  return (
    <KanbanBoard
      columns={columns}
      onItemMove={(itemId, fromCol, toCol, index) => {
        console.log(`Moved ${itemId} from ${fromCol} to ${toCol} at index ${index}`);
      }}
      onItemClick={(item) => {
        console.log('Clicked item:', item);
      }}
      maxHeight="500px"
    />
  );
}

// Calendar Example
export function CalendarExample() {
  const today = new Date();
  const events = [
    {
      id: '1',
      title: 'Team Standup',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      color: 'hsl(var(--chart-1))',
    },
    {
      id: '2',
      title: 'Client Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
      color: 'hsl(var(--chart-2))',
    },
    {
      id: '3',
      title: 'Project Deadline',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      allDay: true,
      color: 'hsl(var(--destructive))',
    },
    {
      id: '4',
      title: 'Code Review',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0),
      color: 'hsl(var(--chart-3))',
    },
    {
      id: '5',
      title: 'Sprint Planning',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 13, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 15, 0),
      color: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <Calendar
      events={events}
      onEventClick={(event) => {
        console.log('Event clicked:', event);
      }}
      onDateClick={(date) => {
        console.log('Date clicked:', date);
      }}
      defaultView="month"
      title="Team Calendar"
    />
  );
}

// TreeView Example
export function TreeViewExample() {
  const data = [
    {
      id: '1',
      label: 'Documents',
      icon: Folder,
      children: [
        {
          id: '1-1',
          label: 'Reports',
          icon: Folder,
          children: [
            { id: '1-1-1', label: 'Q1 Report.pdf', icon: FileText },
            { id: '1-1-2', label: 'Q2 Report.pdf', icon: FileText },
          ],
        },
        {
          id: '1-2',
          label: 'Presentations',
          icon: Folder,
          children: [
            { id: '1-2-1', label: 'Pitch Deck.pptx', icon: FileText },
          ],
        },
      ],
    },
    {
      id: '2',
      label: 'Images',
      icon: Folder,
      children: [
        { id: '2-1', label: 'Logo.png', icon: Image },
        { id: '2-2', label: 'Banner.jpg', icon: Image },
        {
          id: '2-3',
          label: 'Screenshots',
          icon: Folder,
          children: [
            { id: '2-3-1', label: 'Dashboard.png', icon: Image },
            { id: '2-3-2', label: 'Settings.png', icon: Image },
          ],
        },
      ],
    },
    {
      id: '3',
      label: 'Code',
      icon: Folder,
      children: [
        { id: '3-1', label: 'index.ts', icon: File },
        { id: '3-2', label: 'utils.ts', icon: File },
        { id: '3-3', label: 'types.ts', icon: File },
      ],
    },
  ];

  return (
    <TreeView
      data={data}
      onNodeClick={(node) => {
        console.log('Node clicked:', node);
      }}
      onNodeExpand={(node) => {
        console.log('Node expanded:', node);
      }}
      onNodeCollapse={(node) => {
        console.log('Node collapsed:', node);
      }}
      defaultExpandedIds={['1', '2']}
      title="File Explorer"
      maxHeight="400px"
    />
  );
}

// TreeView with Lazy Loading Example
export function TreeViewLazyExample() {
  const rootNodes = [
    {
      id: 'root-1',
      label: 'Projects (lazy load)',
      icon: Folder,
    },
    {
      id: 'root-2',
      label: 'Archives (lazy load)',
      icon: Folder,
    },
  ];

  const loadChildren = async (node: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock children
    return [
      {
        id: `${node.id}-child-1`,
        label: `${node.label} - Item 1`,
        icon: File,
      },
      {
        id: `${node.id}-child-2`,
        label: `${node.label} - Item 2`,
        icon: File,
      },
      {
        id: `${node.id}-child-3`,
        label: `${node.label} - Folder`,
        icon: Folder,
      },
    ];
  };

  return (
    <TreeView
      data={rootNodes}
      onLoadChildren={loadChildren}
      onNodeClick={(node) => {
        console.log('Node clicked:', node);
      }}
      title="Lazy Loading Tree"
      maxHeight="400px"
    />
  );
}

// Timeline Example
export function TimelineExample() {
  const items = [
    {
      id: '1',
      type: 'update',
      title: 'Project Launched',
      description: 'Successfully deployed version 1.0 to production',
      timestamp: new Date(2024, 0, 20, 15, 30),
      user: {
        name: 'John Doe',
        avatar: undefined,
      },
      metadata: {
        version: '1.0.0',
        status: 'success',
      },
    },
    {
      id: '2',
      type: 'comment',
      title: 'Design Review Completed',
      description: 'All stakeholders approved the new design system',
      timestamp: new Date(2024, 0, 18, 11, 0),
      user: {
        name: 'Jane Smith',
      },
      metadata: {
        reviewers: '5',
      },
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Beta Testing Started',
      description: 'Invited 100 users to test the new features',
      timestamp: new Date(2024, 0, 15, 9, 0),
      user: {
        name: 'Bob Johnson',
      },
      metadata: {
        testers: '100',
      },
    },
    {
      id: '4',
      type: 'update',
      title: 'Development Sprint Completed',
      description: 'Finished all planned features for Q1',
      timestamp: new Date(2024, 0, 10, 17, 0),
      user: {
        name: 'Alice Williams',
      },
      metadata: {
        sprint: 'Q1-2024',
        tasks: '24',
      },
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Project Kickoff',
      description: 'Initial planning and team formation',
      timestamp: new Date(2024, 0, 1, 10, 0),
      user: {
        name: 'John Doe',
      },
      metadata: {
        team: '8 members',
      },
    },
  ];

  return (
    <Timeline
      items={items}
      orientation="vertical"
      onItemClick={(item) => {
        console.log('Timeline item clicked:', item);
      }}
      showTime={true}
      groupByDate={false}
      title="Project Timeline"
      maxHeight="500px"
    />
  );
}

// Timeline Horizontal Example
export function TimelineHorizontalExample() {
  const items = [
    {
      id: '1',
      type: 'milestone',
      title: 'Planning',
      description: 'Project planning phase',
      timestamp: new Date(2024, 0, 1),
      user: { name: 'Team' },
    },
    {
      id: '2',
      type: 'milestone',
      title: 'Design',
      description: 'UI/UX design phase',
      timestamp: new Date(2024, 0, 15),
      user: { name: 'Design Team' },
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Development',
      description: 'Implementation phase',
      timestamp: new Date(2024, 1, 1),
      user: { name: 'Dev Team' },
    },
    {
      id: '4',
      type: 'milestone',
      title: 'Testing',
      description: 'QA and testing phase',
      timestamp: new Date(2024, 1, 20),
      user: { name: 'QA Team' },
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Launch',
      description: 'Production deployment',
      timestamp: new Date(2024, 2, 1),
      user: { name: 'Team' },
    },
  ];

  return (
    <Timeline
      items={items}
      orientation="horizontal"
      onItemClick={(item) => {
        console.log('Timeline item clicked:', item);
      }}
      showTime={false}
      title="Project Roadmap"
    />
  );
}

// All Examples Combined
export function AdvancedWidgetsShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">KanbanBoard</h2>
        <KanbanBoardExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <CalendarExample />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">TreeView</h2>
          <TreeViewExample />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">TreeView (Lazy Loading)</h2>
          <TreeViewLazyExample />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Timeline (Vertical)</h2>
        <TimelineExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Timeline (Horizontal)</h2>
        <TimelineHorizontalExample />
      </div>
    </div>
  );
}
