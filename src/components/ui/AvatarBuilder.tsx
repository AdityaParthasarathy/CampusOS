"use client";

import React, { useState } from 'react';
import { useAvatar, AvatarState, DEFAULT_AVATAR } from '@/hooks/useAvatar';
import { AvatarDisplay } from './AvatarDisplay';

/* ─── Option data ─────────────────────────────────────────────────────────── */

const SKIN_TONES = [
  { value: '#FDDBB4', label: 'Porcelain' },
  { value: '#F1C27D', label: 'Light'     },
  { value: '#E0AC69', label: 'Medium'    },
  { value: '#C68642', label: 'Tan'       },
  { value: '#8D5524', label: 'Deep'      },
  { value: '#5C3317', label: 'Rich'      },
];

const HAIR_STYLES = [
  { value: 'short',  label: 'Short',  emoji: '💇' },
  { value: 'long',   label: 'Long',   emoji: '👱' },
  { value: 'curly',  label: 'Curly',  emoji: '🌀' },
  { value: 'bob',    label: 'Bob',    emoji: '✂️' },
  { value: 'bun',    label: 'Bun',    emoji: '🎀' },
  { value: 'waves',  label: 'Waves',  emoji: '🌊' },
  { value: 'buzz',   label: 'Buzz',   emoji: '⚡' },
];

const HAIR_COLORS = [
  { value: '#1A1008', label: 'Jet Black'   },
  { value: '#3B2314', label: 'Dark Brown'  },
  { value: '#7B4F2E', label: 'Brown'       },
  { value: '#C49A3C', label: 'Blonde'      },
  { value: '#E8C07A', label: 'Light Blonde'},
  { value: '#8B0000', label: 'Auburn'      },
  { value: '#C0392B', label: 'Red'         },
  { value: '#D3D3D3', label: 'Silver'      },
  { value: '#F5F5F5', label: 'Platinum'   },
  { value: '#7B68EE', label: 'Purple'     },
  { value: '#1E90FF', label: 'Blue'       },
  { value: '#FF69B4', label: 'Pink'       },
];

const EYE_STYLES = [
  { value: 'round',  label: 'Round',  emoji: '👀' },
  { value: 'almond', label: 'Almond', emoji: '😌' },
  { value: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { value: 'wink',   label: 'Wink',   emoji: '😉' },
];

const EYE_COLORS = [
  { value: '#4A3728', label: 'Dark Brown' },
  { value: '#7B4F2E', label: 'Brown'      },
  { value: '#5C8A8A', label: 'Teal'       },
  { value: '#4A7CB3', label: 'Blue'       },
  { value: '#5C8A5C', label: 'Green'      },
  { value: '#9B8040', label: 'Hazel'      },
  { value: '#808080', label: 'Gray'       },
];

const MOUTH_STYLES = [
  { value: 'smile',    label: 'Smile',    emoji: '😊' },
  { value: 'open',     label: 'Laugh',    emoji: '😄' },
  { value: 'neutral',  label: 'Neutral',  emoji: '😐' },
  { value: 'smirk',    label: 'Smirk',    emoji: '😏' },
  { value: 'surprise', label: 'Surprise', emoji: '😮' },
];

const CLOTHES_STYLES = [
  { value: 'tshirt',  label: 'T-Shirt', emoji: '👕' },
  { value: 'hoodie',  label: 'Hoodie',  emoji: '🧥' },
  { value: 'collar',  label: 'Collar',  emoji: '👔' },
  { value: 'vneck',   label: 'V-Neck',  emoji: '🎽' },
];

const CLOTHES_COLORS = [
  { value: '#00C2CB', label: 'Teal'     },
  { value: '#FF6B6B', label: 'Coral'    },
  { value: '#4A90D9', label: 'Blue'     },
  { value: '#32D296', label: 'Mint'     },
  { value: '#A855F7', label: 'Purple'   },
  { value: '#F59E0B', label: 'Amber'    },
  { value: '#EF4444', label: 'Red'      },
  { value: '#1F2937', label: 'Charcoal' },
  { value: '#FFFFFF', label: 'White'    },
  { value: '#6B7280', label: 'Gray'     },
];

const BG_COLORS = [
  { value: '#E0F7FA', label: 'Aqua'    },
  { value: '#FCE4EC', label: 'Pink'    },
  { value: '#F3E5F5', label: 'Lavender'},
  { value: '#E8F5E9', label: 'Mint'    },
  { value: '#FFF8E1', label: 'Cream'   },
  { value: '#E3F2FD', label: 'Sky'     },
  { value: '#FBE9E7', label: 'Peach'   },
  { value: '#F1F8E9', label: 'Lime'    },
  { value: '#EDE7F6', label: 'Violet'  },
  { value: '#E0F2F1', label: 'Sage'    },
];

const ACCESSORIES = [
  { value: 'none',        label: 'None',        emoji: '✨' },
  { value: 'glasses',     label: 'Glasses',     emoji: '🤓' },
  { value: 'sunglasses',  label: 'Shades',      emoji: '😎' },
  { value: 'headphones',  label: 'Headphones',  emoji: '🎧' },
  { value: 'cap',         label: 'Cap',         emoji: '🧢' },
];

/* ─── Section wrapper ─────────────────────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-teal">{title}</p>
    {children}
  </div>
);

/* ─── Color swatch ────────────────────────────────────────────────────────── */

const Swatch: React.FC<{
  color: string; label: string; active: boolean; onClick: () => void; size?: 'sm' | 'md';
}> = ({ color, label, active, onClick, size = 'md' }) => (
  <button
    title={label}
    onClick={onClick}
    className={`rounded-full transition-all duration-200 shrink-0 ${
      size === 'md' ? 'w-9 h-9' : 'w-7 h-7'
    } ${active
      ? 'ring-2 ring-offset-2 ring-primary-teal scale-110 shadow-md'
      : 'hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-primary-teal/40'
    }`}
    style={{
      backgroundColor: color,
      border: color === '#FFFFFF' || color === '#F5F5F5' ? '1.5px solid #e5e7eb' : 'none',
    }}
  />
);

/* ─── Style pill button ───────────────────────────────────────────────────── */

const StylePill: React.FC<{
  emoji: string; label: string; active: boolean; onClick: () => void;
}> = ({ emoji, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border-2 transition-all duration-200 min-w-[60px] ${
      active
        ? 'border-primary-teal bg-primary-teal/10 scale-105 shadow-sm'
        : 'border-transparent bg-background-neutral dark:bg-[#1E2540] hover:border-primary-teal/30 hover:scale-105'
    }`}
  >
    <span className="text-xl leading-none">{emoji}</span>
    <span className={`text-[9px] font-black uppercase tracking-wider ${
      active ? 'text-primary-teal' : 'text-text-gray'
    }`}>{label}</span>
  </button>
);

/* ─── Tab navigation ──────────────────────────────────────────────────────── */

const TABS = [
  { id: 'face',      label: 'Face',      emoji: '🧑' },
  { id: 'hair',      label: 'Hair',      emoji: '💇' },
  { id: 'style',     label: 'Style',     emoji: '👕' },
  { id: 'extras',    label: 'Extras',    emoji: '✨' },
];

/* ─── Main component ──────────────────────────────────────────────────────── */

export const AvatarBuilder: React.FC<{ onSave?: (state: AvatarState) => void }> = ({ onSave }) => {
  const { avatar, setAvatar } = useAvatar();
  const [activeTab, setActiveTab] = useState('face');

  const update = (key: keyof AvatarState, value: string) =>
    setAvatar({ ...avatar, [key]: value });

  const handleSave = () => onSave?.(avatar);

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="relative">
          <div className="w-36 h-36 rounded-full shadow-[0_20px_60px_rgba(0,194,203,0.25)] ring-4 ring-primary-teal/20">
            <AvatarDisplay avatar={avatar} className="w-36 h-36" />
          </div>
          {/* Shine ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-white/60 pointer-events-none" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-gray">Your Avatar</p>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-background-neutral dark:bg-[#0B0F1A] p-1 rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#1E2540] text-primary-teal shadow-sm'
                : 'text-text-gray hover:text-text-charcoal dark:hover:text-[#E2E8F0]'
            }`}
          >
            <span className="text-base leading-none">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────────────────── */}
      <div className="space-y-6 min-h-[260px]">

        {/* Face tab */}
        {activeTab === 'face' && (
          <>
            <Section title="Skin Tone">
              <div className="flex flex-wrap gap-3">
                {SKIN_TONES.map(s => (
                  <Swatch key={s.value} color={s.value} label={s.label} active={avatar.skin === s.value} onClick={() => update('skin', s.value)} />
                ))}
              </div>
            </Section>

            <Section title="Eyes">
              <div className="flex flex-wrap gap-2">
                {EYE_STYLES.map(e => (
                  <StylePill key={e.value} emoji={e.emoji} label={e.label} active={avatar.eyes === e.value} onClick={() => update('eyes', e.value)} />
                ))}
              </div>
            </Section>

            <Section title="Eye Color">
              <div className="flex flex-wrap gap-3">
                {EYE_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label} active={avatar.eyeColor === c.value} onClick={() => update('eyeColor', c.value)} size="sm" />
                ))}
              </div>
            </Section>

            <Section title="Expression">
              <div className="flex flex-wrap gap-2">
                {MOUTH_STYLES.map(m => (
                  <StylePill key={m.value} emoji={m.emoji} label={m.label} active={avatar.mouth === m.value} onClick={() => update('mouth', m.value)} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Hair tab */}
        {activeTab === 'hair' && (
          <>
            <Section title="Hair Style">
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map(h => (
                  <StylePill key={h.value} emoji={h.emoji} label={h.label} active={avatar.hair === h.value} onClick={() => update('hair', h.value)} />
                ))}
              </div>
            </Section>

            <Section title="Hair Color">
              <div className="flex flex-wrap gap-3">
                {HAIR_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label} active={avatar.hairColor === c.value} onClick={() => update('hairColor', c.value)} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Style tab */}
        {activeTab === 'style' && (
          <>
            <Section title="Outfit">
              <div className="flex flex-wrap gap-2">
                {CLOTHES_STYLES.map(c => (
                  <StylePill key={c.value} emoji={c.emoji} label={c.label} active={avatar.clothes === c.value} onClick={() => update('clothes', c.value)} />
                ))}
              </div>
            </Section>

            <Section title="Outfit Color">
              <div className="flex flex-wrap gap-3">
                {CLOTHES_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label} active={avatar.color === c.value} onClick={() => update('color', c.value)} />
                ))}
              </div>
            </Section>

            <Section title="Background">
              <div className="flex flex-wrap gap-3">
                {BG_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label} active={avatar.bgColor === c.value} onClick={() => update('bgColor', c.value)} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Extras tab */}
        {activeTab === 'extras' && (
          <>
            <Section title="Accessory">
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map(a => (
                  <StylePill key={a.value} emoji={a.emoji} label={a.label} active={avatar.accessory === a.value} onClick={() => update('accessory', a.value)} />
                ))}
              </div>
            </Section>

            <Section title="Reset">
              <button
                onClick={() => setAvatar(DEFAULT_AVATAR)}
                className="text-[10px] font-black uppercase tracking-widest text-text-gray hover:text-secondary-coral transition-colors"
              >
                Reset to default →
              </button>
            </Section>
          </>
        )}
      </div>

      {/* ── Save button ───────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl bg-primary-teal text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,194,203,0.35)] hover:brightness-110 active:scale-98 transition-all"
      >
        Save Avatar ✓
      </button>
    </div>
  );
};
