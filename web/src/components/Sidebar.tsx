import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Code2, FileText, Table, Users, Users2, Building2, User } from 'lucide-react';

const insightsSidebarItems = [
  { icon: BarChart3, label: 'Copilot usage', href: '/insights/copilot-usage' },
  { icon: Code2, label: 'Code generation', href: '/insights/code-generation' },
];

const tableViewSidebarItems = [
  { icon: FileText, label: 'Summary Report', href: '/table-view/summary' },
  { icon: Table, label: 'Detailed Report', href: '/table-view/detailed' },
  { icon: Users2, label: 'Teams View', href: '/table-view/teams' },
];

const peopleSidebarItems = [
  { icon: Users, label: 'All Members', href: '/people' },
];

const teamsSidebarItems = [
  { icon: Users2, label: 'All Teams', href: '/teams' },
  { icon: User, label: 'All Users in Teams', href: '/teams/users' },
];

const organizationsSidebarItems = [
  { icon: Building2, label: 'All Organizations', href: '/organizations' },
];

export function Sidebar() {
  const location = useLocation();
  
  // Determine which sidebar to show based on current route
  const isTableView = location.pathname.startsWith('/table-view');
  const isPeople = location.pathname === '/people';
  const isTeams = location.pathname.startsWith('/teams');
  const isOrganizations = location.pathname === '/organizations';
  
  let sidebarItems = insightsSidebarItems;
  let sectionTitle = 'Insights';
  
  if (isTableView) {
    sidebarItems = tableViewSidebarItems;
    sectionTitle = 'Reports';
  } else if (isPeople) {
    sidebarItems = peopleSidebarItems;
    sectionTitle = 'People';
  } else if (isTeams) {
    sidebarItems = teamsSidebarItems;
    sectionTitle = 'Teams';
  } else if (isOrganizations) {
    sidebarItems = organizationsSidebarItems;
    sectionTitle = 'Organizations';
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white dark:bg-dark-bgSecondary border-r border-github-border dark:border-dark-border min-h-[calc(100vh-105px)] transition-colors duration-200">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-github-text dark:text-dark-text mb-3">{sectionTitle}</h2>
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-github-bgSecondary dark:bg-dark-bgTertiary text-github-text dark:text-dark-text font-medium'
                    : 'text-github-textSecondary dark:text-dark-textSecondary hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary hover:text-github-text dark:hover:text-dark-text'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
