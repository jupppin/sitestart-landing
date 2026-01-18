/**
 * FileCategoryTabs Component
 *
 * Tab navigation to filter files by category.
 * Shows count badges for each category.
 */

'use client';

import type { FileCategory } from '@/types/admin';

interface FileCategoryTabsProps {
  activeCategory: FileCategory | 'ALL';
  categoryCounts: Record<FileCategory | 'ALL', number>;
  onCategoryChange: (category: FileCategory | 'ALL') => void;
}

interface TabConfig {
  id: FileCategory | 'ALL';
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'ALL', label: 'All Files' },
  { id: 'LOGO', label: 'Logos' },
  { id: 'PHOTO', label: 'Photos' },
  { id: 'CONTENT', label: 'Content' },
  { id: 'DOCUMENT', label: 'Documents' },
  { id: 'GENERAL', label: 'General' },
];

export default function FileCategoryTabs({
  activeCategory,
  categoryCounts,
  onCategoryChange,
}: FileCategoryTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="File categories">
        {TABS.map((tab) => {
          const count = categoryCounts[tab.id] || 0;
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`
                    inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium
                    ${isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
