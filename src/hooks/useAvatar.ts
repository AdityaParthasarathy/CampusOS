"use client";

import { useState, useEffect } from 'react';

/* ─── Type: matches react-nice-avatar props 1-to-1 ──────────────────────── */

export interface AvatarState {
  sex:          'man' | 'woman';
  faceColor:    string;
  earSize:      'small' | 'big';
  eyeStyle:     'circle' | 'oval' | 'smile';
  noseStyle:    'short' | 'long' | 'round';
  mouthStyle:   'laugh' | 'smile' | 'peace';
  shirtStyle:   'hoody' | 'short' | 'polo';
  glassesStyle: 'round' | 'square' | 'none';
  hairColor:    string;
  hairStyle:    'normal' | 'thick' | 'mohawk' | 'womanLong' | 'womanShort';
  hatStyle:     'none' | 'beanie' | 'turban';
  hatColor:     string;
  shirtColor:   string;
  bgColor:      string;
}

export const DEFAULT_AVATAR: AvatarState = {
  sex:          'man',
  faceColor:    '#F1C27D',
  earSize:      'small',
  eyeStyle:     'circle',
  noseStyle:    'short',
  mouthStyle:   'smile',
  shirtStyle:   'hoody',
  glassesStyle: 'none',
  hairColor:    '#3B2314',
  hairStyle:    'normal',
  hatStyle:     'none',
  hatColor:     '#00C2CB',
  shirtColor:   '#00C2CB',
  bgColor:      '#E0F7FA',
};

/* ─── Migrate any old avatar format → new AvatarState ───────────────────── */

export function migrateAvatar(raw: Record<string, string>): AvatarState {
  // Already new format
  if (raw.sex && raw.faceColor) return raw as unknown as AvatarState;

  const hairMap: Record<string, AvatarState['hairStyle']> = {
    short: 'normal', long: 'womanLong', curly: 'thick',
    bob: 'womanShort', bun: 'womanShort', buzz: 'mohawk',
    waves: 'normal', style1: 'normal', style2: 'womanLong',
    style3: 'thick', style4: 'womanShort',
  };
  const eyeMap: Record<string, AvatarState['eyeStyle']> = {
    round: 'circle', almond: 'oval', sleepy: 'smile', wink: 'oval',
    normal: 'circle', blink: 'smile', cool: 'oval',
  };
  const mouthMap: Record<string, AvatarState['mouthStyle']> = {
    smile: 'smile', open: 'laugh', neutral: 'peace',
    smirk: 'smile', surprise: 'laugh', laugh: 'laugh',
  };

  return {
    ...DEFAULT_AVATAR,
    faceColor:    raw.skin      || raw.faceColor  || DEFAULT_AVATAR.faceColor,
    hairColor:    raw.hairColor || raw.color      || DEFAULT_AVATAR.hairColor,
    shirtColor:   raw.color     || raw.shirtColor || DEFAULT_AVATAR.shirtColor,
    bgColor:      raw.bgColor   || DEFAULT_AVATAR.bgColor,
    hairStyle:    (hairMap[raw.hair || raw.hairStyle || '']    || DEFAULT_AVATAR.hairStyle) as AvatarState['hairStyle'],
    eyeStyle:     (eyeMap[raw.eyes || raw.eyeStyle || '']      || DEFAULT_AVATAR.eyeStyle)  as AvatarState['eyeStyle'],
    mouthStyle:   (mouthMap[raw.mouth || raw.mouthStyle || ''] || DEFAULT_AVATAR.mouthStyle) as AvatarState['mouthStyle'],
    glassesStyle: (raw.accessory === 'glasses' || raw.accessory === 'sunglasses'
                    ? 'round' : 'none') as AvatarState['glassesStyle'],
    hatStyle:     (raw.accessory === 'cap' ? 'beanie' : 'none') as AvatarState['hatStyle'],
    shirtStyle:   (raw.clothes === 'hoodie' ? 'hoody'
                : raw.clothes === 'collar' ? 'polo'
                : 'short') as AvatarState['shirtStyle'],
  };
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export const useAvatar = () => {
  const [avatar, setAvatarState] = useState<AvatarState>(DEFAULT_AVATAR);

  useEffect(() => {
    const saved = localStorage.getItem('campus_os_avatar');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setAvatarState(migrateAvatar(parsed));
    } catch { /* ignore corrupt data */ }
  }, []);

  const setAvatar = (next: AvatarState) => {
    setAvatarState(next);
    localStorage.setItem('campus_os_avatar', JSON.stringify(next));
  };

  return { avatar, setAvatar };
};
