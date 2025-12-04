import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';

const mockMessage = {
  id: 'msg1',
  content: 'Hello, this is a test message',
  senderId: 'user1',
  conversationId: 'conv1',
  type: 'TEXT' as const,
  createdAt: new Date('2024-01-01T12:00:00Z'),
  updatedAt: new Date('2024-01-01T12:00:00Z'),
  deletedAt: null,
  sender: {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  statuses: [],
};

describe('MessageBubble', () => {
  it('should render message content', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('should display sender name for received messages', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should not display sender name for own messages', () => {
    render(<MessageBubble message={mockMessage} isOwn={true} />);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should display timestamp', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    
    // Should display relative time
    const timeElement = screen.getByText(/ago|just now/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('should apply different styling for own messages', () => {
    const { container } = render(<MessageBubble message={mockMessage} isOwn={true} />);
    
    const bubble = container.firstChild;
    expect(bubble).toHaveClass('justify-end');
  });

  it('should apply different styling for received messages', () => {
    const { container } = render(<MessageBubble message={mockMessage} isOwn={false} />);
    
    const bubble = container.firstChild;
    expect(bubble).toHaveClass('justify-start');
  });

  it('should display read status for own messages', () => {
    const messageWithStatus = {
      ...mockMessage,
      statuses: [
        {
          id: 'status1',
          messageId: 'msg1',
          userId: 'user2',
          status: 'READ' as const,
          readAt: new Date(),
        },
      ],
    };

    render(<MessageBubble message={messageWithStatus} isOwn={true} />);
    
    // Should show read indicator
    const readIndicator = screen.getByTitle(/read/i);
    expect(readIndicator).toBeInTheDocument();
  });
});
