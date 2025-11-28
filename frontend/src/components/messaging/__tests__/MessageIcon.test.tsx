import { render, screen, fireEvent } from '@testing-library/react';
import { MessageIcon } from '../MessageIcon';

describe('MessageIcon', () => {
  it('should render message icon', () => {
    const mockOnClick = jest.fn();
    render(<MessageIcon onClick={mockOnClick} unreadCount={0} />);
    
    const button = screen.getByRole('button', { name: /messages/i });
    expect(button).toBeInTheDocument();
  });

  it('should display unread count badge when count > 0', () => {
    const mockOnClick = jest.fn();
    render(<MessageIcon onClick={mockOnClick} unreadCount={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not display badge when count is 0', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<MessageIcon onClick={mockOnClick} unreadCount={0} />);
    
    const badge = container.querySelector('[class*="badge"]');
    expect(badge).not.toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<MessageIcon onClick={mockOnClick} unreadCount={0} />);
    
    const button = screen.getByRole('button', { name: /messages/i });
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should display 99+ for counts over 99', () => {
    const mockOnClick = jest.fn();
    render(<MessageIcon onClick={mockOnClick} unreadCount={150} />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
