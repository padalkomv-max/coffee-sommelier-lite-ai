import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import Papa from 'papaparse';

dotenv.config();

// Helper to extract spreadsheetId and gid
function parseGoogleSheetsUrl(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = match ? match[1] : null;
  
  let gid = '0';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) {
    gid = gidMatch[1];
  }

  return { spreadsheetId, gid };
}

// Fetch and parse CSV
async function fetchKnowledgeBase(url: string) {
  const { spreadsheetId, gid } = parseGoogleSheetsUrl(url);
  if (!spreadsheetId) {
    throw new Error('Некорректная ссылка на Google Sheets');
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Не удалось загрузить таблицу');
    }
    const csvText = await response.text();
    
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: any) => {
          reject(new Error('Ошибка парсинга CSV: ' + error.message));
        }
      });
    });
  } catch (error) {
    throw new Error('Не удалось загрузить базу знаний. Проверьте ссылку на Google Sheets или повторите попытку позже');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

app.post('/api/test-sheets', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Ссылка не предоставлена' });
    }

    const data = await fetchKnowledgeBase(url);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'Таблица пуста' });
    }

    // Check required columns
    const firstRow = data[0];
    const requiredColumns = ['category', 'question', 'answer', 'tags'];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ error: `Отсутствуют обязательные колонки: ${missingColumns.join(', ')}` });
    }

    if (data.length < 15) {
      return res.status(400).json({ error: 'В таблице должно быть не менее 15 заполненных строк' });
    }

    res.json({ success: true, rowCount: data.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

function searchKnowledgeBase(data: any[], query: string) {
  const normalizedQuery = query.toLowerCase().replace(/[.,?!]/g, '').trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  const scoredData = data.map(row => {
    let score = 0;
    const textToSearch = [
      (row.category || '').toLowerCase(),
      (row.question || '').toLowerCase(),
      (row.tags || '').toLowerCase()
    ].join(' ').replace(/[.,?!]/g, '');

    queryWords.forEach(word => {
      if (textToSearch.includes(word)) {
        score += 1;
      }
    });

    return { ...row, score };
  });

  return scoredData
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, systemPrompt, googleSheetsUrl } = req.body;

    let knowledgeContext = '';
    let relevantRows: any[] = [];
    
    if (googleSheetsUrl) {
      const data = await fetchKnowledgeBase(googleSheetsUrl);
      relevantRows = searchKnowledgeBase(data, message);
      
      if (relevantRows.length > 0) {
        knowledgeContext = 'Контекст из базы знаний магазина (отвечай строго на его основе):\n' +
          relevantRows.map(row => `Вопрос/Тема: ${row.question}\nОтвет: ${row.answer}`).join('\n\n');
      }
    }

    const finalSystemPrompt = knowledgeContext 
      ? `${systemPrompt}\n\n${knowledgeContext}`
      : systemPrompt;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API ключ Gemini не настроен на сервере.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        message: {
          type: Type.STRING,
          description: 'Ответ ассистента покупателю.',
        },
        hasRecommendation: {
          type: Type.BOOLEAN,
          description: 'True, если в ответе есть рекомендация конкретного товара или услуги, False если рекомендация пока не сформирована.',
        },
        recommendation: {
          type: Type.OBJECT,
          description: 'Детали рекомендации. Заполнять только если hasRecommendation = true.',
          properties: {
            type: { type: Type.STRING, description: 'Тип (Кофе, Оборудование, Подписка и т.д.)' },
            name: { type: Type.STRING, description: 'Название' },
            description: { type: Type.STRING, description: 'Краткое описание' },
            acidity: { type: Type.STRING, description: 'Кислотность' },
            sweetness: { type: Type.STRING, description: 'Сладость' },
            body: { type: Type.STRING, description: 'Плотность' },
            flavorNotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Вкусовые оттенки' },
            brewingMethod: { type: Type.STRING, description: 'Рекомендуемый способ приготовления' },
            grindSize: { type: Type.STRING, description: 'Рекомендуемый помол' },
            nextStep: { type: Type.STRING, description: 'Следующий шаг для покупателя' },
          },
        },
      },
      required: ['message', 'hasRecommendation'],
    };

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      history: formattedHistory,
      config: {
        systemInstruction: finalSystemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const response = await chat.sendMessage({ message });
    const data = JSON.parse(response.text);

    if (process.env.LOGGING_WEBHOOK_URL) {
      const payload = {
        question: message,
        category: relevantRows.length > 0 ? relevantRows[0].category : 'Без категории',
        answerType: relevantRows.length > 0 ? 'из базы' : 'общий'
      };
      
      fetch(process.env.LOGGING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.error('Ошибка при отправке лога:', err);
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    if (error.message === 'Не удалось загрузить базу знаний. Проверьте ссылку на Google Sheets или повторите попытку позже') {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Ошибка при получении ответа от AI.' });
    }
  }
});

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

