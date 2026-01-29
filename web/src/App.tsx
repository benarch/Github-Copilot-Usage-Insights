import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CopilotUsagePage } from '@/pages/CopilotUsagePage';
import { CodeGenerationPage } from '@/pages/CodeGenerationPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/insights/copilot-usage" replace />} />
          <Route path="/insights/copilot-usage" element={<CopilotUsagePage />} />
          <Route path="/insights/code-generation" element={<CodeGenerationPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
