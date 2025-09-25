import React from "react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onCategoryFilter?: (category: string | null) => void;
  selectedCategory?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchQuery = "",
  onCategoryFilter,
  selectedCategory,
}) => {
  const categories = [
    "Technology",
    "Business",
    "Politics",
    "World",
    "Science",
    "Health",
    "Sports",
    "Entertainment",
  ];
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 text-white shadow-premium dark:bg-gradient-to-r dark:from-[#0f172a] dark:via-[#0b1120] dark:to-[#020617]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-secondary-100 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                News AI
              </h1>
              <p className="text-secondary-300 dark:text-slate-400 text-sm hidden md:block">
                AI-powered news insights
              </p>
            </div>
          </div>

          {/* Category Filters - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onCategoryFilter?.(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-secondary-200 hover:text-white hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryFilter?.(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-secondary-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar - Compact */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-secondary-500 dark:text-dark-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-9 py-2 bg-white dark:bg-dark-secondary-700 border border-secondary-200 dark:border-dark-secondary-600 rounded-lg text-secondary-900 dark:text-dark-secondary-100 placeholder-secondary-500 dark:placeholder-dark-secondary-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-dark-secondary-600 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch?.("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-500 dark:text-dark-secondary-200 hover:text-secondary-700 dark:hover:text-white transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
