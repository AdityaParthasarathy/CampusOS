'use client';

import React, { useRef, useState } from 'react';
import { uploadImageToCloudinary, CloudinaryUploadError } from '@/lib/cloudinary';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerPicker = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-selected after clearing
    e.target.value = '';

    setError(null);
    setUploading(true);

    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(
        err instanceof CloudinaryUploadError
          ? err.message
          : 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-text-gray ml-2 uppercase tracking-[0.2em]">
        Photo
      </label>

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {/* Trigger button — only shown when no image is selected */}
      {!value && (
        <button
          type="button"
          onClick={triggerPicker}
          disabled={disabled || uploading}
          className="w-full h-14 bg-white/80 backdrop-blur-xl border border-dashed border-primary-teal/30 rounded-2xl flex items-center justify-center gap-3 text-text-gray font-bold text-sm hover:border-primary-teal/60 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-teal/30 border-t-primary-teal rounded-full animate-spin shrink-0" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <span className="text-lg">📷</span>
              <span>Add Photo</span>
            </>
          )}
        </button>
      )}

      {/* Preview — shown once a URL exists */}
      {value && (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary-teal/10 bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />

          {/* Upload-in-progress overlay (e.g. after "Change" tap) */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Clear button */}
          {!uploading && (
            <>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                aria-label="Remove photo"
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-50 text-sm font-bold"
              >
                ✕
              </button>

              {/* Change button */}
              <button
                type="button"
                onClick={triggerPicker}
                disabled={disabled}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/50 text-white text-xs font-bold rounded-full hover:bg-black/70 transition-all disabled:opacity-50"
              >
                Change
              </button>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-secondary-coral font-bold ml-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
