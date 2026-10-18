import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskSolution, ChatMessage } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';

interface SolutionViewProps {
  solution: TaskSolution;
  onBack: () => void;
  onReSolveWithText?: (updatedText: string) => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({
  solution,
  onBack,
  onReSolveWithText,
}) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [isEditingTaskText, setIsEditingTaskText] = useState(false);
  const [editedText, setEditedText] = useState(solution.recognizedTaskText);
  
  // Practice section state
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [practiceAnswerInput, setPracticeAnswerInput] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatSection, setShowChatSection] = useState(true);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(solution.shortAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleCelebrate = () => {
    setCelebrated(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'],
    });
  };

  const handleCopyAll = () => {
    const fullText = `
Предмет: ${solution.subject} (${solution.topic})
Сложность: ${solution.difficulty}

Условие:
${solution.recognizedTaskText}

Ответ:
${solution.shortAnswer}

Пошаговое решение:
${solution.steps.map((s) => `${s.stepNumber}. ${s.title}\n${s.explanation}${s.math ? `\nФормула: ${s.math}` : ''}`).join('\n\n')}

${solution.keyFormulas?.length ? `Ключевые формулы:\n- ${solution.keyFormulas.join('\n- ')}\n` : ''}
${solution.checkVerification ? `Проверка:\n${solution.checkVerification}\n` : ''}
${solution.pitfallsAndTips ? `Советы и типичные ошибки:\n${solution.pitfallsAndTips}` : ''}
`.trim();

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput.trim();
    if (!textToSend || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskContext: solution,
          history: chatMessages,
          message: textToSend,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Ошибка ответа');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `Извините, не удалось ответить: ${err.message || 'Ошибка соединения'}. Попробуйте снова.`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCheckPractice = () => {
    if (!practiceAnswerInput.trim() || !solution.similarPracticeProblem) return;
    const cleanUser = practiceAnswerInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanReal = solution.similarPracticeProblem.answer.toLowerCase().replace(/\s+/g, '');

    if (cleanUser === cleanReal || cleanReal.includes(cleanUser) || cleanUser.includes(cleanReal)) {
      setPracticeFeedback('Отлично! Ответ совпадает с правильным решением. 👏');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } else {
      setPracticeFeedback(
        'Ответ отличается или записан иначе. Нажмите "Показать правильный ответ", чтобы сверить свой ход мыслей.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Top navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Решить другую задачу
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Скопировать весь разбор"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAll ? 'Скопировано!' : 'Копировать всё'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Печать / Сохранить в PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="space-y-6">
        {/* Header summary banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              {solution.subject || 'Предмет'}
            </span>
            {solution.topic && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {solution.topic}
              </span>
            )}
            {solution.difficulty && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900">
                Сложность: {solution.difficulty}
              </span>
            )}
            {solution.confidence && (
              <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Распознано точно
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Разбор задачи
          </h1>

          {/* User photo thumbnail if available */}
          {solution.imagePreview && (
            <div className="my-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
              <img
                src={solution.imagePreview}
                alt="Source problem"
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Исходный снимок задачи
                </p>
                <p>ИИ проанализировал изображение, формулы и графики для построения решения.</p>
              </div>
            </div>
          )}

          {/* Recognized Task Text block */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Условие задачи:
              </span>
              {onReSolveWithText && (
                <button
                  onClick={() => setIsEditingTaskText(!isEditingTaskText)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  {isEditingTaskText ? 'Скрыть правку' : 'Уточнить условие'}
                </button>
              )}
            </div>

            {isEditingTaskText ? (
              <div className="space-y-3 mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={3}
                  className="w-full text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Отредактируйте текст или числа условия..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditedText(solution.recognizedTaskText);
                      setIsEditingTaskText(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (onReSolveWithText && editedText.trim()) {
                        onReSolveWithText(editedText.trim());
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Перерешать с новым текстом
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <MathRenderer content={solution.recognizedTaskText} />
              </div>
            )}
          </div>
        </div>

        {/* HERO: Final Answer Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Финальный ответ
              </span>
              <button
                onClick={handleCopyAnswer}
                className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 transition-colors"
                title="Скопировать только ответ"
              >
                {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAnswer ? 'Скопировано!' : 'Копировать ответ'}</span>
              </button>
            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight my-3 select-all">
              <MathRenderer content={solution.shortAnswer} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/20 mt-4 text-xs text-indigo-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Решение проверено и верифицировано
              </span>
              <button
                onClick={handleCelebrate}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  celebrated
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white shadow-xs'
                }`}
              >
                {celebrated ? 'Отлично! 🎉' : 'Я всё понял! 🎯'}
              </button>
            </div>
          </div>
        </div>

        {/* Given and To Find block if available */}
        {((solution.given && solution.given.length > 0) || solution.toFind) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solution.given && solution.given.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                  Дано:
                </span>
                <ul className="space-y-1.5 text-sm text-slate-800 dark:text-slate-200">
                  {solution.given.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="font-semibold"><MathRenderer content={item.label} /></span>
                      <span className="text-slate-600 dark:text-slate-400"><MathRenderer content={item.value} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solution.toFind && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                  Найти:
                </span>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  <MathRenderer content={solution.toFind} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step-by-step breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
                {solution.steps.length}
              </span>
              Пошаговый ход решения
            </h2>
          </div>

          <div className="space-y-3">
            {solution.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex items-start gap-3.5 mb-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900">
                    {step.stepNumber || idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed pl-10.5 space-y-3">
                  <MathRenderer content={step.explanation} />

                  {step.math && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 font-mono text-sm">
                      <MathRenderer content={step.math} block={true} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Formulas Section */}
        {solution.keyFormulas && solution.keyFormulas.length > 0 && (
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Использованные формулы и теоремы
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {solution.keyFormulas.map((f, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-indigo-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                >
                  <MathRenderer content={f} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification and Common Pitfalls grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solution.checkVerification && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Проверка ответа
              </div>
              <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                <MathRenderer content={solution.checkVerification} />
              </div>
            </div>
          )}

          {solution.pitfallsAndTips && (
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Типичные ошибки и совет эксперта
              </div>
              <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed">
                <MathRenderer content={solution.pitfallsAndTips} />
              </div>
            </div>
          )}
        </div>

        {/* Practice problem section */}
        {solution.similarPracticeProblem && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/20 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Закрепление темы
              </span>
              <span className="text-xs text-slate-400">Попробуйте решить сами</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Аналогичная задача для самопроверки
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 mb-4 leading-relaxed">
              <MathRenderer content={solution.similarPracticeProblem.problem} />
            </div>

            {/* User answer check input */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={practiceAnswerInput}
                onChange={(e) => setPracticeAnswerInput(e.target.value)}
                placeholder="Ваш ответ..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCheckPractice}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-xs"
              >
                Проверить мой ответ
              </button>
            </div>

            {practiceFeedback && (
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                {practiceFeedback}
              </p>
            )}

            {/* Hint & Answer spoilers */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {solution.similarPracticeProblem.hint && (
                <button
                  onClick={() => setShowPracticeHint(!showPracticeHint)}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showPracticeHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                </button>
              )}

              <button
                onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
              >
                {showPracticeAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPracticeAnswer ? 'Скрыть правильный ответ' : 'Показать правильный ответ'}
              </button>
            </div>

            {showPracticeHint && (
              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900">
                <span className="font-bold">Подсказка: </span>
                <MathRenderer content={solution.similarPracticeProblem.hint} />
              </div>
            )}

            {showPracticeAnswer && (
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <span className="font-bold">Правильный ответ: </span>
                <MathRenderer content={solution.similarPracticeProblem.answer} />
              </div>
            )}
          </div>
        )}

        {/* Interactive AI Tutor Chat Section */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div
            onClick={() => setShowChatSection(!showChatSection)}
            className="flex items-center justify-between px-6 py-4 cursor-pointer bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Интерактивный репетитор по этой задаче
                </h3>
                <p className="text-xs text-slate-500">
                  Остались вопросы? Попросите объяснить проще или показать другой способ
                </p>
              </div>
            </div>
            {showChatSection ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {showChatSection && (
            <div className="p-5 sm:p-6 space-y-4">
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendChat('Объясни это решение проще, простыми словами на пальцах.')}
                  disabled={isChatLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors"
                >
                  💡 Объясни проще
                </button>
                <button
                  onClick={() => handleSendChat('Есть ли другой способ решения этой задачи? Покажи его.')}
                  disabled={isChatLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors"
                >
                  🔄 Другой способ решения
                </button>
                <button
                  onClick={() => handleSendChat('Где это правило или формула применяется в реальной жизни?')}
                  disabled={isChatLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors"
                >
                  🌍 Применение в жизни
                </button>
                <button
                  onClick={() => handleSendChat('Объясни подробнее шаг 1 и откуда взялась эта формула.')}
                  disabled={isChatLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition-colors"
                >
                  🔍 Подробнее о шаге 1
                </button>
              </div>

              {/* Chat messages stream */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 pt-2 max-h-96 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <MathRenderer content={msg.text} />
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-500 rounded-bl-xs flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Репетитор формулирует ответ...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Задайте любой вопрос репетитору..."
                  disabled={isChatLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm"
                  title="Отправить"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
