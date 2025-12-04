import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../MessageInput';

describe('MessageInput', () => {
  it('should render textarea and send button', () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('should call onSend when send button is clicked', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('should clear input after sending', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(textarea.value).toBe('');
  });

  it('should call onTyping when user types', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend=  {mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'H');
    
    await waitFor(() => {
      expect(mockOnTyping).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should send message on Enter key', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello{Enter}');
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('should add new line on Shift+Enter', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}World');
    
    expect(textarea.value).toContain('\n');
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should display character count', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} maxLength={100} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    
    expect(screen.getByText(/5.*100/)).toBeInTheDocument();
  });

  it('should show warning when approaching character limit', async () => {
    const mockOnSend = jest.fn();
    const mockOnTyping = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} maxLength={100} />);
    
    const textarea = screen.getByPlaceholderText(/type a message/i);
    const longText = 'a'.repeat(95);
    await user.type(textarea, longText);
    
    const charCount = screen.getByText(/95.*100/);
    expect(charCount).toHaveClass('text-destructive');
  });
});
