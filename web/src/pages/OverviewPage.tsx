import { 
  BarChart3, 
  Users, 
  Upload, 
  Search, 
  Trash2, 
  Bot, 
  Moon, 
  Sun,
  MessageSquare,
  Code,
  TrendingUp,
  Database,
  FileJson,
  Keyboard,
  Table,
  PieChart,
  Zap,
  Shield,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-10 h-10" />
          <h1 className="text-3xl font-bold">Copilot Usage Insights</h1>
        </div>
        <p className="text-lg text-purple-100 max-w-3xl mb-6">
          A comprehensive analytics dashboard for visualizing and understanding GitHub Copilot usage 
          across your enterprise. Track adoption, analyze model usage, monitor code generation metrics, 
          and gain actionable insights from your team's AI-assisted development workflow.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/insights/copilot-usage" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors">
            <TrendingUp className="w-4 h-4" />
            View Insights
          </Link>
          <Link to="/people" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-400 transition-colors">
            <Users className="w-4 h-4" />
            Browse People
          </Link>
        </div>
      </div>

      {/* Key Features Grid */}
      <div>
        <h2 className="text-xl font-semibold text-github-text dark:text-dark-text mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Usage Analytics"
            description="Track daily and weekly active users, chat requests, and adoption trends with interactive charts."
          />
          <FeatureCard 
            icon={<PieChart className="w-6 h-6 text-purple-500" />}
            title="Model Distribution"
            description="Analyze which AI models (GPT-4, Claude, etc.) your team uses most across different modes."
          />
          <FeatureCard 
            icon={<Code className="w-6 h-6 text-blue-500" />}
            title="Code Generation Metrics"
            description="Monitor lines suggested vs accepted, acceptance rates, and code changes by language."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-orange-500" />}
            title="User-Level Insights"
            description="Browse individual user activity, IDEs used, and engagement metrics in the People tab."
          />
          <FeatureCard 
            icon={<Bot className="w-6 h-6 text-indigo-500" />}
            title="AI Chatbot Assistant"
            description="Ask questions about your data in natural language and get instant answers."
          />
          <FeatureCard 
            icon={<Table className="w-6 h-6 text-teal-500" />}
            title="Detailed Reports"
            description="Export summary and detailed table views for reporting and deeper analysis."
          />
        </div>
      </div>

      {/* How to Use Section */}
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-github-text dark:text-dark-text mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          How to Use
        </h2>
        
        <div className="space-y-6">
          {/* Upload Data */}
          <HowToSection
            icon={<Upload className="w-5 h-5 text-purple-500" />}
            title="Loading Your Data"
            steps={[
              "Navigate to any Insights page (Copilot Usage or Code Generation)",
              "Click the \"Upload JSON\" button in the top-right corner",
              "Select your GitHub Copilot usage report JSON or NDJSON file",
              "Data will be imported and charts will automatically refresh",
              "The People and Teams counts in the navigation will update instantly"
            ]}
          />

          {/* Search */}
          <HowToSection
            icon={<Search className="w-5 h-5 text-blue-500" />}
            title="Global Search"
            steps={[
              "Press \"/\" anywhere to open the search bar (or click the search icon)",
              "Search for users by name or login",
              "Search for enterprise IDs, IDEs, languages, or models",
              "Click on a result to navigate directly to relevant data",
              "Press Escape or click outside to close search"
            ]}
          />

          {/* Flush Data */}
          <HowToSection
            icon={<Trash2 className="w-5 h-5 text-red-500" />}
            title="Clearing Data"
            steps={[
              "Click the \"Flush Data\" button in the header (trash icon)",
              "Confirm the action in the dialog",
              "All uploaded data will be permanently deleted",
              "Use this to start fresh or load new data"
            ]}
            warning="This action cannot be undone!"
          />

          {/* Chatbot */}
          <HowToSection
            icon={<MessageSquare className="w-5 h-5 text-indigo-500" />}
            title="Using the AI Chatbot"
            steps={[
              "Click the chat bubble icon in the bottom-right corner",
              "Use suggested queries or type your own questions",
              "Ask about top users, IDE statistics, language usage, and more",
              "Search for specific users by name",
              "The chatbot queries your actual uploaded data"
            ]}
          />

          {/* Theme Toggle */}
          <HowToSection
            icon={<Moon className="w-5 h-5 text-yellow-500" />}
            title="Dark/Light Mode"
            steps={[
              "Click the sun/moon icon in the top-right header",
              "Toggle between light and dark themes",
              "Your preference is saved and persisted"
            ]}
          />

          {/* Keyboard Shortcuts */}
          <div className="bg-github-bgTertiary dark:bg-dark-bgTertiary rounded-lg p-4">
            <h3 className="font-medium text-github-text dark:text-dark-text mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <KeyboardShortcut shortcut="/" description="Open global search" />
              <KeyboardShortcut shortcut="Esc" description="Close search/modals" />
              <KeyboardShortcut shortcut="Enter" description="Execute search" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Insights Available */}
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-github-text dark:text-dark-text mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Available Insights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-github-text dark:text-dark-text mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Copilot Usage Page
            </h3>
            <ul className="space-y-2 text-sm text-github-textSecondary dark:text-dark-textSecondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Daily & Weekly Active Users trends
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Average Chat Requests per User
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Requests by Chat Mode (Agent, Ask, Edit, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Model Distribution (GPT-4, Claude, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Model Usage per Day (stacked area chart)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Model Usage by Language
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                IDE Weekly Active Users breakdown
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-github-text dark:text-dark-text mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              Code Generation Page
            </h3>
            <ul className="space-y-2 text-sm text-github-textSecondary dark:text-dark-textSecondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Lines Suggested vs Lines Accepted
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Code Acceptance Rate over time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Code Completions chart
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                User Code Changes by Mode
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Agent Code Changes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Code Changes by Model
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Code Changes by Language
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported Data Format */}
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-github-text dark:text-dark-text mb-4 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-orange-500" />
          Supported Data Format
        </h2>
        <p className="text-github-textSecondary dark:text-dark-textSecondary mb-4">
          Upload JSON files exported from GitHub Copilot enterprise usage reports. The dashboard supports:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-github-bgTertiary dark:bg-dark-bgTertiary rounded-lg p-4">
            <h4 className="font-medium text-github-text dark:text-dark-text mb-2">Standard JSON</h4>
            <p className="text-sm text-github-textSecondary dark:text-dark-textSecondary">
              Array of user usage records with daily activity data
            </p>
          </div>
          <div className="bg-github-bgTertiary dark:bg-dark-bgTertiary rounded-lg p-4">
            <h4 className="font-medium text-github-text dark:text-dark-text mb-2">NDJSON Format</h4>
            <p className="text-sm text-github-textSecondary dark:text-dark-textSecondary">
              Newline-delimited JSON for large datasets
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Privacy:</strong> All data is stored locally in your browser's SQLite database. 
              No data is sent to external servers.
            </span>
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-github-text dark:text-dark-text mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-green-500" />
          Built With
        </h2>
        <div className="flex flex-wrap gap-2">
          {['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts', 'TanStack Query', 'Express.js', 'SQLite', 'Docker'].map((tech) => (
            <span 
              key={tech}
              className="px-3 py-1 bg-github-bgTertiary dark:bg-dark-bgTertiary text-github-text dark:text-dark-text rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLinkCard 
          to="/insights/copilot-usage" 
          icon={<BarChart3 className="w-6 h-6" />}
          title="Copilot Usage"
          color="purple"
        />
        <QuickLinkCard 
          to="/insights/code-generation" 
          icon={<Code className="w-6 h-6" />}
          title="Code Generation"
          color="blue"
        />
        <QuickLinkCard 
          to="/people" 
          icon={<Users className="w-6 h-6" />}
          title="People"
          color="orange"
        />
        <QuickLinkCard 
          to="/table-view/summary" 
          icon={<Table className="w-6 h-6" />}
          title="Table View"
          color="teal"
        />
      </div>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="font-medium text-github-text dark:text-dark-text">{title}</h3>
      </div>
      <p className="text-sm text-github-textSecondary dark:text-dark-textSecondary">{description}</p>
    </div>
  );
}

function HowToSection({ icon, title, steps, warning }: { icon: React.ReactNode; title: string; steps: string[]; warning?: string }) {
  return (
    <div className="border-b border-github-border dark:border-dark-border pb-6 last:border-0 last:pb-0">
      <h3 className="font-medium text-github-text dark:text-dark-text mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ol className="list-decimal list-inside space-y-2 text-sm text-github-textSecondary dark:text-dark-textSecondary ml-1">
        {steps.map((step, i) => (
          <li key={i} className="leading-relaxed">{step}</li>
        ))}
      </ol>
      {warning && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {warning}
        </p>
      )}
    </div>
  );
}

function KeyboardShortcut({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-2 py-1 bg-white dark:bg-dark-bg border border-github-border dark:border-dark-border rounded text-xs font-mono text-github-text dark:text-dark-text">
        {shortcut}
      </kbd>
      <span className="text-github-textSecondary dark:text-dark-textSecondary">{description}</span>
    </div>
  );
}

function QuickLinkCard({ to, icon, title, color }: { to: string; icon: React.ReactNode; title: string; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50',
  };

  return (
    <Link 
      to={to}
      className={`flex flex-col items-center justify-center p-6 rounded-xl transition-colors ${colorClasses[color]}`}
    >
      {icon}
      <span className="mt-2 font-medium text-sm">{title}</span>
    </Link>
  );
}
