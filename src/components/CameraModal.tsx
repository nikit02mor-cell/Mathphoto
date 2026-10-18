import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsReady(false);
    setHasCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsReady(true));
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasCameraError(
        'Не удалось получить доступ к камере. Убедитесь, что вы разрешили доступ в настройках браузера, или загрузите фото файлом.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Камера</h3>
              <p className="text-xs text-slate-400">Наведите на задачу в тетради или учебнике</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] max-h-[550px] overflow-hidden">
          {hasCameraError ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-200 text-sm mb-4 leading-relaxed">{hasCameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Повторить попытку
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isReady ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Viewfinder frame overlay */}
              <div className="absolute inset-8 pointer-events-none border-2 border-indigo-400/60 rounded-xl">
                {/* Corner highlights */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br" />

                {/* Grid guidelines */}
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              </div>

              {/* Instruction banner */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-200 shadow-md">
                Держите камеру ровно при хорошем освещении
              </div>
            </>
          )}
        </div>

        {/* Controls footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="p-3 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
            title="Переключить камеру"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Сменить камеру</span>
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isReady || !!hasCameraError}
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            title="Сделать снимок"
          >
            <div className="w-13 h-13 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600" />
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
