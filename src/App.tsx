import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Clipboard,
  Sparkles,
  History,
  BookOpen,
  HelpCircle,
  Crop,
  Trash2,
  CheckCircle2,
  Atom,
  Binary,
  Layers,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { TaskSolution, SolvingMode } from './types.ts';
import { PRESET_DEMOS } from './data/presetDemos.ts';
import { CameraModal } from './components/CameraModal.tsx';
import { ImageCropModal } from './components/ImageCropModal.tsx';
import { SolutionView } from './components/SolutionView.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';

const SUBJECT_OPTIONS = [
  { id: 'auto', label: 'Автоопределение', icon: Sparkles },
  { id: 'Алгебра и начала анализа', label: 'Алгебра', icon: Layers },
  { id: 'Геометрия и тригонометрия', label: 'Геометрия', icon: BookOpen },
  { id: 'Физика', label: 'Физика', icon: Atom },
  { id: 'Химия', label: 'Химия', icon: Sparkles },
  { id: 'Информатика и программирование', label: 'Информатика', icon: Binary },
  { id: 'Русский язык и литература', label: 'Языки', icon: FileText },
];

const SOLVING_MODES: { id: SolvingMode; title: string; desc: string; icon: any }[] = [
  {
    id: 'step_by_step',
    title: 'Пошаговый разбор',
    desc: 'Каждое действие с формулами и теоремами',
    icon: Layers,
  },
  {
    id: 'quick_answer',
    title: 'Быстрый ответ',
    desc: 'Только суть и финальный результат',
    icon: CheckCircle2,
  },
  {
    id: 'hint_only',
    title: 'Подсказка Сократа',
    desc: 'Направляет к решению без спойлеров',
    icon: Lightbulb,
  },
  {
    id: 'practice',
    title: 'С тренировкой',
    desc: 'Решение + аналогичная задача',
    icon: BookOpen,
  },
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('auto');
  const [selectedMode, setSelectedMode] = useState<SolvingMode>('step_by_step');
  
  // Modals & UI States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Solving states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Анализ задачи...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentSolution, setCurrentSolution] = useState<TaskSolution | null>(null);

  // History in localStorage
  const [history, setHistory] = useState<TaskSolution[]>(() => {
    try {
      const saved = localStorage.getItem('ai_solver_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_solver_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Global paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setSelectedImage(event.target.result as string);
                setErrorMessage(null);
              }
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Пожалуйста, выберите файл изображения (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setSelectedImage(event.target.result as string);
              setErrorMessage(null);
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      setErrorMessage('В буфере обмена нет изображения. Скопируйте картинку или скриншот и нажмите снова.');
    } catch {
      setErrorMessage('Используйте сочетание клавиш Ctrl+V (или Cmd+V) для вставки из буфера.');
    }
  };

  const handleSolve = async (overrideText?: string) => {
    if (!selectedImage && !overrideText && !additionalNote.trim()) {
      setErrorMessage('Сделайте снимок, загрузите фото задачи или введите её текст.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Realistic progressive loading step indicator
    const steps = [
      'Распознавание рукописного и печатного текста...',
      'Определение предмета и проверка условий...',
      'Построение математической модели...',
      'Пошаговое вычисление с проверкой...',
    ];
    let stepIndex = 0;
    setLoadingStepText(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStepText(steps[stepIndex]);
    }, 1800);

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          taskText: overrideText || additionalNote || undefined,
          subject: selectedSubject,
          mode: selectedMode,
          additionalInstructions: additionalNote,
        }),
      });

      clearInterval(stepInterval);
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Не удалось решить задачу');
      }

      const solutionData = resData.data;
      const fullSolution: TaskSolution = {
        ...solutionData,
        id: Date.now().toString(),
        timestamp: Date.now(),
        imagePreview: selectedImage || undefined,
        userPrompt: additionalNote || undefined,
        mode: selectedMode,
      };

      setCurrentSolution(fullSolution);
      setHistory((prev) => [fullSolution, ...prev]);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Solve error:', err);
      setErrorMessage(
        err.message || 'Произошла ошибка при обращении к ИИ. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = (preset: typeof PRESET_DEMOS[0]) => {
    setSelectedImage(preset.previewImage);
    setSelectedSubject(preset.subject);
    setAdditionalNote('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setCurrentSolution(null);
              setErrorMessage(null);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                AI Решатель <span className="text-indigo-600 dark:text-indigo-400">по Фото</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Мгновенный пошаговый разбор задач по фотографии
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Gemini 3.8 Flash
            </span>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs flex items-center gap-2 text-xs font-semibold"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">История</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {currentSolution ? (
          <SolutionView
            solution={currentSolution}
            onBack={() => setCurrentSolution(null)}
            onReSolveWithText={(updatedText) => handleSolve(updatedText)}
          />
        ) : (
          <div className="space-y-10">
            {/* Hero Title */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                Алгебра • Геометрия • Физика • Химия • ОГЭ и ЕГЭ
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Сфотографируйте задачу — <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  получите решение за секунды
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                ИИ распознает рукописный текст, формулы, чертежи и таблицы, объяснит каждый шаг и ответит на любые ваши вопросы.
              </p>
            </div>

            {/* Subject Selector Tabs */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-1.5 scrollbar-none">
              {SUBJECT_OPTIONS.map((sub) => {
                const Icon = sub.icon;
                const isActive = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Не удалось продолжить</p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-xs font-semibold underline text-rose-700 hover:text-rose-900"
                >
                  Закрыть
                </button>
              </div>
            )}

            {/* Main Upload / Viewfinder Box */}
            <div className="max-w-3xl mx-auto">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-3xl border-2 transition-all p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xl ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/20 scale-[1.01]'
                    : selectedImage
                    ? 'border-indigo-400/80 dark:border-indigo-600/60'
                    : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {selectedImage ? (
                  /* Image Preview Mode */
                  <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-[420px] flex items-center justify-center border border-slate-800 shadow-inner">
                      <img
                        src={selectedImage}
                        alt="Task upload"
                        className="max-h-[400px] w-auto max-w-full object-contain"
                      />

                      {/* Image action buttons */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => setIsCropOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-md border border-slate-700 flex items-center gap-1.5 shadow-lg transition-colors"
                        >
                          <Crop className="w-3.5 h-3.5 text-indigo-400" />
                          Обрезать / Фокус
                        </button>
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold backdrop-blur-md shadow-lg transition-colors"
                          title="Удалить фото"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mode selection row */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Режим решения:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SOLVING_MODES.map((m) => {
                          const Icon = m.icon;
                          const isSel = selectedMode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMode(m.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                isSel
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                                <Icon className="w-3.5 h-3.5" />
                                {m.title}
                              </div>
                              <p className="text-[11px] opacity-75 line-clamp-1">{m.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional note / user prompt */}
                    <div>
                      <input
                        type="text"
                        value={additionalNote}
                        onChange={(e) => setAdditionalNote(e.target.value)}
                        placeholder="Уточнение (например: 'Реши только пункт Б' или 'Найди косинус угла')"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>

                    {/* Primary Solve Action Button */}
                    <button
                      onClick={() => handleSolve()}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-base sm:text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{loadingStepText}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Решить задачу с помощью ИИ</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Initial Upload Buttons State */
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Загрузите или сфотографируйте задачу
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Перетащите изображение сюда или используйте кнопки ниже
                      </p>
                    </div>

                    {/* Action buttons grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/25 flex flex-col items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Camera className="w-5 h-5" />
                        Снять на камеру
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98"
                      >
                        <Upload className="w-5 h-5 text-indigo-500" />
                        Выбрать файл
                      </button>

                      <button
                        onClick={handlePasteClick}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98"
                      >
                        <Clipboard className="w-5 h-5 text-indigo-500" />
                        Из буфера (Ctrl+V)
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Quick Manual text entry option */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Поддерживаются рукописные записи в тетради, учебники, тесты и скриншоты
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Presets & Demo Tasks Showcase */}
            <div className="space-y-4 max-w-4xl mx-auto pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Примеры задач для мгновенной проверки
                  </h3>
                  <p className="text-xs text-slate-500">
                    Нажмите на любой образец, чтобы протестировать решение в один клик
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {PRESET_DEMOS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs hover:shadow-md flex flex-col"
                  >
                    <div className="h-32 bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                      <img
                        src={preset.previewImage}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {preset.badge}
                      </span>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                          {preset.subject}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 mb-1">
                          {preset.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span>Попробовать</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 text-slate-700 dark:text-slate-300">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Любые источники фото
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Понимает фото с мобильной камеры, загруженные файлы, скриншоты экрана и вставку из буфера обмена.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Пошаговое объяснение
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Не просто сухой ответ, а подробный разбор с формулами в LaTeX, теоремами и проверкой результата.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Интерактивный репетитор
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Задавайте уточняющие вопросы: «объясни проще», «покажи другой метод», «проверь моё решение».
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <p>AI Решатель Задач по Фото • Работает на базе Google Gemini 3.8 Flash</p>
      </footer>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setSelectedImage(img);
          setErrorMessage(null);
        }}
      />

      {/* Image Crop Modal */}
      {selectedImage && (
        <ImageCropModal
          isOpen={isCropOpen}
          imageSrc={selectedImage}
          onClose={() => setIsCropOpen(false)}
          onApplyCrop={(cropped) => setSelectedImage(cropped)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectSolution={(sol) => setCurrentSolution(sol)}
        onDeleteSolution={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
        onClearAll={() => setHistory([])}
      />
    </div>
  );
}
