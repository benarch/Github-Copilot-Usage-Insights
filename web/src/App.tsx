import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CopilotUsagePage } from '@/pages/CopilotUsagePage';
import { CodeGenerationPage } from '@/pages/CodeGenerationPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { TableViewPage } from '@/pages/TableViewPage';
import { SummaryReportPage } from '@/pages/SummaryReportPage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatbotProvider, ChatbotContainer } from '@/components/Chatbot';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <ChatbotProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/insights/copilot-usage" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/insights/copilot-usage" element={<CopilotUsagePage />} />
            <Route path="/insights/code-generation" element={<CodeGenerationPage />} />
            <Route path="/table-view" element={<Navigate to="/table-view/summary" replace />} />
            <Route path="/table-view/summary" element={<SummaryReportPage />} />
            <Route path="/table-view/detailed" element={<TableViewPage />} />
          </Routes>
        </Layout>
        <ChatbotContainer />
      </ChatbotProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
