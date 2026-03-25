"use client";

import { useState, useEffect } from 'react';

export interface AvatarState {
  skin: string;
  hair: string;
  eyes: string;
  mouth: string;
  clothes: string;
  accessory: string;
  color: string;
}

const DEFAULT_AVATAR: AvatarState = {
  skin: '#FFDBAC',
  hair: 'style1',
  eyes: 'normal',
  mouth: 'smile',
  clothes: 'shirt',
  accessory: 'none',
  color: '#00C2CB',
};

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<AvatarState>(DEFAULT_AVATAR);

  useEffect(() => {
    const saved = localStorage.getItem('campus_os_avatar');
    if (saved) {
      try {
        setAvatar(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load avatar", e);
      }
    }
  }, []);

  const saveAvatar = (newState: AvatarState) => {
    setAvatar(newState);
    localStorage.setItem('campus_os_avatar', JSON.stringify(newState));
  };

  return { avatar, setAvatar: saveAvatar };
};
