import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ImportedUser {
  id: number;
  login: string;
  organizations: string[];
  organization_count: number;
  teams: string[];
  team_count: number;
}

export interface Team {
  id: string;
  name: string;
  organization: string;
  memberCount: number;
  members: string[];
}

export interface Organization {
  id: string;
  name: string;
  memberCount: number;
  teamsCount: number;
}

interface ImportDataContextType {
  users: ImportedUser[];
  teams: Team[];
  organizations: Organization[];
  importData: (users: ImportedUser[]) => void;
  clearData: () => void;
}

const ImportDataContext = createContext<ImportDataContextType | undefined>(undefined);

// Parse CSV to array of users
export function parseCSV(csvText: string): ImportedUser[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const users: ImportedUser[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    const orgString = row['organizations'] || '';
    const teamsString = row['teams'] || '';
    
    const orgs = orgString ? orgString.split(',').map(o => o.trim()).filter(Boolean) : [];
    const teams = teamsString ? teamsString.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    users.push({
      id: parseInt(row['id']) || 0,
      login: row['login'] || '',
      organizations: orgs,
      organization_count: parseInt(row['organization_count']) || orgs.length,
      teams: teams,
      team_count: parseInt(row['team_count']) || teams.length,
    });
  }
  
  return users;
}

// Parse JSON - handle both array format and nested teams field
export function parseJSON(data: unknown[]): ImportedUser[] {
  return data.map(item => {
    const user = item as Record<string, unknown>;
    
    // Handle organizations - could be array or comma-separated string
    let orgs: string[] = [];
    if (Array.isArray(user.organizations)) {
      orgs = user.organizations as string[];
    } else if (typeof user.organizations === 'string') {
      orgs = user.organizations.split(',').map(o => o.trim()).filter(Boolean);
    }
    
    // Handle teams - could be array or comma-separated string
    let teams: string[] = [];
    if (Array.isArray(user.teams)) {
      teams = user.teams as string[];
    } else if (typeof user.teams === 'string') {
      teams = user.teams.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    return {
      id: (user.id as number) || 0,
      login: (user.login as string) || '',
      organizations: orgs,
      organization_count: (user.organization_count as number) || orgs.length,
      teams: teams,
      team_count: (user.team_count as number) || teams.length,
    };
  });
}

// Extract unique teams from users with member aggregation
function extractTeams(users: ImportedUser[]): Team[] {
  const teamsMap = new Map<string, { org: string; members: Set<string> }>();
  
  users.forEach(user => {
    user.teams.forEach(teamFullName => {
      const parts = teamFullName.split('/');
      const org = parts.length > 1 ? parts[0] : '';
      
      if (!teamsMap.has(teamFullName)) {
        teamsMap.set(teamFullName, { org, members: new Set() });
      }
      teamsMap.get(teamFullName)!.members.add(user.login);
    });
  });
  
  return Array.from(teamsMap.entries()).map(([fullName, data], idx) => ({
    id: `team-${idx}`,
    name: fullName.includes('/') ? fullName.split('/').slice(1).join('/') : fullName,
    organization: data.org,
    memberCount: data.members.size,
    members: Array.from(data.members),
  }));
}

// Extract unique organizations from users
function extractOrganizations(users: ImportedUser[]): Organization[] {
  const orgsMap = new Map<string, { members: Set<string>; teams: Set<string> }>();
  
  users.forEach(user => {
    user.organizations.forEach(org => {
      if (!orgsMap.has(org)) {
        orgsMap.set(org, { members: new Set(), teams: new Set() });
      }
      orgsMap.get(org)!.members.add(user.login);
    });
    
    // Count teams per org
    user.teams.forEach(teamFullName => {
      const parts = teamFullName.split('/');
      if (parts.length > 1) {
        const org = parts[0];
        if (orgsMap.has(org)) {
          orgsMap.get(org)!.teams.add(teamFullName);
        }
      }
    });
  });
  
  return Array.from(orgsMap.entries()).map(([name, data], idx) => ({
    id: `org-${idx}`,
    name,
    memberCount: data.members.size,
    teamsCount: data.teams.size,
  }));
}

export function ImportDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<ImportedUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  const importData = useCallback((importedUsers: ImportedUser[]) => {
    setUsers(importedUsers);
    setTeams(extractTeams(importedUsers));
    setOrganizations(extractOrganizations(importedUsers));
  }, []);
  
  const clearData = useCallback(() => {
    setUsers([]);
    setTeams([]);
    setOrganizations([]);
  }, []);
  
  return (
    <ImportDataContext.Provider value={{ users, teams, organizations, importData, clearData }}>
      {children}
    </ImportDataContext.Provider>
  );
}

export function useImportData() {
  const context = useContext(ImportDataContext);
  if (context === undefined) {
    throw new Error('useImportData must be used within an ImportDataProvider');
  }
  return context;
}
