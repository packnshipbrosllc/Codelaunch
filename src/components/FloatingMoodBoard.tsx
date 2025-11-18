// FILE PATH: src/components/FloatingMoodBoard.tsx
// Floating Draggable Mood Board Widget

'use client';

import { useState, useRef, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { useUser } from '@clerk/nextjs';

interface MoodBoardImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
}

interface FloatingMoodBoardProps {
  projectId?: string;
  images?: any[];
  onImagesChange?: Dispatch<SetStateAction<any[]>> | ((images: MoodBoardImage[]) => void);
}

export default function FloatingMoodBoard({
  projectId,
  images: imagesProp,
  onImagesChange,
}: FloatingMoodBoardProps) {
  const { user } = useUser();
  const [internalImages, setInternalImages] = useState<MoodBoardImage[]>([]);
  
  // Use prop images if provided, otherwise use internal state
  const images = imagesProp || internalImages;
  
  // Helper to update images (works with both controlled and uncontrolled)
  const updateImages = useCallback((updater: any) => {
    const newImages = typeof updater === 'function' ? updater(images) : updater;
    
    if (imagesProp && onImagesChange) {
      // Controlled component - update parent state
      // Try Dispatch<SetStateAction> first (can accept function or value)
      try {
        (onImagesChange as Dispatch<SetStateAction<any[]>>)(newImages);
      } catch {
        // Fallback to callback function
        (onImagesChange as (images: MoodBoardImage[]) => void)(newImages);
      }
    } else {
      // Uncontrolled component - update internal state
      setInternalImages(newImages);
      if (onImagesChange) {
        (onImagesChange as (images: MoodBoardImage[]) => void)(newImages);
      }
    }
  }, [images, imagesProp, onImagesChange]);
  
  const setImages = updateImages;
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize position on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: 20, y: window.innerHeight - 420 });
    }
  }, []);

  // Handle widget dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return; // Don't drag when clicking buttons
    
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDraggingWidget(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWidget) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWidget(false);
    };

    if (isDraggingWidget) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWidget, dragOffset]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !user) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      alert('Please upload valid image files');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of validFiles) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: MoodBoardImage = {
            id: `${Date.now()}-${Math.random()}`,
            url: reader.result as string,
            name: file.name,
            uploadedAt: new Date(),
          };

          setImages((prev: MoodBoardImage[]) => {
            const updated = [...prev, newImage];
            onImagesChange?.(updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }, [user, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleRemoveImage = (id: string) => {
    setImages((prev: MoodBoardImage[]) => {
      const updated = prev.filter((img) => img.id !== id);
      onImagesChange?.(updated);
      return updated;
    });
  };

  // Minimized state (just icon)
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 40,
        }}
        className="cursor-move"
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform flex flex-col items-center justify-center gap-1"
        >
          <span className="text-2xl">🎨</span>
          {images.length > 0 && (
            <span className="text-xs font-bold bg-white text-pink-600 rounded-full w-5 h-5 flex items-center justify-center">
              {images.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Collapsed state (mini preview)
  if (!isExpanded) {
    return (
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 40,
        }}
        className="bg-gray-900/95 backdrop-blur-xl border border-pink-500/30 rounded-xl shadow-2xl cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="p-3 flex items-center gap-3 min-w-[280px]">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">🎨</span>
            <div>
              <div className="text-white font-semibold text-sm">Mood Board</div>
              <div className="text-gray-400 text-xs">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </div>
            </div>
          </div>
          
          {/* Mini preview */}
          <div className="flex gap-1">
            {images.slice(0, 3).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.name}
                className="w-10 h-10 rounded object-cover"
              />
            ))}
            {images.length > 3 && (
              <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                +{images.length - 3}
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded transition-all"
              title="Expand"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded transition-all"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state (full gallery)
  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 40,
        width: '360px',
        maxHeight: '500px',
      }}
      className="bg-gray-900/95 backdrop-blur-xl border border-pink-500/30 rounded-xl shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div
        className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-t-xl flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <div>
            <div className="text-white font-bold text-sm">Mood Board</div>
            <div className="text-pink-100 text-xs">Visual inspiration</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded transition-all"
            title="Collapse"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-pink-500 bg-pink-500/10'
              : 'border-gray-700 hover:border-pink-500/50 bg-gray-800/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-2xl mb-1">📸</div>
          <p className="text-white text-xs font-semibold">Upload Images</p>
          <p className="text-gray-400 text-[10px]">Drag & drop or click</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="mt-2 bg-purple-500/20 border border-purple-500/50 rounded-lg p-2 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-purple-300">Uploading...</span>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-2 scrollbar-thin scrollbar-thumb-pink-500/50 scrollbar-track-gray-800">
        {images.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2 opacity-20">🖼️</div>
            <p className="text-gray-500 text-xs">No images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-pink-500/50 transition-all"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg text-xs"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {images.length > 0 && (
        <div className="p-3 bg-gray-800/50 border-t border-gray-700/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Images</span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-2 py-1 rounded-full">
              {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

