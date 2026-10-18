import React, { useState } from 'react';
import { Smartphone, Download, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running inside standalone app, no need to show install button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
        title="Установить приложение на телефон"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Скачать на Android</span>
      </button>

      {/* Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Установка на Android
                  </h3>
                  <p className="text-xs text-slate-400">Без Play Маркета — мгновенно и бесплатно</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
                <p className="font-semibold mb-1 flex items-center gap-1.5 text-xs">
                  <Check className="w-3.5 h-3.5" /> Официальный стандарт PWA (Progressive Web App)
                </p>
                <p className="text-[11px] opacity-90">
                  Приложение работает как нативное: открывается на весь экран без рамок браузера, сохраняет историю оффлайн и мгновенно подключает камеру.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Откройте ссылку в Chrome на Android:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 select-all font-mono break-all bg-slate-100 dark:bg-slate-950 p-1.5 rounded">
                      {window.location.origin}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">В меню браузера (три точки ⋮ вверху справа):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Нажмите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Готово!</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Иконка «Решатель» появится среди ваших приложений на телефоне.
                    </p>
                  </div>
                </div>
              </div>

              {isIOS && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                    Для iPhone / iPad (iOS):
                  </span>
                  <p className="text-[11px] text-indigo-800 dark:text-indigo-300/90 flex items-center gap-1">
                    Нажмите кнопку <Share2 className="w-3.5 h-3.5 inline" /> («Поделиться») в Safari и выберите <PlusSquare className="w-3.5 h-3.5 inline" /> <strong>«На экран Домой»</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              {isInstallable ? (
                <button
                  onClick={() => {
                    install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  Установить прямо сейчас
                </button>
              ) : (
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Понятно
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
