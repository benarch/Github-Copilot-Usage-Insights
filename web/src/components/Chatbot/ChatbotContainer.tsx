import { useChatbot } from './ChatbotContext';
import { ChatbotPanel } from './ChatbotPanel';
import { sendChatMessage } from '@/lib/api';
import type { Timeframe } from '@/types';

interface ChatbotContainerProps {
  timeframe?: Timeframe;
}

export function ChatbotContainer({ timeframe = '28' }: ChatbotContainerProps) {
  const { addMessage, setLoading } = useChatbot();

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Set loading state
    setLoading(true);

    try {
      // Send to API
      const response = await sendChatMessage({
        message,
        context: { timeframe },
      });

      // Add bot response
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot' as const,
        content: response.response,
        timestamp: new Date(),
        suggestedFollowups: response.suggestedFollowups,
      };
      addMessage(botMessage);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot' as const,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        suggestedFollowups: ['Show daily usage summary', 'Show model usage statistics'],
      };
      addMessage(errorMessage);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <ChatbotPanel onSendMessage={handleSendMessage} />;
}
