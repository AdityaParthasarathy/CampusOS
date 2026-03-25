"use client";

import React from 'react';
import { useAvatar, AvatarState } from '@/hooks/useAvatar';
import { PrimaryButton } from './PrimaryButton';
import { AvatarDisplay } from './AvatarDisplay';

export const AvatarBuilder: React.FC<{ onSave?: (state: AvatarState) => void }> = ({ onSave }) => {
  const { avatar, setAvatar } = useAvatar();

  const options = {
    hair: ['style1', 'style2', 'style3', 'style4'],
    eyes: ['normal', 'blink', 'wink', 'cool'],
    mouth: ['smile', 'laugh', 'neutral', 'surprise'],
    clothes: ['shirt', 'hoodie', 'v-neck', 'tank'],
    accessory: ['none', 'glasses', 'headphones', 'cap'],
    skin: ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'],
    color: ['#00C2CB', '#FF6B6B', '#32D296', '#FFD166', '#1F1F1F'],
  };

  const updateAvatar = (key: keyof AvatarState, value: string) => {
    setAvatar({ ...avatar, [key]: value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center p-4">
      {/* Preview */}
      <div className="relative w-64 h-64 bg-white rounded-[3rem] border-4 border-primary-teal/20 p-4 shadow-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-teal/5 to-secondary-coral/5 -z-10" />
        
        <AvatarDisplay avatar={avatar} className="w-40 h-40 !border-transparent !shadow-none !bg-transparent" />

        {/* Floating Accessories Placeholder */}
        {avatar.accessory !== 'none' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-4xl">
            {avatar.accessory === 'glasses' ? '👓' : avatar.accessory === 'headphones' ? '🎧' : '🧢'}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-6 w-full">
        {Object.entries(options).map(([key, vals]) => (
          <div key={key} className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-gray ml-1">{key}</span>
            <div className="flex flex-wrap gap-2">
              {vals.map((v) => (
                <button
                  key={v}
                  onClick={() => updateAvatar(key as keyof AvatarState, v)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    avatar[key as keyof AvatarState] === v 
                      ? 'border-primary-teal scale-110 shadow-md' 
                      : 'border-transparent hover:border-primary-teal/30 hover:bg-white'
                  }`}
                  style={{ backgroundColor: key === 'skin' || key === 'color' ? v : '#F3F4F6' }}
                >
                  {key !== 'skin' && key !== 'color' && (
                    <span className="text-[8px] font-bold text-text-gray overflow-hidden">
                      {v[0]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <PrimaryButton type="button" onClick={() => onSave?.(avatar)} className="w-full rounded-2xl">
            Looks Good!
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
