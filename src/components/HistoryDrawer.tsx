import React, { useState } from 'react';
import { History, X, Trash2, Search, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { TaskSolution } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TaskSolution[];
  onSelectSolution: (solution: TaskSolution) => void;
  onDeleteSolution: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectSolution,
  onDeleteSolution,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.subject?.toLowerCase().includes(query) ||
      item.topic?.toLowerCase().includes(query) ||
      item.recognizedTaskText?.toLowerCase().includes(query) ||
      item.shortAnswer?.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">История решений</h2>
              <p className="text-xs text-slate-500">
                {history.length} {history.length === 1 ? 'сохранённая задача' : 'сохранённых задач'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по предмету, формуле или теме..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <BookOpen className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">История пуста</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Решённые вами задачи автоматически сохраняются здесь, чтобы вы могли вернуться к ним в любой момент.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Ничего не найдено по запросу &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectSolution(item);
                  onClose();
                }}
                className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {item.subject}
                    </span>
                    {item.topic && (
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                        {item.topic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSolution(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                    title="Удалить из истории"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-medium mb-2">
                  {item.recognizedTaskText}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Открыть <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Очистить всю историю решений?')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Очистить всю историю
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
