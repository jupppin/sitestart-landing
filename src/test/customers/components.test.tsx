/**
 * @vitest-environment happy-dom
 *
 * Tests for Customer Tracker Components
 *
 * Tests the RevenueDisplay and CustomerList components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RevenueDisplay, { formatCurrency } from '@/components/admin/customers/RevenueDisplay';
import CustomerList from '@/components/admin/customers/CustomerList';
import type { Submission } from '@/lib/admin/queries';
import type { PaginatedResponse } from '@/types/admin';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock customer data
const mockCustomers: Submission[] = [
  {
    id: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-10'),
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    businessName: 'Doe Industries',
    industryType: 'restaurant',
    currentWebsite: 'https://doe.com',
    hasNoWebsite: false,
    features: '["Contact Form", "Menu Display"]',
    otherFeatures: null,
    budgetRange: '$1,000 - $2,500',
    timeline: 'Within 1 month',
    additionalInfo: null,
    status: 'PAID',
    contacted: true,
    notes: 'Great customer!',
    paidAt: new Date('2026-01-10'),
    revenue: 2500,
  },
  {
    id: 2,
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-15'),
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: null,
    businessName: 'Smith Co',
    industryType: 'retail',
    currentWebsite: null,
    hasNoWebsite: true,
    features: '["E-commerce"]',
    otherFeatures: 'Inventory management',
    budgetRange: '$5,000 - $10,000',
    timeline: 'Within 3 months',
    additionalInfo: 'Need integration with POS',
    status: 'PAID',
    contacted: true,
    notes: null,
    paidAt: new Date('2026-01-15'),
    revenue: 7500,
  },
];

const mockPaginatedData: PaginatedResponse<Submission> = {
  items: mockCustomers,
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('RevenueDisplay Component', () => {
  describe('formatCurrency utility', () => {
    it('formats a positive number as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats zero as USD currency', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats large numbers with thousands separators', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('formats without cents when showCents is false', () => {
      expect(formatCurrency(1234.56, false)).toBe('$1,235');
    });

    it('rounds correctly when showCents is false', () => {
      expect(formatCurrency(1234.49, false)).toBe('$1,234');
    });
  });

  describe('RevenueDisplay rendering', () => {
    it('displays formatted currency for positive amount', () => {
      render(<RevenueDisplay amount={2500} />);
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });

    it('displays empty text for null amount', () => {
      render(<RevenueDisplay amount={null} />);
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('displays empty text for undefined amount', () => {
      render(<RevenueDisplay amount={undefined} />);
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('displays custom empty text when provided', () => {
      render(<RevenueDisplay amount={null} emptyText="N/A" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('applies small size class', () => {
      const { container } = render(<RevenueDisplay amount={100} size="sm" />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('text-sm')).toBe(true);
    });

    it('applies medium size class by default', () => {
      const { container } = render(<RevenueDisplay amount={100} />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('text-base')).toBe(true);
    });

    it('applies large size class', () => {
      const { container } = render(<RevenueDisplay amount={100} size="lg" />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('text-lg')).toBe(true);
      expect(span?.classList.contains('font-semibold')).toBe(true);
    });

    it('applies green color for positive amounts', () => {
      const { container } = render(<RevenueDisplay amount={100} />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('text-green-700')).toBe(true);
    });

    it('applies gray color for zero amounts', () => {
      const { container } = render(<RevenueDisplay amount={0} />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('text-gray-700')).toBe(true);
    });

    it('hides cents when showCents is false', () => {
      render(<RevenueDisplay amount={2500.75} showCents={false} />);
      expect(screen.getByText('$2,501')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<RevenueDisplay amount={100} className="my-custom-class" />);
      const span = container.querySelector('span');
      expect(span?.classList.contains('my-custom-class')).toBe(true);
    });

    it('has correct aria-label for amount', () => {
      render(<RevenueDisplay amount={1500} />);
      expect(screen.getByLabelText('Revenue: $1,500.00')).toBeInTheDocument();
    });

    it('has correct aria-label for no revenue', () => {
      render(<RevenueDisplay amount={null} />);
      expect(screen.getByLabelText('No revenue')).toBeInTheDocument();
    });
  });
});

describe('CustomerList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock for fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockPaginatedData }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with initial data and fetches on mount', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays customer business names', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Doe Industries')).toBeInTheDocument();
      expect(screen.getByText('Smith Co')).toBeInTheDocument();
    });
  });

  it('displays customer emails', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('displays customer industries', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('restaurant')).toBeInTheDocument();
      expect(screen.getByText('retail')).toBeInTheDocument();
    });
  });

  it('displays revenue amounts', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
      expect(screen.getByText('$7,500.00')).toBeInTheDocument();
    });
  });

  it('displays total customers count', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('2 customers')).toBeInTheDocument();
    });
  });

  it('displays singular customer count', async () => {
    const singleCustomerData: PaginatedResponse<Submission> = {
      items: [mockCustomers[0]],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleCustomerData }),
    });

    await act(async () => {
      render(<CustomerList initialData={singleCustomerData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('1 customer')).toBeInTheDocument();
    });
  });

  it('displays page total revenue', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Page Total:')).toBeInTheDocument();
    });
  });

  it('displays search input', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });

  it('renders empty state when no customers', async () => {
    const emptyData: PaginatedResponse<Submission> = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: emptyData }),
    });

    await act(async () => {
      render(<CustomerList initialData={emptyData} />);
    });

    await waitFor(() => {
      expect(
        screen.getByText('No customers found. Customers will appear here when leads are marked as paid.')
      ).toBeInTheDocument();
    });
  });

  it('fetches data on mount when no initial data', async () => {
    await act(async () => {
      render(<CustomerList />);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/submissions')
      );
    });
  });

  it('includes PAID status filter in API request', async () => {
    await act(async () => {
      render(<CustomerList />);
    });

    await waitFor(() => {
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('status=PAID');
    });
  });

  it('handles search input change', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    const searchInput = screen.getByPlaceholderText('Search customers...');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'John' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    await waitFor(() => {
      // Find the call that includes the search param
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      const searchCall = calls.find((call: string[]) => call[0].includes('search=John'));
      expect(searchCall).toBeDefined();
    });
  });

  it('displays error message on fetch failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'Failed to fetch' }),
    });

    await act(async () => {
      render(<CustomerList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'Failed to fetch' }),
    });

    await act(async () => {
      render(<CustomerList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('retries fetch when clicking retry button', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false, error: 'Failed to fetch' }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockPaginatedData }),
      });

    await act(async () => {
      render(<CustomerList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.click(screen.getByText('Retry'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('renders loading skeleton when loading', async () => {
    // Never resolve to keep loading state
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));

    render(<CustomerList />);

    // Loading state should show skeleton with animate-pulse
    const tbody = document.querySelector('tbody');
    const loadingRow = tbody?.querySelector('tr');
    expect(loadingRow?.classList.contains('animate-pulse')).toBe(true);
  });

  it('displays phone number when available', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      expect(screen.getByText('555-1234')).toBeInTheDocument();
    });
  });

  it('applies green background to customer rows', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      const row = screen.getByText('John Doe').closest('tr');
      expect(row?.classList.contains('bg-green-50/20')).toBe(true);
    });
  });

  it('displays formatted paid date', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      // Date should be formatted - check for the presence of date elements
      // The format is "Jan 10, 2026" but may vary based on locale
      const dateElements = document.querySelectorAll('.text-gray-700');
      const dateTexts = Array.from(dateElements).map(el => el.textContent);
      // Should have dates rendered (not just "--" placeholder)
      expect(dateTexts.some(text => text && text.includes('2026'))).toBe(true);
    });
  });
});

describe('CustomerList Table Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockPaginatedData }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders table headers', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Paid Date')).toBeInTheDocument();
  });

  it('renders correct number of rows', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      const tbody = document.querySelector('tbody');
      // Get non-loading rows (those without animate-pulse)
      const rows = tbody?.querySelectorAll('tr:not(.animate-pulse)');
      expect(rows?.length).toBe(2);
    });
  });

  it('renders arrow icon for navigation', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    await waitFor(() => {
      // Each row should have an SVG chevron arrow
      const tbody = document.querySelector('tbody');
      const arrows = tbody?.querySelectorAll('svg');
      expect(arrows?.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('CustomerList Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockPaginatedData }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render pagination when only one page', async () => {
    await act(async () => {
      render(<CustomerList initialData={mockPaginatedData} />);
    });

    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
  });

  it('renders pagination when multiple pages', async () => {
    const multiPageData: PaginatedResponse<Submission> = {
      ...mockPaginatedData,
      total: 25,
      totalPages: 3,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: multiPageData }),
    });

    await act(async () => {
      render(<CustomerList initialData={multiPageData} />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
  });

  it('handles page change', async () => {
    const multiPageData: PaginatedResponse<Submission> = {
      ...mockPaginatedData,
      total: 25,
      totalPages: 3,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: multiPageData }),
    });

    await act(async () => {
      render(<CustomerList initialData={multiPageData} />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.click(screen.getByLabelText('Next page'));
    });

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      const pageCall = calls.find((call: string[]) => call[0].includes('page=2'));
      expect(pageCall).toBeDefined();
    });
  });
});
