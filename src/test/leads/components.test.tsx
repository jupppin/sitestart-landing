/**
 * @vitest-environment happy-dom
 *
 * Tests for Lead Tracker Components
 *
 * Tests the DataTable, SearchFilter, Pagination, LeadStatusActions, and NotesEditor components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/components/admin/shared/DataTable';
import SearchFilter from '@/components/admin/shared/SearchFilter';
import Pagination from '@/components/admin/shared/Pagination';
import LeadStatusActions from '@/components/admin/leads/LeadStatusActions';
import NotesEditor from '@/components/admin/leads/NotesEditor';

// Mock data for testing
interface TestItem {
  id: number;
  name: string;
  email: string;
}

const mockData: TestItem[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
];

describe('DataTable Component', () => {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ];

  it('renders table headers correctly', () => {
    render(
      <DataTable
        columns={columns}
        data={mockData}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows correctly', () => {
    render(
      <DataTable
        columns={columns}
        data={mockData}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(item: TestItem) => item.id}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(item: TestItem) => item.id}
        isLoading={true}
      />
    );

    // Loading skeleton should have animate-pulse class
    const tbody = document.querySelector('tbody');
    const loadingRow = tbody?.querySelector('tr');
    expect(loadingRow?.classList.contains('animate-pulse')).toBe(true);
  });

  it('handles row click', async () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={mockData}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
      />
    );

    const row = screen.getByText('John Doe').closest('tr');
    if (row) {
      await userEvent.click(row);
    }

    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('renders custom column content', () => {
    const customColumns = [
      {
        key: 'name',
        header: 'Name',
        render: (item: TestItem) => <strong data-testid="custom-name">{item.name}</strong>,
      },
    ];

    render(
      <DataTable
        columns={customColumns}
        data={mockData}
        keyExtractor={(item) => item.id}
      />
    );

    // Should find multiple custom-name testids (one per row)
    const customNames = screen.getAllByTestId('custom-name');
    expect(customNames).toHaveLength(3);
  });

  it('applies row className function', () => {
    render(
      <DataTable
        columns={columns}
        data={mockData}
        keyExtractor={(item) => item.id}
        rowClassName={(item) => (item.id === 1 ? 'highlight' : '')}
      />
    );

    const row = screen.getByText('John Doe').closest('tr');
    expect(row?.classList.contains('highlight')).toBe(true);
  });
});

describe('SearchFilter Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input', () => {
    render(<SearchFilter value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(
      <SearchFilter value="" onChange={() => {}} placeholder="Search leads..." />
    );
    expect(screen.getByPlaceholderText('Search leads...')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    render(<SearchFilter value="test query" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onChange with debounce', async () => {
    const handleChange = vi.fn();
    render(
      <SearchFilter value="" onChange={handleChange} debounceMs={300} />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not be called immediately
    expect(handleChange).not.toHaveBeenCalled();

    // Fast forward past debounce time
    vi.advanceTimersByTime(300);

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('calls onChange immediately on Enter', () => {
    const handleChange = vi.fn();
    render(<SearchFilter value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when value is present', () => {
    render(<SearchFilter value="test" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchFilter value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears value when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<SearchFilter value="test" onChange={handleChange} />);

    // Use fireEvent instead of userEvent since we're using fake timers
    fireEvent.click(screen.getByLabelText('Clear search'));

    expect(handleChange).toHaveBeenCalledWith('');
  });
});

describe('Pagination Component', () => {
  it('renders pagination controls', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    // Check that page button 1 exists and is the current page
    const nav = screen.getByRole('navigation');
    const pageOneButton = within(nav).getByRole('button', { name: '1' });
    expect(pageOneButton).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('displays correct results info', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    // Look for the results text containing the numbers
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    // Check that the results info contains the correct numbers
    const resultsInfo = screen.getByText(/Showing/).closest('p');
    expect(resultsInfo).toHaveTextContent('11');
    expect(resultsInfo).toHaveTextContent('20');
    expect(resultsInfo).toHaveTextContent('50');
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange when clicking page number', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={handlePageChange}
      />
    );

    await userEvent.click(screen.getByText('3'));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking next', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={handlePageChange}
      />
    );

    await userEvent.click(screen.getByLabelText('Next page'));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('returns null when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('highlights current page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    const currentPageButton = screen.getByText('3');
    expect(currentPageButton.classList.contains('bg-blue-600')).toBe(true);
  });
});

describe('LeadStatusActions Component', () => {
  it('shows correct buttons for NEW status', () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={async () => {}}
      />
    );

    expect(screen.getByText('Mark as Contacted')).toBeInTheDocument();
    expect(screen.getByText('Mark as Paid')).toBeInTheDocument();
  });

  it('shows correct buttons for CONTACTED status', () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="CONTACTED"
        onStatusChange={async () => {}}
      />
    );

    expect(screen.queryByText('Mark as Contacted')).not.toBeInTheDocument();
    expect(screen.getByText('Mark as Paid')).toBeInTheDocument();
  });

  it('shows message for PAID status', () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="PAID"
        onStatusChange={async () => {}}
      />
    );

    expect(screen.getByText('This lead has been converted to a customer.')).toBeInTheDocument();
  });

  it('calls onStatusChange when clicking Mark as Contacted', async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={handleStatusChange}
      />
    );

    await userEvent.click(screen.getByText('Mark as Contacted'));

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith('CONTACTED');
    });
  });

  it('shows revenue modal when clicking Mark as Paid', async () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={async () => {}}
      />
    );

    await userEvent.click(screen.getByText('Mark as Paid'));

    expect(screen.getByText('Enter Payment Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Revenue Amount ($)')).toBeInTheDocument();
  });

  it('calls onStatusChange with revenue when submitting payment', async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={handleStatusChange}
      />
    );

    // Open modal
    await userEvent.click(screen.getByText('Mark as Paid'));

    // Enter revenue
    const input = screen.getByLabelText('Revenue Amount ($)');
    await userEvent.type(input, '1500');

    // Submit
    await userEvent.click(screen.getAllByText('Mark as Paid')[1]); // Modal button

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith('PAID', 1500);
    });
  });

  it('closes modal when clicking Cancel', async () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={async () => {}}
      />
    );

    // Open modal
    await userEvent.click(screen.getByText('Mark as Paid'));
    expect(screen.getByText('Enter Payment Amount')).toBeInTheDocument();

    // Cancel
    await userEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Enter Payment Amount')).not.toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <LeadStatusActions
        leadId={1}
        currentStatus="NEW"
        onStatusChange={async () => {}}
        disabled={true}
      />
    );

    expect(screen.getByText('Mark as Contacted')).toBeDisabled();
    expect(screen.getByText('Mark as Paid')).toBeDisabled();
  });
});

describe('NotesEditor Component', () => {
  it('renders textarea with initial notes', () => {
    render(
      <NotesEditor
        leadId={1}
        initialNotes="Initial notes content"
        onSave={async () => {}}
      />
    );

    expect(screen.getByDisplayValue('Initial notes content')).toBeInTheDocument();
  });

  it('renders empty textarea when no initial notes', () => {
    render(
      <NotesEditor
        leadId={1}
        initialNotes={null}
        onSave={async () => {}}
      />
    );

    expect(screen.getByPlaceholderText('Add notes about this lead...')).toBeInTheDocument();
  });

  it('shows unsaved changes indicator when modified', async () => {
    render(
      <NotesEditor
        leadId={1}
        initialNotes=""
        onSave={async () => {}}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'New note');

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('calls onSave when clicking Save Notes button', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <NotesEditor
        leadId={1}
        initialNotes=""
        onSave={handleSave}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'New note');

    await userEvent.click(screen.getByText('Save Notes'));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith('New note');
    });
  });

  it('shows saved indicator after successful save', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <NotesEditor
        leadId={1}
        initialNotes=""
        onSave={handleSave}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'New note');
    await userEvent.click(screen.getByText('Save Notes'));

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('shows error indicator on save failure', async () => {
    const handleSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    render(
      <NotesEditor
        leadId={1}
        initialNotes=""
        onSave={handleSave}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'New note');
    await userEvent.click(screen.getByText('Save Notes'));

    await waitFor(() => {
      expect(screen.getByText('Error saving')).toBeInTheDocument();
    });
  });

  it('disables Save Notes button when no changes', () => {
    render(
      <NotesEditor
        leadId={1}
        initialNotes="Initial notes"
        onSave={async () => {}}
      />
    );

    expect(screen.getByText('Save Notes')).toBeDisabled();
  });

  it('disables textarea when disabled prop is true', () => {
    render(
      <NotesEditor
        leadId={1}
        initialNotes=""
        onSave={async () => {}}
        disabled={true}
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
