/**
 * RevenueDisplay Component
 *
 * Displays revenue amounts with proper currency formatting.
 * Supports various sizes and optional highlighting for significant amounts.
 */

interface RevenueDisplayProps {
  amount: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showCents?: boolean;
  className?: string;
  emptyText?: string;
}

/**
 * Format a number as USD currency
 */
function formatCurrency(
  amount: number,
  showCents: boolean = true
): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  };

  return new Intl.NumberFormat('en-US', options).format(amount);
}

export default function RevenueDisplay({
  amount,
  size = 'md',
  showCents = true,
  className = '',
  emptyText = '--',
}: RevenueDisplayProps) {
  // Handle null/undefined amounts
  if (amount === null || amount === undefined) {
    return (
      <span className={`text-gray-400 ${className}`} aria-label="No revenue">
        {emptyText}
      </span>
    );
  }

  // Size-based styling
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  // Color based on amount (positive = green tone for customers)
  const colorClass = amount > 0 ? 'text-green-700' : 'text-gray-700';

  const formattedAmount = formatCurrency(amount, showCents);

  return (
    <span
      className={`${sizeClasses[size]} ${colorClass} ${className}`}
      aria-label={`Revenue: ${formattedAmount}`}
    >
      {formattedAmount}
    </span>
  );
}

/**
 * Utility function to format currency outside of React components
 * Exported for use in other components or utilities
 */
export { formatCurrency };
