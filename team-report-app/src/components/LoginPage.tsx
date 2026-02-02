import { useState, useEffect } from 'react';
import { Lock, Users2, Moon, Sun, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (team: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

interface Team {
  name: string;
  organization: string;
  password: string; // In production, this would be hashed and stored securely
}

// Demo teams with passwords (in production, fetch from secure backend)
const TEAMS: Team[] = [
  { name: 'Engineering', organization: 'Acme Corp', password: 'eng2024' },
  { name: 'Product', organization: 'Acme Corp', password: 'prod2024' },
  { name: 'Design', organization: 'Acme Corp', password: 'design2024' },
];

export default function LoginPage({ onLogin, isDark, toggleTheme }: LoginPageProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teams, setTeams] = useState<Array<{ name: string; organization: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch teams from main app API
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setTeams(data);
        } else {
          // Fallback to demo teams
          setTeams(TEAMS.map(t => ({ name: t.name, organization: t.organization })));
        }
        setLoading(false);
      })
      .catch(() => {
        // Use demo teams on error
        setTeams(TEAMS.map(t => ({ name: t.name, organization: t.organization })));
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    // Find the team
    const team = TEAMS.find(t => {
      const teamFullName = t.organization ? `${t.organization}/${t.name}` : t.name;
      return teamFullName === selectedTeam;
    });

    if (!team) {
      setError('Team not found');
      return;
    }

    // Verify password
    if (team.password !== password) {
      setError('Incorrect password');
      return;
    }

    // Success
    onLogin(selectedTeam);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-dark-bgSecondary border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bgTertiary transition-colors"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Users2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Team Usage Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access your team's Copilot usage analytics
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-dark-bgSecondary rounded-xl border border-gray-200 dark:border-dark-border shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Team
              </label>
              <div className="relative">
                <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bgTertiary text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Loading teams...' : 'Choose a team...'}
                  </option>
                  {teams.map(team => {
                    const fullName = team.organization ? `${team.organization}/${team.name}` : team.name;
                    return (
                      <option key={fullName} value={fullName}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter team password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bgTertiary text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Access Report
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
              Demo Credentials:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              {TEAMS.map(team => (
                <li key={team.name}>
                  <strong>{team.organization}/{team.name}:</strong> {team.password}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          This is a secure portal for accessing team-specific usage reports
        </p>
      </div>
    </div>
  );
}
