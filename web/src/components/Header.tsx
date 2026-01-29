import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  Brain, 
  Shield, 
  CreditCard, 
  BarChart3,
  Search,
  Plus,
  Clock,
  GitPullRequest,
  Bookmark,
  Bell,
  ChevronDown
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Overview', href: '#' },
  { icon: Building2, label: 'Organizations', href: '#' },
  { icon: Users, label: 'People', href: '#' },
  { icon: Brain, label: 'AI Controls', href: '#' },
  { icon: Shield, label: 'Security', href: '#' },
  { icon: CreditCard, label: 'Billing and licensing', href: '#' },
  { icon: BarChart3, label: 'Insights', href: '/insights/copilot-usage', active: true },
];

export function Header() {
  const location = useLocation();
  const isInsightsActive = location.pathname.startsWith('/insights');

  return (
    <header className="bg-white border-b border-github-border">
      {/* Top bar with org name and actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-github-borderLight">
        <div className="flex items-center gap-2">
          <span className="text-sm text-github-textSecondary">U (Internal)</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-github-bgSecondary border border-github-border rounded-md text-sm text-github-textSecondary">
            <Search size={14} />
            <span>Type</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-github-border rounded text-xs">/</kbd>
            <span>to search</span>
          </div>
          
          {/* Action icons */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors flex items-center gap-1">
              <Brain size={16} />
              <ChevronDown size={12} />
            </button>
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors flex items-center gap-1">
              <Plus size={16} />
              <ChevronDown size={12} />
            </button>
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors">
              <Clock size={16} />
            </button>
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors">
              <GitPullRequest size={16} />
            </button>
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors">
              <Bookmark size={16} />
            </button>
            <button className="p-2 hover:bg-github-bgSecondary rounded-md transition-colors">
              <Bell size={16} />
            </button>
          </div>
          
          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">U</span>
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === 'Insights' ? isInsightsActive : false;
          
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-primary-600 text-github-text'
                  : 'border-transparent text-github-textSecondary hover:text-github-text hover:border-github-border'
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
