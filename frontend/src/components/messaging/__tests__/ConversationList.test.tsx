import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '../ConversationList';

const mockConversations = [
  {
    id: 'conv1',
    type: 'DIRECT' as const,
    name: null,
    participants: [
      {
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        user: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
    ],
    lastMessage: {
      content: 'Hello there!',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      sender: {
        name: 'John Doe',
      },
    },
    unreadCount: 2,
    updatedAt: new Date('2024-01-01T12:00:00Z'),
  },
  {
    id: 'conv2',
    type: 'GROUP' as const,
    name: 'Team Chat',
    participants: [],
    lastMessage: {
      content: 'Meeting at 3pm',
      createdAt: new Date('2024-01-01T11:00:00Z'),
      sender: {
        name: 'Alice',
      },
    },
    unreadCount: 0,
    updatedAt: new Date('2024-01-01T11:00:00Z'),
  },
];

describe('ConversationList', () => {
  it('should render list of conversations', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Team Chat')).toBeInTheDocument();
  });

  it('should display last message preview', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('Meeting at 3pm')).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call onSelect when conversation is clicked', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    const conversation = screen.getByText('John Doe').closest('button');
    fireEvent.click(conversation!);
    
    expect(mockOnSelect).toHaveBeenCalledWith('conv1');
  });

  it('should highlight selected conversation', () => {
    const mockOnSelect = jest.fn();
    
    const { container } = render(
      <ConversationList
        conversations={mockConversations}
        selectedId="conv1"
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    const selectedConv = screen.getByText('John Doe').closest('button');
    expect(selectedConv).toHaveClass('bg-accent');
  });

  it('should display empty state when no conversations', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={[]}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
  });

  it('should display other participant name for direct conversations', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    // Should show the other participant's name (John Doe), not current user
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should display group name for group conversations', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    expect(screen.getByText('Team Chat')).toBeInTheDocument();
  });

  it('should display timestamp for last message', () => {
    const mockOnSelect = jest.fn();
    
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId={null}
        onSelect={mockOnSelect}
        currentUserId="user2"
      />
    );
    
    // Should display relative time
    const timeElements = screen.getAllByText(/ago|just now/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
