import { useEffect, useRef } from 'react';
import { X, Bot } from 'lucide-react';
import { useChatbot } from './ChatbotContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QueryChips } from './QueryChips';

interface ChatbotPanelProps {
  onSendMessage: (message: string) => void;
}

export function ChatbotPanel({ onSendMessage }: ChatbotPanelProps) {
  const { isOpen, closeChatbot, messages, isLoading } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const followups = lastMessage?.role === 'bot' ? lastMessage.suggestedFollowups : undefined;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={closeChatbot}
      />
      
      {/* Right Sidebar Panel */}
      <div 
        className="fixed top-0 right-0 bottom-0 z-50 w-[400px] max-w-full bg-white dark:bg-dark-bg border-l border-github-border dark:border-dark-border shadow-2xl animate-slide-in-right"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-github-border dark:border-dark-border bg-github-bgSecondary dark:bg-dark-bgSecondary">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-github-text dark:text-dark-text">Copilot Usage Assistant</h3>
                <p className="text-xs text-github-textSecondary dark:text-dark-textSecondary">Ask me about usage insights</p>
              </div>
            </div>
            <button
              onClick={closeChatbot}
              className="p-1.5 hover:bg-github-border dark:hover:bg-dark-border rounded-md transition-colors text-github-text dark:text-dark-text"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white dark:bg-dark-bg">
            {!hasMessages ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot size={32} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-github-text dark:text-dark-text mb-2">
                    Hi! I'm your Copilot Usage Assistant
                  </h4>
                  <p className="text-sm text-github-textSecondary dark:text-dark-textSecondary mb-4">
                    Ask me anything about your team's GitHub Copilot usage
                  </p>
                </div>
                <div className="w-full">
                  <p className="text-xs text-github-textSecondary dark:text-dark-textSecondary mb-3">Try these questions:</p>
                  <QueryChips onQuerySelect={onSendMessage} disabled={isLoading} />
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-github-bgSecondary dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border flex items-center justify-center">
                      <Bot size={16} className="text-github-text dark:text-dark-text" />
                    </div>
                    <div className="flex items-center gap-1 px-4 py-2.5 bg-github-bgSecondary dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-2xl">
                      <div className="w-2 h-2 bg-github-textSecondary dark:bg-dark-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-github-textSecondary dark:bg-dark-textSecondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-github-textSecondary dark:bg-dark-textSecondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Follow-up suggestions */}
          {followups && followups.length > 0 && !isLoading && (
            <div className="px-4 py-2 border-t border-github-border dark:border-dark-border bg-github-bgSecondary dark:bg-dark-bgSecondary">
              <p className="text-xs text-github-textSecondary dark:text-dark-textSecondary mb-2">Suggested follow-ups:</p>
              <div className="flex flex-wrap gap-2">
                {followups.map((query) => (
                  <button
                    key={query}
                    onClick={() => onSendMessage(query)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-dark-bg border border-github-border dark:border-dark-border rounded-full hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-github-text dark:text-dark-text"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-4 py-3 border-t border-github-border dark:border-dark-border bg-white dark:bg-dark-bg">
            <ChatInput onSend={onSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
}
