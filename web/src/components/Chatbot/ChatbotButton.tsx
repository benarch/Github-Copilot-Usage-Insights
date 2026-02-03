import { Bot } from 'lucide-react';
import { useChatbot } from './ChatbotContext';

export function ChatbotButton() {
  const { isOpen, toggleChatbot, messages } = useChatbot();
  
  // Check if there are new bot messages
  const hasNewMessages = messages.length > 0 && messages[messages.length - 1].role === 'bot';

  return (
    <button
      onClick={toggleChatbot}
      className="relative p-2 hover:bg-github-bgSecondary dark:hover:bg-dark-bgSecondary rounded-md transition-colors text-github-text dark:text-dark-text"
      aria-label="Toggle chatbot"
    >
      <Bot size={16} className={isOpen ? 'text-primary-600 dark:text-primary-400' : ''} />
      {hasNewMessages && !isOpen && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </button>
  );
}
