import React, { useState, useRef, useEffect } from 'react';
import { Crop, RotateCw, Check, X, Sparkles } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApplyCrop: (croppedBase64: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [rotation, setRotation] = useState<number>(0);
  
  // Crop rect as percentage (0 to 100)
  const [crop, setCrop] = useState({ x: 10, y: 15, width: 80, height: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setCrop({ x: 10, y: 15, width: 80, height: 70 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCrop((prev) => {
      let next = { ...prev };

      if (activeHandle === 'move') {
        const nextX = Math.max(0, Math.min(100 - prev.width, prev.x + deltaXPercent));
        const nextY = Math.max(0, Math.min(100 - prev.height, prev.y + deltaYPercent));
        next.x = nextX;
        next.y = nextY;
      } else if (activeHandle === 'se') {
        next.width = Math.max(15, Math.min(100 - prev.x, prev.width + deltaXPercent));
        next.height = Math.max(15, Math.min(100 - prev.y, prev.height + deltaYPercent));
      } else if (activeHandle === 'nw') {
        const newWidth = Math.max(15, prev.width - deltaXPercent);
        const newHeight = Math.max(15, prev.height - deltaYPercent);
        const newX = Math.max(0, prev.x + deltaXPercent);
        const newY = Math.max(0, prev.y + deltaYPercent);
        if (newX >= 0 && newX + newWidth <= 100) {
          next.x = newX;
          next.width = newWidth;
        }
        if (newY >= 0 && newY + newHeight <= 100) {
          next.y = newY;
          next.height = newHeight;
        }
      }

      return next;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const applyCrop = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // First handle rotation on an intermediate canvas or direct transform
      const isRotated = rotation % 180 !== 0;
      const naturalWidth = isRotated ? img.naturalHeight : img.naturalWidth;
      const naturalHeight = isRotated ? img.naturalWidth : img.naturalHeight;

      // Target cropped pixel area
      const cropPxX = (crop.x / 100) * naturalWidth;
      const cropPxY = (crop.y / 100) * naturalHeight;
      const cropPxW = (crop.width / 100) * naturalWidth;
      const cropPxH = (crop.height / 100) * naturalHeight;

      canvas.width = Math.max(10, Math.round(cropPxW));
      canvas.height = Math.max(10, Math.round(cropPxH));

      // Draw rotated image shifted to crop coordinate
      ctx.save();
      ctx.translate(-cropPxX, -cropPxY);

      if (rotation !== 0) {
        if (rotation === 90) {
          ctx.translate(naturalWidth, 0);
          ctx.rotate((90 * Math.PI) / 180);
        } else if (rotation === 180) {
          ctx.translate(naturalWidth, naturalHeight);
          ctx.rotate((180 * Math.PI) / 180);
        } else if (rotation === 270) {
          ctx.translate(0, naturalHeight);
          ctx.rotate((270 * Math.PI) / 180);
        }
      }

      ctx.drawImage(img, 0, 0);
      ctx.restore();

      const resultBase64 = canvas.toDataURL('image/jpeg', 0.92);
      onApplyCrop(resultBase64);
      onClose();
    };

    img.src = imageSrc;
  };

  const useOriginal = () => {
    if (rotation === 0) {
      onApplyCrop(imageSrc);
      onClose();
      return;
    }

    // Apply rotation only
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isRotated = rotation % 180 !== 0;
      canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
      canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      if (rotation === 90) {
        ctx.translate(canvas.width, 0);
        ctx.rotate((90 * Math.PI) / 180);
      } else if (rotation === 180) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate((180 * Math.PI) / 180);
      } else if (rotation === 270) {
        ctx.translate(0, canvas.height);
        ctx.rotate((270 * Math.PI) / 180);
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      onApplyCrop(canvas.toDataURL('image/jpeg', 0.92));
      onClose();
    };
    img.src = imageSrc;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Кадрирование и фокус на задаче</h3>
              <p className="text-xs text-slate-400">Выделите конкретную задачу рамкой или поверните фото</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Повернуть на 90°"
            >
              <RotateCw className="w-4 h-4" /> Повернуть {rotation !== 0 && `(${rotation}°)`}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="relative flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-hidden min-h-[360px] max-h-[550px]">
          <div
            ref={containerRef}
            className="relative select-none max-w-full max-h-[480px] shadow-lg rounded-lg overflow-hidden border border-slate-800"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="max-h-[450px] max-w-full object-contain pointer-events-none block"
            />

            {/* Darkened overlay outside crop rect */}
            <div
              className="absolute inset-0 bg-black/55 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% 0%,
                  ${crop.x}% ${crop.y}%,
                  ${crop.x}% ${crop.y + crop.height}%,
                  ${crop.x + crop.width}% ${crop.y + crop.height}%,
                  ${crop.x + crop.width}% ${crop.y}%,
                  ${crop.x}% ${crop.y}%
                )`,
              }}
            />

            {/* Crop selection box */}
            <div
              className="absolute border-2 border-indigo-400 bg-indigo-500/10 cursor-move rounded"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              {/* Corner resize handle NW */}
              <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow"
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
              />
              {/* Corner resize handle SE */}
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow"
                onMouseDown={(e) => handleMouseDown(e, 'se')}
              />

              {/* Center badge */}
              <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow pointer-events-none flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Область задачи
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={useOriginal}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-medium"
          >
            Использовать целиком
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={applyCrop}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Применить выделение
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
