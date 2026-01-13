'use client';

import { Globe, User } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: {
    posts: number;
  };
}

interface ForumNavigationProps {
  activeTab: 'all' | 'my';
  onTabChange: (tab: 'all' | 'my') => void;
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: ForumCategory[];
  totalPosts: number;
  showAllCategories: boolean;
  onToggleShowAllCategories: () => void;
}

export function ForumNavigation({
  activeTab,
  onTabChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
  totalPosts,
  showAllCategories,
  onToggleShowAllCategories,
}: ForumNavigationProps): JSX.Element {
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Primary Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('all')}
            className={`tab-underline ${
              activeTab === 'all' ? 'active' : ''
            } text-base font-semibold pb-2 flex items-center gap-2 transition-colors`}
            style={{
              color: activeTab === 'all' 
                ? 'rgb(17, 24, 39)' 
                : 'rgb(107, 114, 128)'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'all') {
                e.currentTarget.style.color = 'rgb(55, 65, 81)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'all') {
                e.currentTarget.style.color = 'rgb(107, 114, 128)';
              }
            }}
          >
            <Globe 
              className={`w-5 h-5 ${
                activeTab === 'all' ? 'text-blue-500' : ''
              }`} 
            />
            <span 
              className={
                activeTab === 'all' 
                  ? 'text-gray-900 dark:text-gray-50' 
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              All Posts
            </span>
          </button>

          <button
            onClick={() => onTabChange('my')}
            className={`tab-underline ${
              activeTab === 'my' ? 'active' : ''
            } text-base font-semibold pb-2 flex items-center gap-2 transition-colors`}
            style={{
              color: activeTab === 'my' 
                ? 'rgb(17, 24, 39)' 
                : 'rgb(107, 114, 128)'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'my') {
                e.currentTarget.style.color = 'rgb(55, 65, 81)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'my') {
                e.currentTarget.style.color = 'rgb(107, 114, 128)';
              }
            }}
          >
            <User 
              className={`w-5 h-5 ${
                activeTab === 'my' ? 'text-blue-500' : ''
              }`} 
            />
            <span 
              className={
                activeTab === 'my' 
                  ? 'text-gray-900 dark:text-gray-50' 
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              My Posts
            </span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap sm:flex-wrap sm:overflow-visible pb-2">
        {/* All Categories Pill */}
        <button
          onClick={() => onCategoryChange('')}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors flex items-center flex-shrink-0 ${
            selectedCategoryId === ''
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-900'
              : 'bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer'
          }`}
        >
          All
          {selectedCategoryId === '' && (
            <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1">
              {totalPosts}
            </span>
          )}
          {selectedCategoryId !== '' && totalPosts > 0 && (
            <span className="ml-1 text-[10px]">
              {totalPosts}
            </span>
          )}
        </button>

        {/* Individual Category Pills */}
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors flex items-center flex-shrink-0 ${
              selectedCategoryId === category.id
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-900'
                : 'bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer'
            }`}
          >
            {category.name}
            {selectedCategoryId === category.id && (
              <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                {category._count.posts}
              </span>
            )}
            {selectedCategoryId !== category.id && category._count.posts > 0 && (
              <span className="ml-1 text-[10px]">
                {category._count.posts}
              </span>
            )}
          </button>
        ))}

        {/* Show More/Less Toggle */}
        {categories.length > 6 && (
          <button
            onClick={onToggleShowAllCategories}
            className="text-gray-400 dark:text-gray-500 text-xs hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            {showAllCategories ? 'Show less' : `+${categories.length - 6} more`}
          </button>
        )}
      </div>
    </div>
  );
}
