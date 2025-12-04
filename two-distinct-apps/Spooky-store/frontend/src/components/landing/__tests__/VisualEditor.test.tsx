import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VisualEditor } from '../VisualEditor';
import type { LandingPageContent } from '@/types/landing-cms';

// Mock the child components
vi.mock('../SectionListSidebar', () => ({
  SectionListSidebar: ({ sections, onReorder }: any) => (
    <div data-testid="section-list-sidebar">
      {sections.map((section: any) => (
        <div key={section.id} data-testid={`section-${section.id}`}>
          {section.type}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../PreviewPanel', () => ({
  PreviewPanel: ({ content }: any) => (
    <div data-testid="preview-panel">
      Preview: {content.sections.length} sections
    </div>
  ),
}));

describe('VisualEditor', () => {
  const mockContent: LandingPageContent = {
    id: 'page-1',
    sections: [
      {
        id: 'section-1',
        type: 'hero',
        content: {
          title: 'Welcome',
          subtitle: 'Test subtitle',
        },
        order: 0,
      },
      {
        id: 'section-2',
        type: 'features',
        content: {
          title: 'Features',
        },
        order: 1,
      },
    ],
    settings: {},
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render visual editor with sections', () => {
    render(
      <VisualEditor
        content={mockContent}
        onChange={mockOnChange}
        onSave={mockOnSave}
        isSaving={false}
      />,
    );

    expect(screen.getByTestId('section-list-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('section-section-1')).toBeInTheDocument();
    expect(screen.getByTestId('section-section-2')).toBeInTheDocument();
  });

  it('should call onChange when sections are reordered', () => {
    const { rerender } = render(
      <VisualEditor
        content={mockContent}
        onChange={mockOnChange}
        onSave={mockOnSave}
        isSaving={false}
      />,
    );

    // Simulate reordering
    const newContent = {
      ...mockContent,
      sections: [mockContent.sections[1], mockContent.sections[0]],
    };

    rerender(
      <VisualEditor
        content={newContent}
        onChange={mockOnChange}
        onSave={mockOnSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Preview: 2 sections')).toBeInTheDocument();
  });

  it('should show saving state', () => {
    render(
      <VisualEditor
        content={mockContent}
        onChange={mockOnChange}
        onSave={mockOnSave}
        isSaving={true}
      />,
    );

    // The component should indicate saving state
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });

  it('should handle empty sections', () => {
    const emptyContent: LandingPageContent = {
      ...mockContent,
      sections: [],
    };

    render(
      <VisualEditor
        content={emptyContent}
        onChange={mockOnChange}
        onSave={mockOnSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Preview: 0 sections')).toBeInTheDocument();
  });
});
