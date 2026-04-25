"use client";

import React from 'react';
import ReactNiceAvatar from 'react-nice-avatar';
import { AvatarState, DEFAULT_AVATAR, migrateAvatar } from '@/hooks/useAvatar';

interface AvatarDisplayProps {
  avatar:        AvatarState | string | null | undefined;
  className?:    string;
  fallbackSeed?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  className = 'w-10 h-10',
  fallbackSeed = 'fallback',
}) => {

  /* ── No avatar at all → DiceBear lorelei ── */
  if (!avatar) {
    return (
      <img
        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${fallbackSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
        alt="Avatar"
        className={`${className} object-cover rounded-full bg-white`}
      />
    );
  }

  /* ── URL string (Google photo or legacy DiceBear) ── */
  if (typeof avatar === 'string') {
    // Upgrade old goofy avataaars URLs to lorelei silently
    if (avatar.includes('dicebear') && avatar.includes('avataaars')) {
      const seed = avatar.split('seed=')[1]?.split('&')[0] || fallbackSeed;
      return (
        <img
          src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
          alt="Avatar"
          className={`${className} object-cover rounded-full bg-white`}
        />
      );
    }
    return (
      <img
        src={avatar}
        alt="Avatar"
        className={`${className} object-cover rounded-full bg-white`}
      />
    );
  }

  /* ── AvatarState object → react-nice-avatar ── */
  const config: AvatarState =
    (avatar as AvatarState).sex !== undefined
      ? (avatar as AvatarState)
      : migrateAvatar(avatar as unknown as Record<string, string>);

  return (
    <ReactNiceAvatar
      className={`${className} rounded-full`}
      shape="circle"
      sex={config.sex ?? DEFAULT_AVATAR.sex}
      faceColor={config.faceColor ?? DEFAULT_AVATAR.faceColor}
      earSize={config.earSize ?? DEFAULT_AVATAR.earSize}
      eyeStyle={config.eyeStyle ?? DEFAULT_AVATAR.eyeStyle}
      noseStyle={config.noseStyle ?? DEFAULT_AVATAR.noseStyle}
      mouthStyle={config.mouthStyle ?? DEFAULT_AVATAR.mouthStyle}
      shirtStyle={config.shirtStyle ?? DEFAULT_AVATAR.shirtStyle}
      glassesStyle={config.glassesStyle ?? DEFAULT_AVATAR.glassesStyle}
      hairColor={config.hairColor ?? DEFAULT_AVATAR.hairColor}
      hairStyle={config.hairStyle ?? DEFAULT_AVATAR.hairStyle}
      hatStyle={config.hatStyle ?? DEFAULT_AVATAR.hatStyle}
      hatColor={config.hatColor ?? DEFAULT_AVATAR.hatColor}
      shirtColor={config.shirtColor ?? DEFAULT_AVATAR.shirtColor}
      bgColor={config.bgColor ?? DEFAULT_AVATAR.bgColor}
    />
  );
};
