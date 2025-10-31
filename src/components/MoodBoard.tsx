// FILE PATH: src/components/MoodBoard.tsx
// Mood Board Panel - Left sidebar for React Flow page

'use client';

import { useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface MoodBoardImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
}

interface MoodBoardProps {
  projectId?: string;
  onImagesChange?: (images: MoodBoardImage[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function MoodBoard({
  projectId,
  onImagesChange,
  isCollapsed = false,
  onToggleCollapse,
}: MoodBoardProps) {
  const { user } = useUser();
  const [images, setImages] = useState<MoodBoardImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
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
        // Convert to base64 for preview (in production, upload to Supabase)
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: MoodBoardImage = {
            id: `${Date.now()}-${Math.random()}`,
            url: reader.result as string,
            name: file.name,
            uploadedAt: new Date(),
          };

          setImages((prev) => {
            const updated = [...prev, newImage];
            onImagesChange?.(updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);

        // TODO: Upload to Supabase Storage
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('projectId', projectId || '');
        // await fetch('/api/upload-moodboard', { method: 'POST', body: formData });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

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
  }, []);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      onImagesChange?.(updated);
      return updated;
    });
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-600 to-purple-700 text-white px-3 py-8 rounded-r-xl shadow-2xl hover:from-pink-500 hover:to-purple-600 transition-all z-50 border-r-4 border-pink-400"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🎨</span>
          <span className="text-xs font-semibold writing-mode-vertical">Mood Board</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-gray-900/95 backdrop-blur-xl border-r border-pink-500/30 shadow-2xl flex flex-col z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🎨</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Mood Board</h3>
            <p className="text-xs text-pink-100">Visual inspiration</p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          title="Collapse panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Upload Area */}
      <div className="p-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-pink-500 bg-pink-500/10'
              : 'border-gray-700 hover:border-pink-500/50 bg-gray-800/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-white font-semibold mb-1">Upload Images</p>
          <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
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
          <div className="mt-3 bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-purple-300">Uploading images...</span>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-pink-500/50 scrollbar-track-gray-800">
        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-20">🖼️</div>
            <p className="text-gray-500 text-sm">No images yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Upload inspiration images to help AI understand your vision
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-pink-500/50 transition-all"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  title="Remove image"
                >
                  ×
                </button>
                <div className="p-2 bg-gray-900/90 backdrop-blur-sm">
                  <p className="text-xs text-gray-300 truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Count */}
      {images.length > 0 && (
        <div className="p-4 bg-gray-800/50 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Images</span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-3 py-1 rounded-full">
              {images.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI will use these images to understand your design preferences
          </p>
        </div>
      )}
    </div>
  );
}

