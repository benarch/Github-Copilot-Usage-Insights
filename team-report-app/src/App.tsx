import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import ReportPage from './components/ReportPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = (team: string) => {
    setSelectedTeam(team);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedTeam('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} isDark={isDark} toggleTheme={toggleTheme} />
      ) : (
        <ReportPage 
          selectedTeam={selectedTeam} 
          onLogout={handleLogout}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
