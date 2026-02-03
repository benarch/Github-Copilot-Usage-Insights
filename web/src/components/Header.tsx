import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Bot,
  Trash2,
  Loader2,
  Monitor,
  Code,
  Cpu,
  X
} from 'lucide-react';
import { ChatbotButton } from './Chatbot/ChatbotButton';
import { clearAllData, globalSearch, GlobalSearchResult } from '@/lib/api';
import { useNavCounts } from '@/contexts/NavCountsContext';
import { useImportData } from '@/contexts/ImportDataContext';

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
  { icon: Building2, label: 'Organizations', href: '/organizations' },
  { icon: Users2, label: 'Teams', href: '/teams' },
  { icon: Users, label: 'People', href: '/people' },
  { icon: BarChart3, label: 'Insights', href: '/insights/copilot-usage' },
  { icon: Table2, label: 'Table view', href: '/table-view/summary' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { peopleCount, teamsCount: apiTeamsCount, organizationsCount: apiOrganizationsCount } = useNavCounts();
  const { teams: importedTeams, organizations: importedOrganizations, clearData: clearImportedData } = useImportData();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Use imported counts if available, otherwise fall back to API counts
  const teamsCount = importedTeams.length > 0 ? importedTeams.length : apiTeamsCount;
  const organizationsCount = importedOrganizations.length > 0 ? importedOrganizations.length : apiOrganizationsCount;
  
  const isInsightsActive = location.pathname.startsWith('/insights');
  const isOverviewActive = location.pathname === '/overview';
  const isPeopleActive = location.pathname === '/people';
  const isTableViewActive = location.pathname.startsWith('/table-view');

  // Handle "/" keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await globalSearch(searchQuery);
        const apiResults = result.results;
        
        // Search imported teams
        const query = searchQuery.toLowerCase();
        const teamResults: GlobalSearchResult[] = importedTeams
          .filter(t => t.name.toLowerCase().includes(query) || t.organization.toLowerCase().includes(query))
          .slice(0, 5)
          .map(t => ({
            type: 'team' as const,
            id: t.id,
            name: t.name,
            description: t.organization ? `Organization: ${t.organization} • ${t.memberCount} members` : `${t.memberCount} members`
          }));
        
        // Search imported organizations
        const orgResults: GlobalSearchResult[] = importedOrganizations
          .filter(o => o.name.toLowerCase().includes(query))
          .slice(0, 5)
          .map(o => ({
            type: 'organization' as const,
            id: o.id,
            name: o.name,
            description: `${o.teamsCount} teams • ${o.memberCount} members`
          }));
        
        setSearchResults([...teamResults, ...orgResults, ...apiResults]);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, importedTeams, importedOrganizations]);

  const handleResultClick = (result: GlobalSearchResult) => {
    switch (result.type) {
      case 'person':
        navigate(`/people?search=${encodeURIComponent(result.name)}`);
        break;
      case 'enterprise':
        navigate(`/people?search=${encodeURIComponent(result.id)}`);
        break;
      case 'team':
        navigate(`/teams?search=${encodeURIComponent(result.name)}`);
        break;
      case 'organization':
        navigate(`/organizations?search=${encodeURIComponent(result.name)}`);
        break;
      case 'ide':
      case 'language':
      case 'model':
        // For now, navigate to insights with a filter note
        navigate('/insights/copilot-usage');
        break;
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getResultIcon = (type: GlobalSearchResult['type']) => {
    switch (type) {
      case 'person': return <Users size={16} className="text-blue-500" />;
      case 'enterprise': return <Building2 size={16} className="text-purple-500" />;
      case 'team': return <Users2 size={16} className="text-purple-500" />;
      case 'organization': return <Building2 size={16} className="text-orange-500" />;
      case 'ide': return <Monitor size={16} className="text-green-500" />;
      case 'language': return <Code size={16} className="text-orange-500" />;
      case 'model': return <Cpu size={16} className="text-pink-500" />;
    }
  };

  const getResultTypeLabel = (type: GlobalSearchResult['type']) => {
    switch (type) {
      case 'person': return 'Person';
      case 'enterprise': return 'Enterprise';
      case 'team': return 'Team';
      case 'organization': return 'Organization';
      case 'ide': return 'IDE';
      case 'language': return 'Language';
      case 'model': return 'Model';
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      clearImportedData();
      setShowClearConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-bgSecondary border-b border-github-border dark:border-dark-border transition-colors duration-200">
      {/* Top bar with project name and publisher link */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-github-borderLight dark:border-dark-border">
        <a 
          href="https://github.com/benarch/Github-Copilot-Usage-Extended-Insights" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-github-text dark:text-dark-text hover:underline"
        >
          Go to project repository page
        </a>
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
          <span className="text-sm font-semibold text-github-text dark:text-dark-text">GitHub Copilot Usage Extended Insights</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div ref={searchContainerRef} className="relative">
            {!isSearchOpen ? (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-md text-sm text-github-textSecondary dark:text-dark-textSecondary hover:border-gray-400 dark:hover:border-dark-textSecondary transition-colors"
              >
                <Search size={14} />
                <span>Type</span>
                <kbd className="px-1.5 py-0.5 bg-github-bgSecondary dark:bg-dark-bgTertiary border border-github-border dark:border-dark-border rounded text-xs">/</kbd>
                <span>to search</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-bgSecondary border border-blue-500 rounded-md text-sm min-w-[300px]">
                <Search size={14} className="text-github-textSecondary dark:text-dark-textSecondary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people, IDEs, languages, models..."
                  className="flex-1 bg-transparent text-github-text dark:text-dark-text placeholder-github-textSecondary dark:placeholder-dark-textSecondary focus:outline-none"
                />
                {isSearching ? (
                  <Loader2 size={14} className="animate-spin text-github-textSecondary" />
                ) : (
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                    <X size={14} className="text-github-textSecondary hover:text-github-text dark:hover:text-dark-text" />
                  </button>
                )}
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto min-w-[350px]">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.type}-${result.id}-${idx}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-bgTertiary flex items-center gap-3 border-b border-github-borderLight dark:border-dark-border last:border-0"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-github-text dark:text-dark-text truncate">{result.name}</div>
                      {result.description && (
                        <div className="text-xs text-github-textSecondary dark:text-dark-textSecondary truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-bgTertiary text-github-textSecondary dark:text-dark-textSecondary">
                      {getResultTypeLabel(result.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {isSearchOpen && searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg z-50 p-4 text-sm text-github-textSecondary dark:text-dark-textSecondary min-w-[300px]">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
          
          {/* Action icons */}
          <div className="flex items-center gap-1">
            <ChatbotButton />
            
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

            {/* Clear data button */}
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-200 dark:hover:bg-dark-bgTertiary rounded-md transition-colors text-github-text dark:text-dark-text"
                onClick={() => setShowClearConfirm(true)}
                title="Clear all data"
              >
                <Trash2 size={16} />
              </button>
              {showClearConfirm && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-github-text dark:text-dark-text mb-3">Clear all data? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleClearData}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-dark-bgTertiary text-github-text dark:text-dark-text text-sm rounded-md hover:bg-gray-300 dark:hover:bg-dark-border"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
              : item.label === 'People'
                ? isPeopleActive
                : item.label === 'Table view'
                  ? isTableViewActive
                  : false;
          
          // Get count for specific tabs
          const count = item.label === 'People' ? peopleCount : item.label === 'Teams' ? teamsCount : item.label === 'Organizations' ? organizationsCount : null;
          
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
              {count !== null && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-dark-bgTertiary text-gray-700 dark:text-dark-textSecondary">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
