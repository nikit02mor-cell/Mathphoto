import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support base64 image uploads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface SolveRequest {
  imageBase64?: string;
  mimeType?: string;
  taskText?: string;
  subject?: string;
  mode?: 'step_by_step' | 'quick_answer' | 'hint_only' | 'practice';
  additionalInstructions?: string;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Main solve endpoint
app.post('/api/solve', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      taskText,
      subject = 'auto',
      mode = 'step_by_step',
      additionalInstructions = '',
    }: SolveRequest = req.body;

    if (!imageBase64 && !taskText) {
      res.status(400).json({ error: 'Необходимо предоставить изображение или текст задачи' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY не настроен на сервере. Пожалуйста, проверьте настройки окружения.',
      });
      return;
    }

    const parts: any[] = [];

    // Clean base64 string if data URI header is included
    if (imageBase64) {
      let rawBase64 = imageBase64;
      let detectedMime = mimeType;
      if (rawBase64.includes('base64,')) {
        const matches = rawBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (matches && matches[1]) {
          detectedMime = matches[1];
        }
        rawBase64 = rawBase64.split('base64,')[1];
      }

      parts.push({
        inlineData: {
          mimeType: detectedMime,
          data: rawBase64,
        },
      });
    }

    const modePromptMap: Record<string, string> = {
      step_by_step: 'Предоставь подробное пошаговое академическое решение с понятными объяснениями каждого действия.',
      quick_answer: 'Дай максимально сжатый, точный финальный ответ с кратчайшей 1-2 строчной выкладкой.',
      hint_only: 'Не называй сразу финальный ответ. Дай сократовскую подсказку и план действий, чтобы ученик решил сам.',
      practice: 'Реши задачу и сразу придумай одну аналогичную тренировочную задачу с ответом под спойлером для закрепления.',
    };

    const subjectConstraint = subject && subject !== 'auto' 
      ? `Предмет: ${subject}. Используй соответствующие формулы, обозначения и терминологию.` 
      : 'Определи предмет задачи автоматически (Математика, Алгебра, Геометрия, Физика, Химия, Информатика, Русский язык, Биология и т.д.).';

    const systemPrompt = `Ты — лучший профессор, репетитор и эксперт по решению учебных и олимпиадных задач любого уровня сложности (школа, ЕГЭ, ОГЭ, университет, олимпиады).
Твоя задача — внимательно изучить фотографию или текст задачи, распознать все формулы, символы, рукописный текст, чертежи, графики или таблицы, и сформировать идеальный структурированный разбор на русском языке.

Правила форматирования:
1. Используй стандартную LaTeX-разметку для всех математических формул и переменных (например: $x^2 + y^2 = r^2$, $\\frac{a}{b}$, $\\sqrt{D}$, $v_0$, $F = m \\cdot a$). Оборачивай строчные формулы в знаки доллара: $...$, а выключные (блочные) формулы в $$...$$.
2. Всегда проверяй правильность вычислений, размерностей единиц измерения и граничных условий.
3. Ответ строго верни в валидном формате JSON без обрамления markdown или лишнего текста, точно соответствующем указанной JSON-схеме.`;

    const userPrompt = `
${subjectConstraint}
Режим разбора: ${modePromptMap[mode] || modePromptMap.step_by_step}
${additionalInstructions ? `Дополнительное пожелание пользователя: ${additionalInstructions}` : ''}
${taskText ? `Дополнительный текст/комментарий к задаче: ${taskText}` : ''}

Строго верни JSON-объект следующей структуры:
{
  "subject": "Название предмета на русском (например: Алгебра, Геометрия, Физика, Химия, Русский язык)",
  "topic": "Конкретная тема (например: Квадратные уравнения, Закон сохранения импульса, Теорема синусов, Окислительно-восстановительные реакции)",
  "difficulty": "Начальный" | "Базовый" | "Повышенный" | "Олимпиадный",
  "recognizedTaskText": "Точный распознанный текст условия задачи с фотографии, со всеми данными, числами и формулами в формате LaTeX ($...$)",
  "shortAnswer": "Финальный четкий краткий ответ с единицами измерения (например: x₁ = -2, x₂ = 5 или 24.5 м/с или H₂SO₄)",
  "confidence": "high" | "medium" | "low",
  "keyFormulas": ["Список ключевых формул, законов или правил, использованных при решении (с LaTeX)"],
  "given": [
    { "label": "Обозначение (например, $v_0$, $m$, $S$)", "value": "Значение с единицами (например, $10\\text{ м/с}$)" }
  ],
  "toFind": "Что требовалось найти в задаче",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Краткое название этапа решения",
      "explanation": "Подробное, понятное и живое объяснение логики на русском языке",
      "math": "Формула, преобразование или вычисление в LaTeX ($...$ или $$...$$) если применимо"
    }
  ],
  "pitfallsAndTips": "Совет эксперта: типичные ошибки школьников/студентов в этой теме и лайфхак для запоминания",
  "checkVerification": "Как проверить полученный ответ (например: подстановка корней в исходное уравнение, проверка размерности)",
  "similarPracticeProblem": {
    "problem": "Текст похожей задачи для самостоятельной тренировки",
    "hint": "Подсказка к решению",
    "answer": "Финальный правильный ответ к похожей задаче"
  }
}
`;

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high math accuracy
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback: extract json from codeblocks if any
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Не удалось разобрать JSON-ответ от модели');
      }
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/solve:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Ошибка при обработке и решении задачи',
    });
  }
});

// Follow-up question chat endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      taskContext,
      history = [],
      message,
    } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Сообщение не может быть пустым' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY не настроен' });
      return;
    }

    const systemInstruction = `Ты — дружелюбный и высококвалифицированный репетитор.
Пользователь задает вопрос по конкретной уже разобранной задаче.
Отвечай точно, кратко, уважительно и доходчиво на русском языке.
Если пользователь просит:
- "Объясни проще" — объясни на бытовых аналогиях, простыми словами без заумных терминов.
- "Реши другим способом" — покажи альтернативный метод (например, через графики, теорему Виета, координатный метод, закон сохранения энергии вместо кинематики и т.д.).
- "Проверь моё решение" — проанализируй предоставленный им ход мыслей и укажи, где ошибка или всё ли верно.
Используй LaTeX ($...$) для всех формул и переменных.`;

    const promptContext = `
Контекст текущей задачи:
- Предмет: ${taskContext?.subject || 'Не указан'}
- Тема: ${taskContext?.topic || ''}
- Условие задачи: ${taskContext?.recognizedTaskText || ''}
- Ответ: ${taskContext?.shortAnswer || ''}
- Ключевые шаги: ${JSON.stringify(taskContext?.steps?.map((s: any) => s.title + ': ' + s.explanation) || [])}

История диалога:
${history.map((h: any) => `${h.role === 'user' ? 'Ученик' : 'Репетитор'}: ${h.text}`).join('\n')}

Новый вопрос ученика: ${message}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContext,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'Не удалось сформировать ответ.',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Ошибка генерации ответа',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
