"use client";

import { useState, useEffect } from 'react';

export interface AvatarState {
  skin: string;
  hair: string;
  hairColor: string;
  eyes: string;
  eyeColor: string;
  mouth: string;
  clothes: string;
  color: string;       // clothes color
  bgColor: string;     // background circle color
  accessory: string;
}

export const DEFAULT_AVATAR: AvatarState = {
  skin:      '#F1C27D',
  hair:      'short',
  hairColor: '#3B2314',
  eyes:      'round',
  eyeColor:  '#4A3728',
  mouth:     'smile',
  clothes:   'tshirt',
  color:     '#00C2CB',
  bgColor:   '#E0F7FA',
  accessory: 'none',
};

/** Migrate old-format avatars to the new schema */
export function migrateAvatar(raw: Record<string, string>): AvatarState {
  const hairMap: Record<string, string> = {
    style1: 'short', style2: 'long', style3: 'curly', style4: 'bun',
  };
  const eyeMap: Record<string, string> = {
    normal: 'round', blink: 'sleepy', wink: 'wink', cool: 'almond',
  };
  const mouthMap: Record<string, string> = {
    smile: 'smile', laugh: 'open', neutral: 'neutral', surprise: 'surprise',
  };
  return {
    skin:      raw.skin      || DEFAULT_AVATAR.skin,
    hair:      hairMap[raw.hair] || raw.hair || DEFAULT_AVATAR.hair,
    hairColor: raw.hairColor || raw.color  || DEFAULT_AVATAR.hairColor,
    eyes:      eyeMap[raw.eyes]  || raw.eyes  || DEFAULT_AVATAR.eyes,
    eyeColor:  raw.eyeColor  || DEFAULT_AVATAR.eyeColor,
    mouth:     mouthMap[raw.mouth] || raw.mouth || DEFAULT_AVATAR.mouth,
    clothes:   raw.clothes   || DEFAULT_AVATAR.clothes,
    color:     raw.color     || DEFAULT_AVATAR.color,
    bgColor:   raw.bgColor   || DEFAULT_AVATAR.bgColor,
    accessory: raw.accessory || DEFAULT_AVATAR.accessory,
  };
}

export const useAvatar = () => {
  const [avatar, setAvatarState] = useState<AvatarState>(DEFAULT_AVATAR);

  useEffect(() => {
    const saved = localStorage.getItem('campus_os_avatar');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAvatarState(migrateAvatar(parsed));
      } catch (e) {
        console.error('Failed to load avatar', e);
      }
    }
  }, []);

  const setAvatar = (newState: AvatarState) => {
    setAvatarState(newState);
    localStorage.setItem('campus_os_avatar', JSON.stringify(newState));
  };

  return { avatar, setAvatar };
};
