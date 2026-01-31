import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { fetchNavCounts } from '@/lib/api';

interface NavCountsContextType {
  peopleCount: number | null;
  teamsCount: number | null;
  refreshCounts: () => Promise<void>;
}

const NavCountsContext = createContext<NavCountsContextType | undefined>(undefined);

export function NavCountsProvider({ children }: { children: ReactNode }) {
  const [peopleCount, setPeopleCount] = useState<number | null>(null);
  const [teamsCount, setTeamsCount] = useState<number | null>(null);

  const refreshCounts = useCallback(async () => {
    try {
      const counts = await fetchNavCounts();
      setPeopleCount(counts.peopleCount);
      setTeamsCount(counts.teamsCount);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  }, []);

  // Load counts on mount
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <NavCountsContext.Provider value={{ peopleCount, teamsCount, refreshCounts }}>
      {children}
    </NavCountsContext.Provider>
  );
}

export function useNavCounts() {
  const context = useContext(NavCountsContext);
  if (context === undefined) {
    throw new Error('useNavCounts must be used within a NavCountsProvider');
  }
  return context;
}
