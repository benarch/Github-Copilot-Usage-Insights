import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CopilotUsagePage } from '@/pages/CopilotUsagePage';
import { CodeGenerationPage } from '@/pages/CodeGenerationPage';
import { ChatbotProvider, ChatbotContainer } from '@/components/Chatbot';

function App() {
  return (
    <Router>
      <ChatbotProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/insights/copilot-usage" replace />} />
            <Route path="/insights/copilot-usage" element={<CopilotUsagePage />} />
            <Route path="/insights/code-generation" element={<CodeGenerationPage />} />
          </Routes>
        </Layout>
        <ChatbotContainer />
      </ChatbotProvider>
    </Router>
  );
}

export default App;
