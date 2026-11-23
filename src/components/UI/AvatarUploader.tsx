'use client';

import React, { useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { Camera, Trash2, Sparkles, Upload } from 'lucide-react';

interface AvatarUploaderProps {
  name: string;
  avatarUrl: string | null;
  onChange: (url: string | null) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Asad',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Abdullah',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milon',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Monir',
  'https://api.dicebear.com/7.x/bottts/svg?seed=BroAdmin',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Hero',
];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  name,
  avatarUrl,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Resize and compress image to small Base64 string (< 30 KB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold text-navy-800">
        Profile Picture
      </label>

      <div className="flex items-center gap-3">
        {/* Preview */}
        <div className="relative group">
          <Avatar name={name || 'BS'} avatarUrl={avatarUrl} size="xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Upload photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-900 text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-accent" />
              {isProcessing ? 'Processing...' : 'Upload Photo'}
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-text-secondary">
            JPG, PNG or choose a preset avatar below
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Preset Avatars */}
      <div>
        <span className="text-[10px] uppercase font-bold text-text-secondary flex items-center gap-1 mb-1">
          <Sparkles className="w-2.5 h-2.5 text-accent" /> Preset Avatars
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {PRESET_AVATARS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(url)}
              className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                avatarUrl === url
                  ? 'border-accent scale-105 shadow-xs'
                  : 'border-white/80 hover:border-navy-300'
              }`}
            >
              <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover bg-navy-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
