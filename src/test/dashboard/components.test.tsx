/**
 * @vitest-environment happy-dom
 *
 * Tests for Dashboard Components
 *
 * Tests the MetricCard and RecentActivityList components.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/admin/dashboard/MetricCard';
import RecentActivityList from '@/components/admin/dashboard/RecentActivityList';
import StatusBadge from '@/components/admin/shared/StatusBadge';

describe('MetricCard Component', () => {
  const mockIcon = (
    <svg data-testid="test-icon" className="h-6 w-6">
      <path d="M0 0h24v24H0z" />
    </svg>
  );

  it('renders label and value correctly', () => {
    render(
      <MetricCard
        label="Total Leads"
        value={42}
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(
      <MetricCard
        label="Revenue"
        value="$10,000"
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(
      <MetricCard
        label="Test"
        value={0}
        icon={mockIcon}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders positive trend indicator', () => {
    render(
      <MetricCard
        label="Growth"
        value="15%"
        icon={mockIcon}
        trend={{ value: 10, isPositive: true }}
      />
    );

    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('renders negative trend indicator', () => {
    render(
      <MetricCard
        label="Decline"
        value="8%"
        icon={mockIcon}
        trend={{ value: 5, isPositive: false }}
      />
    );

    // Value displays "8%" and trend displays "5%"
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    render(
      <MetricCard
        label="Clickable"
        value={10}
        icon={mockIcon}
        href="/admin/leads"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/admin/leads');
  });

  it('renders without link when href is not provided', () => {
    render(
      <MetricCard
        label="Not Clickable"
        value={10}
        icon={mockIcon}
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('StatusBadge Component', () => {
  it('renders NEW status correctly', () => {
    render(<StatusBadge status="NEW" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders CONTACTED status correctly', () => {
    render(<StatusBadge status="CONTACTED" />);
    expect(screen.getByText('Contacted')).toBeInTheDocument();
  });

  it('renders PAID status correctly', () => {
    render(<StatusBadge status="PAID" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('applies correct styling for NEW status', () => {
    render(<StatusBadge status="NEW" />);
    const badge = screen.getByText('New');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-700');
  });

  it('applies correct styling for CONTACTED status', () => {
    render(<StatusBadge status="CONTACTED" />);
    const badge = screen.getByText('Contacted');
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-700');
  });

  it('applies correct styling for PAID status', () => {
    render(<StatusBadge status="PAID" />);
    const badge = screen.getByText('Paid');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('renders small size correctly', () => {
    render(<StatusBadge status="NEW" size="sm" />);
    const badge = screen.getByText('New');
    expect(badge.className).toContain('text-xs');
  });

  it('renders medium size correctly', () => {
    render(<StatusBadge status="NEW" size="md" />);
    const badge = screen.getByText('New');
    expect(badge.className).toContain('text-sm');
  });
});

describe('RecentActivityList Component', () => {
  const mockActivities = [
    {
      id: 1,
      type: 'submission' as const,
      description: 'New submission from Test Business',
      businessName: 'Test Business',
      timestamp: new Date('2026-01-15T10:00:00'),
      status: 'NEW' as const,
    },
    {
      id: 2,
      type: 'status_change' as const,
      description: 'Another Business marked as contacted',
      businessName: 'Another Business',
      timestamp: new Date('2026-01-14T15:30:00'),
      status: 'CONTACTED' as const,
    },
    {
      id: 3,
      type: 'payment' as const,
      description: 'Payment received from Paying Business - $5,000',
      businessName: 'Paying Business',
      timestamp: new Date('2026-01-13T09:00:00'),
      status: 'PAID' as const,
    },
  ];

  it('renders activity items', () => {
    render(<RecentActivityList activities={mockActivities} />);

    expect(screen.getByText('New submission from Test Business')).toBeInTheDocument();
    expect(screen.getByText('Another Business marked as contacted')).toBeInTheDocument();
    expect(screen.getByText('Payment received from Paying Business - $5,000')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<RecentActivityList activities={mockActivities} />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders empty state when no activities', () => {
    render(<RecentActivityList activities={[]} />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<RecentActivityList activities={[]} isLoading={true} />);
    // Loading skeleton should be present
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders status badges for each activity', () => {
    render(<RecentActivityList activities={mockActivities} />);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders links to lead detail pages', () => {
    render(<RecentActivityList activities={mockActivities} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/admin/leads/1');
    expect(links[1]).toHaveAttribute('href', '/admin/leads/2');
    expect(links[2]).toHaveAttribute('href', '/admin/leads/3');
  });
});
