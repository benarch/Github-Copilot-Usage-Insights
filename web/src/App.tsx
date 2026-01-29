import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CopilotUsagePage } from '@/pages/CopilotUsagePage';
import { CodeGenerationPage } from '@/pages/CodeGenerationPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { TableViewPage } from '@/pages/TableViewPage';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/insights/copilot-usage" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/insights/copilot-usage" element={<CopilotUsagePage />} />
          <Route path="/insights/code-generation" element={<CodeGenerationPage />} />
          <Route path="/table-view" element={<TableViewPage />} />
        </Routes>
      </Layout>
    </Router>
    </ThemeProvider>
  );
}

export default App;
