import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CopilotUsagePage } from '@/pages/CopilotUsagePage';
import { CodeGenerationPage } from '@/pages/CodeGenerationPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { TableViewPage } from '@/pages/TableViewPage';
import { SummaryReportPage } from '@/pages/SummaryReportPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { TeamsPage } from '@/pages/TeamsPage';
import { UsersInTeamsPage } from '@/pages/UsersInTeamsPage';
import { OrganizationsPage } from '@/pages/OrganizationsPage';
import { TeamsViewPage } from '@/pages/TeamsViewPage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NavCountsProvider } from '@/contexts/NavCountsContext';
import { ImportDataProvider } from '@/contexts/ImportDataContext';
import { ChatbotProvider, ChatbotContainer } from '@/components/Chatbot';

function App() {
  return (
    <ThemeProvider>
    <ImportDataProvider>
    <Router>
      <NavCountsProvider>
      <ChatbotProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/insights/copilot-usage" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/users" element={<UsersInTeamsPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/insights/copilot-usage" element={<CopilotUsagePage />} />
            <Route path="/insights/code-generation" element={<CodeGenerationPage />} />
            <Route path="/table-view" element={<Navigate to="/table-view/summary" replace />} />
            <Route path="/table-view/summary" element={<SummaryReportPage />} />
            <Route path="/table-view/detailed" element={<TableViewPage />} />
            <Route path="/table-view/teams" element={<TeamsViewPage />} />
          </Routes>
        </Layout>
        <ChatbotContainer />
      </ChatbotProvider>
      </NavCountsProvider>
    </Router>
    </ImportDataProvider>
    </ThemeProvider>
  );
}

export default App;
