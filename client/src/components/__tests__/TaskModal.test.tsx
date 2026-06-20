import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskModal from '../modals/task-modal';

describe('TaskModal', () => {
  it('should render task form when open', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );

    expect(screen.getByText(/add task/i)).toBeInTheDocument();
  });

  it('should validate required fields before submission', async () => {
    const mockOnSave = vi.fn();

    render(
      <TaskModal 
        isOpen={true} 
        onClose={vi.fn()} 
        onSave={mockOnSave} 
      />
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    // Should not call onSave without required fields
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={vi.fn()} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
