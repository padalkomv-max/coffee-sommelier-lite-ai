import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  exampleQuestions: string[];
  onExampleClick: (text: string) => void;
}

export function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  exampleQuestions,
  onExampleClick,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#8B7355] space-y-4">
            <MessageSquare className="w-12 h-12 opacity-50" />
            <p className="max-w-md">
              Выберите категорию слева или просто напишите ваш вопрос ниже.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#8B7355] text-white rounded-br-sm'
                  : 'bg-[#FDFBF7] text-[#4A3C31] border border-[#EFEBE0] rounded-bl-sm whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#FDFBF7] border border-[#EFEBE0] rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center space-x-2 text-[#8B7355]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Сомелье готовит ответ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#EFEBE0]">
        {exampleQuestions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {exampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onExampleClick(q)}
                className="text-xs md:text-sm bg-[#F4F0E6] text-[#5C4D41] px-3 py-1.5 rounded-full hover:bg-[#EBE4D5] transition-colors border border-[#EFEBE0]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите меня о кофе..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-[#FDFBF7] border border-[#EFEBE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4C3B3] text-[#4A3C31] placeholder-[#A89F91]"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 text-[#8B7355] hover:bg-[#EFEBE0] rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
