import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Home, 
  Building2, 
  Users,
  Users2,
  BarChart3,
  Table2,
  Search,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  Bot
} from 'lucide-react';

// GitHub Octocat SVG component
function GitHubLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
    </svg>
  );
}

const navItems = [
  { icon: Home, label: 'Overview', href: '/overview' },
  { icon: Building2, label: 'Organizations', href: '#' },
  { icon: Users2, label: 'Teams', href: '#' },
  { icon: Users, label: 'People', href: '#' },
  { icon: BarChart3, label: 'Insights', href: '/insights/copilot-usage' },
  { icon: Table2, label: 'Table view', href: '/table-view' },
];

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isInsightsActive = location.pathname.startsWith('/insights');
  const isOverviewActive = location.pathname === '/overview';
  const isTableViewActive = location.pathname === '/table-view';

  return (
    <header className="bg-white dark:bg-dark-bgSecondary border-b border-github-border dark:border-dark-border transition-colors duration-200">
      {/* Top bar with project name and publisher link */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-github-borderLight dark:border-dark-border">
        <span className="text-sm font-medium text-github-text dark:text-dark-text">GitHub Copilot Usage Extended Insights</span>
        <a 
          href="https://github.com/benarch" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-github-text dark:text-dark-text hover:underline"
        >
          Go to Publisher's <span className="font-bold">GitHub page</span>
        </a>
      </div>

      {/* GitHub Enterprise style row with Octocat and actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-github-borderLight dark:border-dark-border bg-github-bgSecondary dark:bg-dark-bg">
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-dark-bgTertiary rounded transition-colors text-github-text dark:text-dark-text">
            <Menu size={18} />
          </button>
          <GitHubLogo className="w-8 h-8 text-github-text dark:text-dark-text" />
          <a 
            href="https://github.com/benarch/Github-Copilot-Usage-Extended-Insights" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-semibold text-github-text dark:text-dark-text hover:underline"
          >
            Go to project repository page
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-md text-sm text-github-textSecondary dark:text-dark-textSecondary">
            <Search size={14} />
            <span>Type</span>
            <kbd className="px-1.5 py-0.5 bg-github-bgSecondary dark:bg-dark-bgTertiary border border-github-border dark:border-dark-border rounded text-xs">/</kbd>
            <span>to search</span>
          </div>
          
          {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* Chatbot icon */}
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-dark-bgTertiary rounded-md transition-colors text-github-text dark:text-dark-text" title="Open Chatbot">
              <Bot size={20} />
            </button>
            
            {/* Dark/Light mode toggle */}
            <button 
              className="p-2 hover:bg-gray-200 dark:hover:bg-dark-bgTertiary rounded-md transition-colors text-github-text dark:text-dark-text"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            {/* Help/About version popup */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-dark-bgTertiary rounded-md transition-colors text-github-text dark:text-dark-text">
                <HelpCircle size={16} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg dark:shadow-dark-dropdown p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <h4 className="text-sm font-semibold text-github-text dark:text-dark-text mb-2">About</h4>
                <div className="space-y-1.5 text-xs text-github-textSecondary dark:text-dark-textSecondary">
                  <p><span className="font-medium">Version:</span> 1.0.0</p>
                  <p><span className="font-medium">Last Updated:</span> January 29, 2026</p>
                  <p className="pt-2 border-t border-github-borderLight dark:border-dark-border">
                    © 2026{' '}
                    <a 
                      href="https://www.linkedin.com/in/bendali/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      Ben Dali
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* User avatar */}
          <div className="w-9 h-9 rounded-full border-2 border-github-border dark:border-dark-border p-0.5 cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all">
            <img 
              src="https://octodex.github.com/images/daftpunktocat-thomas.gif" 
              alt="User avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 px-4 dark:bg-dark-bgSecondary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === 'Insights' 
            ? isInsightsActive 
            : item.label === 'Overview' 
              ? isOverviewActive 
              : item.label === 'Table view'
                ? isTableViewActive
                : false;
          
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-primary-600 text-github-text dark:text-dark-text'
                  : 'border-transparent text-github-textSecondary dark:text-dark-textSecondary hover:text-github-text dark:hover:text-dark-text hover:border-github-border dark:hover:border-dark-border'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
