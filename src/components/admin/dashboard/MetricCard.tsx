/**
 * MetricCard Component
 *
 * Displays a single metric with an icon, value, label, and optional trend indicator.
 * Used in the admin dashboard to show key performance indicators.
 */

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'gray' | 'purple';
  href?: string;
}

const colorClasses = {
  blue: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  green: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
  },
  gray: {
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
  },
  purple: {
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
  },
};

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  href,
}: MetricCardProps) {
  const colors = colorClasses[color];

  const CardContent = () => (
    <>
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-3 ${colors.iconBg}`}>
          <div className={colors.iconText}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <CardContent />
    </div>
  );
}
