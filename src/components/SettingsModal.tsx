import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, Save, RotateCcw, Activity } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onReset: () => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave, onReset }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalSettings({
      ...localSettings,
      [e.target.name]: e.target.value,
    });
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!localSettings.googleSheetsUrl.trim()) {
      setTestStatus('error');
      setTestMessage('Введите ссылку на Google Sheets');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');
    
    try {
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: localSettings.googleSheetsUrl })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка проверки подключения');
      }
      
      setTestStatus('success');
      setTestMessage(`Подключено. Загружено строк: ${data.rowCount}`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Ошибка подключения');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFEBE0] flex items-center justify-between bg-[#FDFBF7]">
          <h2 className="text-xl font-bold text-[#4A3C31]">Настройки</h2>
          <button onClick={onClose} className="p-2 text-[#8B7355] hover:bg-[#EFEBE0] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-[#4A3C31] mb-2">Название магазина</label>
            <input
              type="text"
              name="shopName"
              value={localSettings.shopName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-[#EFEBE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4C3B3] text-[#4A3C31]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3C31] mb-2">Ссылка на Google Sheets (База знаний)</label>
            <input
              type="text"
              name="googleSheetsUrl"
              value={localSettings.googleSheetsUrl}
              onChange={handleChange}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-4 py-2.5 bg-white border border-[#EFEBE0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4C3B3] text-[#4A3C31]"
            />
          </div>

          <div className="bg-[#FDFBF7] border border-[#EFEBE0] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#4A3C31] flex items-center">
              <Activity className="w-4 h-4 mr-2 text-[#8B7355]" />
              Статус подключений
            </h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5C4D41]">Google Sheets</span>
              <span className={`px-2.5 py-1 rounded-md font-medium text-xs ${
                testStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                testStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-[#F4F0E6] text-[#8B7355]'
              }`}>
                {testStatus === 'success' ? testMessage : 
                 testStatus === 'error' ? 'Ошибка подключения' :
                 localSettings.googleSheetsUrl ? 'Требуется проверка' : 'Не подключено'}
              </span>
            </div>
            
            {testStatus === 'error' && (
              <div className="text-xs text-red-600 mt-1">
                {testMessage}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5C4D41]">Gemini API</span>
              <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 font-medium text-xs">
                Подключено
              </span>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !localSettings.googleSheetsUrl}
              className="mt-2 w-full py-2 bg-white border border-[#EFEBE0] text-[#4A3C31] text-sm font-medium rounded-lg hover:bg-[#F4F0E6] transition-colors disabled:opacity-50 disabled:hover:bg-white"
            >
              {testStatus === 'testing' ? 'Проверка...' : 'Проверить подключение'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EFEBE0] flex justify-between bg-[#FDFBF7]">
          <button
            onClick={() => {
              onReset();
              setLocalSettings(settings);
              setTestStatus('idle');
              setTestMessage('');
            }}
            className="flex items-center px-4 py-2 text-[#8B7355] hover:bg-[#EFEBE0] rounded-lg transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить настройки
          </button>
          
          <button
            onClick={handleSave}
            disabled={testStatus === 'testing'}
            className="flex items-center px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#725C43] transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </button>
        </div>

      </div>
    </div>
  );
}
