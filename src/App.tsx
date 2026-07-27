import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { RecommendationCard } from './components/RecommendationCard';
import { SettingsModal } from './components/SettingsModal';
import { Message, Recommendation, AppSettings } from './types';
import { loadSettings, saveSettings, clearSettings } from './utils/settings';
import { DEFAULT_SETTINGS, DEFAULT_SYSTEM_PROMPT } from './utils/constants';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);

  useEffect(() => {
    setSettings(loadSettings());
    // Initial welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Здравствуйте! Я — Ваш кофейный сомелье. Помогу подобрать кофе, помол или способ доставки. Расскажите, какой вкус Вы предпочитаете и как обычно готовите кофе.',
      },
    ]);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    const resetSettings = clearSettings();
    setSettings(resetSettings);
  };

  const handleCategorySelect = (category: string, examples: string[]) => {
    setExampleQuestions(examples);
  };

  const handleSendMessage = async (text: string) => {
    setExampleQuestions([]);
    const newMessage: Message = { id: Date.now().toString(), role: 'user', text };
    const currentMessages = [...messages, newMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentMessages.slice(0, -1), // Everything except the new message
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          googleSheetsUrl: settings.googleSheetsUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Network response was not ok');
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: data.message },
      ]);

      if (data.hasRecommendation && data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.message === 'Не удалось загрузить базу знаний. Проверьте ссылку на Google Sheets или повторите попытку позже'
        ? error.message
        : 'Извините, произошла ошибка сети или сервера. Пожалуйста, попробуйте еще раз позже.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[#4A3C31]">
      {/* Top Navigation */}
      <header className="h-16 border-b border-[#EFEBE0] bg-[#FDFBF7] flex items-center justify-between px-6 shrink-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-[#4A3C31] flex items-center">
          <span className="bg-[#8B7355] text-white p-1.5 rounded-lg mr-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="9" x2="9" y1="2" y2="4"/><line x1="15" x2="15" y1="2" y2="4"/></svg>
          </span>
          {settings.shopName}
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center text-[#8B7355] hover:bg-[#EFEBE0] px-3 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <SettingsIcon className="w-5 h-5 mr-2" />
          Настройки
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar - Categories */}
        <div className="w-full md:w-64 shrink-0 flex-none h-16 md:h-full z-10 bg-white">
          <Sidebar onCategorySelect={handleCategorySelect} />
        </div>

        {/* Center - Chat Window */}
        <div className="flex-1 flex flex-col min-w-0 h-full border-t md:border-t-0 border-[#EFEBE0]">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            exampleQuestions={exampleQuestions}
            onExampleClick={handleSendMessage}
          />
        </div>

        {/* Right Sidebar - Recommendation Card */}
        {recommendation && (
           <div className="md:hidden p-4 bg-[#FDFBF7] border-t border-[#EFEBE0] shrink-0">
               <RecommendationCard recommendation={recommendation} />
           </div>
        )}
        
        <div className="hidden lg:block w-80 shrink-0 h-full">
          <RecommendationCard recommendation={recommendation} />
        </div>
      </div>

      {/* Mobile Drawer/Panels: for a real app we'd add responsive states here, 
          but for now we use CSS to hide/show parts, or they stack vertically if we allow it. 
          Currently sidebar is hidden on small, chat is full. */}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
      />
    </div>
  );
}
