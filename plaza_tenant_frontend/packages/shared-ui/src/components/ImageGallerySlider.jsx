import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { cn } from '../utils/cn';

export function parseImageGallery(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

export function ImageGallerySlider({
  images = [],
  resolveUrl = (url) => url,
  title = 'Foto Lampiran Sanggahan',
  className = '',
  maxHeightClass = 'max-h-56',
  badgePrefix = 'Revisi #'
}) {
  const parsedList = React.useMemo(() => {
    const raw = parseImageGallery(images);
    return raw.map(item => resolveUrl(item)).filter(Boolean);
  }, [images, resolveUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Keep index within bounds if images change
  useEffect(() => {
    if (currentIndex >= parsedList.length && parsedList.length > 0) {
      setCurrentIndex(parsedList.length - 1);
    }
  }, [parsedList.length, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : parsedList.length - 1));
  }, [parsedList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < parsedList.length - 1 ? prev + 1 : 0));
  }, [parsedList.length]);

  // Scoped Container Keyboard navigation (WCAG 2.1.1 / 2.1.4 compliant)
  const handleContainerKeyDown = (e) => {
    if (parsedList.length <= 1) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleDownload = async () => {
    if (!currentUrl) return;
    const fileName = currentUrl.split('/').pop()?.split('?')[0] || `Lampiran_${currentIndex + 1}.jpg`;
    try {
      const res = await fetch(currentUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = currentUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (parsedList.length === 0) return null;

  const currentUrl = parsedList[currentIndex];
  const isMultiple = parsedList.length > 1;

  return (
    <div
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      role="region"
      aria-label={`Galeri ${title}`}
      className={cn('flex flex-col gap-2 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-xl p-1', className)}
    >
      {/* Header Bar with Count & Navigation */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-text">
          <span>{title}</span>
          {isMultiple && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900 border border-amber-300">
              {badgePrefix}{currentIndex + 1} ({currentIndex + 1} dari {parsedList.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="text-[11px] font-bold text-text-2 hover:text-red flex items-center gap-1 cursor-pointer transition-colors"
            title={isZoomed ? 'Kecilkan' : 'Perbesar'}
            aria-label={isZoomed ? 'Kecilkan tampilan gambar' : 'Perbesar tampilan gambar'}
          >
            <Icon icon={isZoomed ? 'heroicons:magnifying-glass-minus-20-solid' : 'heroicons:magnifying-glass-plus-20-solid'} className="size-3.5" />
            <span>{isZoomed ? 'Kecilkan' : 'Perbesar'}</span>
          </button>
          <span className="text-border text-xs">|</span>
          <button
            type="button"
            onClick={handleDownload}
            className="text-[11px] font-bold text-red hover:underline flex items-center gap-1 cursor-pointer me-1 transition-colors"
            title="Unduh foto lampiran"
            aria-label="Unduh foto lampiran"
          >
            <Icon icon="heroicons:arrow-down-tray-20-solid" className="size-3.5" />
            <span>Unduh</span>
          </button>

          {isMultiple && (
            <div className="flex items-center gap-1 bg-white border border-border/80 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Foto Sebelumnya"
                className="size-6 flex items-center justify-center rounded hover:bg-mono-100 active:scale-95 text-text cursor-pointer transition-colors"
                title="Sebelumnya (Tombol Panah Kiri)"
              >
                <Icon icon="heroicons:chevron-left-20-solid" className="size-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-text-2">
                {currentIndex + 1}/{parsedList.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Foto Berikutnya"
                className="size-6 flex items-center justify-center rounded hover:bg-mono-100 active:scale-95 text-text cursor-pointer transition-colors"
                title="Berikutnya (Tombol Panah Kanan)"
              >
                <Icon icon="heroicons:chevron-right-20-solid" className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Slide Viewer Frame */}
      <div
        className={cn(
          'relative w-full bg-mono-100/40 rounded-xl border border-border/80 overflow-hidden flex items-center justify-center p-2 transition-all group',
          isZoomed ? 'max-h-[32rem]' : maxHeightClass
        )}
      >
        <button
          type="button"
          onClick={() => window.open(currentUrl, '_blank')}
          aria-label={`Buka ${title} #${currentIndex + 1} dalam ukuran penuh di tab baru`}
          className="flex items-center justify-center max-h-full max-w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-lg"
          title="Klik untuk membuka ukuran penuh di tab baru"
        >
          <img
            key={currentUrl}
            src={currentUrl}
            alt={`${title} #${currentIndex + 1}`}
            loading="lazy"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xs transition-transform duration-200"
          />
        </button>

        {/* Floating Side Chevron Buttons for Large Multiple Galleries */}
        {isMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/90 hover:bg-white text-text border border-border/80 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer z-10 active:scale-90"
              aria-label="Foto Sebelumnya"
            >
              <Icon icon="heroicons:chevron-left-20-solid" className="size-4.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/90 hover:bg-white text-text border border-border/80 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer z-10 active:scale-90"
              aria-label="Foto Berikutnya"
            >
              <Icon icon="heroicons:chevron-right-20-solid" className="size-4.5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row / Indicator Dots */}
      {isMultiple && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin">
          {parsedList.map((thumbUrl, idx) => (
            <button
              key={`thumb-${idx}-${thumbUrl}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Buka Foto Sanggahan #${idx + 1}`}
              aria-pressed={currentIndex === idx}
              className={cn(
                'relative shrink-0 size-11 rounded-lg border-2 overflow-hidden bg-white cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red',
                currentIndex === idx
                  ? 'border-red ring-2 ring-red/20 shadow-xs scale-105'
                  : 'border-border/70 opacity-60 hover:opacity-100'
              )}
            >
              <img
                src={thumbUrl}
                alt={`Thumbnail #${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center leading-tight">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallerySlider;
