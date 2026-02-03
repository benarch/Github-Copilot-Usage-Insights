import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestedFollowups?: string[];
}

interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleChatbot: () => void;
  openChatbot: () => void;
  closeChatbot: () => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChatbot = () => setIsOpen(!isOpen);
  const openChatbot = () => setIsOpen(true);
  const closeChatbot = () => setIsOpen(false);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        toggleChatbot,
        openChatbot,
        closeChatbot,
        addMessage,
        setLoading,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
}
