"use client";

import React, { useState } from 'react';
import ReactNiceAvatar, { genConfig } from 'react-nice-avatar';
import { useAvatar, AvatarState, DEFAULT_AVATAR } from '@/hooks/useAvatar';
import { Shuffle } from 'lucide-react';

/* ─── Option data ─────────────────────────────────────────────────────────── */

const SKIN_TONES = [
  { value: '#FDDBB4', label: 'Porcelain' },
  { value: '#F1C27D', label: 'Light'     },
  { value: '#E0AC69', label: 'Medium'    },
  { value: '#C68642', label: 'Tan'       },
  { value: '#8D5524', label: 'Deep'      },
  { value: '#5C3317', label: 'Rich'      },
];

const HAIR_STYLES: { value: AvatarState['hairStyle']; label: string }[] = [
  { value: 'normal',     label: 'Clean Cut' },
  { value: 'thick',      label: 'Full'      },
  { value: 'womanLong',  label: 'Long'      },
  { value: 'womanShort', label: 'Short'     },
  { value: 'mohawk',     label: 'Mohawk'    },
];

const HAIR_COLORS = [
  { value: '#1A1008', label: 'Jet Black'    },
  { value: '#3B2314', label: 'Dark Brown'   },
  { value: '#7B4F2E', label: 'Brown'        },
  { value: '#C49A3C', label: 'Blonde'       },
  { value: '#E8C07A', label: 'Light Blonde' },
  { value: '#8B0000', label: 'Auburn'       },
  { value: '#B22222', label: 'Red'          },
  { value: '#C0C0C0', label: 'Silver'       },
  { value: '#F5F5F5', label: 'Platinum'     },
  { value: '#9B59B6', label: 'Purple'       },
  { value: '#2980B9', label: 'Blue'         },
  { value: '#FF69B4', label: 'Pink'         },
];

const EYE_STYLES: { value: AvatarState['eyeStyle']; label: string }[] = [
  { value: 'circle', label: 'Round'  },
  { value: 'oval',   label: 'Almond' },
  { value: 'smile',  label: 'Happy'  },
];

const NOSE_STYLES: { value: AvatarState['noseStyle']; label: string }[] = [
  { value: 'short', label: 'Button'  },
  { value: 'long',  label: 'Defined' },
  { value: 'round', label: 'Round'   },
];

const MOUTH_STYLES: { value: AvatarState['mouthStyle']; label: string }[] = [
  { value: 'smile', label: 'Smile' },
  { value: 'laugh', label: 'Laugh' },
  { value: 'peace', label: 'Chill' },
];

const GLASSES_STYLES: { value: AvatarState['glassesStyle']; label: string }[] = [
  { value: 'none',   label: 'None'   },
  { value: 'round',  label: 'Round'  },
  { value: 'square', label: 'Square' },
];

const SHIRT_STYLES: { value: AvatarState['shirtStyle']; label: string }[] = [
  { value: 'hoody', label: 'Hoodie' },
  { value: 'short', label: 'T-Shirt'},
  { value: 'polo',  label: 'Collar' },
];

const HAT_STYLES: { value: AvatarState['hatStyle']; label: string }[] = [
  { value: 'none',   label: 'None'   },
  { value: 'beanie', label: 'Beanie' },
  { value: 'turban', label: 'Turban' },
];

const EAR_SIZES: { value: AvatarState['earSize']; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'big',   label: 'Big'   },
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
  { value: '#EC4899', label: 'Pink'     },
  { value: '#10B981', label: 'Emerald'  },
  { value: '#F97316', label: 'Orange'   },
  { value: '#FFFFFF', label: 'White'    },
];

const BG_COLORS = [
  { value: '#E0F7FA', label: 'Aqua'     },
  { value: '#FCE4EC', label: 'Pink'     },
  { value: '#F3E5F5', label: 'Lavender' },
  { value: '#E8F5E9', label: 'Mint'     },
  { value: '#FFF8E1', label: 'Cream'    },
  { value: '#E3F2FD', label: 'Sky'      },
  { value: '#FBE9E7', label: 'Peach'    },
  { value: '#EDE7F6', label: 'Violet'   },
  { value: '#E0F2F1', label: 'Sage'     },
  { value: '#FFF3E0', label: 'Apricot'  },
  { value: '#1a1a2e', label: 'Night'    },
  { value: '#0d1b2a', label: 'Midnight' },
];

const TABS = [
  { id: 'face',     label: 'Face',   emoji: '🧑' },
  { id: 'hair',     label: 'Hair',   emoji: '💇' },
  { id: 'features', label: 'Detail', emoji: '👁️'  },
  { id: 'outfit',   label: 'Outfit', emoji: '👕' },
  { id: 'vibe',     label: 'Vibe',   emoji: '🎨' },
];

/* ─── Helper: render a NiceAvatar from AvatarState ───────────────────────── */

function NiceAvatar({ config, size }: { config: AvatarState; size: number | string }) {
  const s = typeof size === 'number' ? { width: size, height: size } : { width: size, height: size };
  return (
    <ReactNiceAvatar
      style={s}
      shape="circle"
      sex={config.sex}
      faceColor={config.faceColor}
      earSize={config.earSize}
      eyeStyle={config.eyeStyle}
      noseStyle={config.noseStyle}
      mouthStyle={config.mouthStyle}
      shirtStyle={config.shirtStyle}
      glassesStyle={config.glassesStyle}
      hairColor={config.hairColor}
      hairStyle={config.hairStyle}
      hatStyle={config.hatStyle}
      hatColor={config.hatColor}
      shirtColor={config.shirtColor}
      bgColor={config.bgColor}
    />
  );
}

/* ─── Mini live-preview option card (the Snapchat feature) ───────────────── */

function OptionCard<T extends string>({
  base, configKey, value, label, active, onSelect, size = 72,
}: {
  base: AvatarState; configKey: keyof AvatarState; value: T;
  label: string; active: boolean; onSelect: () => void; size?: number;
}) {
  const preview: AvatarState = { ...base, [configKey]: value };
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 shrink-0 transition-all duration-200 ${
        active ? 'scale-105' : 'opacity-60 hover:opacity-90 hover:scale-[1.02]'
      }`}
    >
      <div className={`rounded-2xl p-1 transition-all duration-200 ${
        active
          ? 'ring-2 ring-primary-teal ring-offset-2 bg-primary-teal/10'
          : 'ring-1 ring-black/5 bg-background-neutral dark:bg-[#1E2540]'
      }`}>
        <NiceAvatar config={preview} size={size} />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wide text-center w-full px-1 truncate ${
        active ? 'text-primary-teal' : 'text-text-gray'
      }`}>
        {label}
      </span>
    </button>
  );
}

/* ─── Color swatch ────────────────────────────────────────────────────────── */

const Swatch: React.FC<{ color: string; label: string; active: boolean; onClick: () => void }> = ({
  color, label, active, onClick,
}) => (
  <button
    title={label}
    onClick={onClick}
    className={`w-9 h-9 rounded-full shrink-0 transition-all duration-200 ${
      active
        ? 'ring-2 ring-primary-teal ring-offset-2 scale-110 shadow-md'
        : 'hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-primary-teal/50'
    }`}
    style={{
      backgroundColor: color,
      border: ['#FFFFFF', '#F5F5F5', '#E0F7FA', '#FFF8E1', '#E3F2FD', '#FBE9E7', '#FFF3E0'].includes(color)
        ? '1.5px solid #e5e7eb' : 'none',
    }}
  />
);

/* ─── Reusable section + scroll row ──────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-teal px-1">{title}</p>
    {children}
  </div>
);

const ScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-1 px-1">
    {children}
  </div>
);

/* ─── Main builder ────────────────────────────────────────────────────────── */

export const AvatarBuilder: React.FC<{ onSave?: (state: AvatarState) => void }> = ({ onSave }) => {
  const { avatar, setAvatar } = useAvatar();
  const [activeTab, setActiveTab] = useState('face');

  const update = <K extends keyof AvatarState>(key: K, value: AvatarState[K]) =>
    setAvatar({ ...avatar, [key]: value });

  const randomize = () => {
    const r = genConfig() as Partial<AvatarState>;
    // genConfig returns valid values — merge carefully
    setAvatar({
      ...DEFAULT_AVATAR,
      sex:          (r.sex          as AvatarState['sex'])          ?? DEFAULT_AVATAR.sex,
      faceColor:    r.faceColor     ?? DEFAULT_AVATAR.faceColor,
      earSize:      (r.earSize      as AvatarState['earSize'])      ?? DEFAULT_AVATAR.earSize,
      eyeStyle:     (r.eyeStyle     as AvatarState['eyeStyle'])     ?? DEFAULT_AVATAR.eyeStyle,
      noseStyle:    (r.noseStyle    as AvatarState['noseStyle'])    ?? DEFAULT_AVATAR.noseStyle,
      mouthStyle:   (r.mouthStyle   as AvatarState['mouthStyle'])   ?? DEFAULT_AVATAR.mouthStyle,
      shirtStyle:   (r.shirtStyle   as AvatarState['shirtStyle'])   ?? DEFAULT_AVATAR.shirtStyle,
      glassesStyle: (r.glassesStyle as AvatarState['glassesStyle']) ?? DEFAULT_AVATAR.glassesStyle,
      hairColor:    r.hairColor     ?? DEFAULT_AVATAR.hairColor,
      hairStyle:    (r.hairStyle    as AvatarState['hairStyle'])    ?? DEFAULT_AVATAR.hairStyle,
      hatStyle:     (r.hatStyle     as AvatarState['hatStyle'])     ?? DEFAULT_AVATAR.hatStyle,
      hatColor:     r.hatColor      ?? DEFAULT_AVATAR.hatColor,
      shirtColor:   r.shirtColor    ?? DEFAULT_AVATAR.shirtColor,
      bgColor:      r.bgColor       ?? DEFAULT_AVATAR.bgColor,
    });
  };

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Hero preview ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="w-44 h-44 rounded-full shadow-[0_25px_70px_rgba(0,194,203,0.3)] ring-4 ring-white dark:ring-white/10">
          <NiceAvatar config={avatar} size="100%" />
        </div>
        <button
          onClick={randomize}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-background-neutral dark:bg-[#1E2540] border border-primary-teal/20 text-[10px] font-black uppercase tracking-widest text-text-gray hover:text-primary-teal hover:border-primary-teal/40 transition-all"
        >
          <Shuffle size={12} />
          Randomize
        </button>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-background-neutral dark:bg-[#0B0F1A] p-1 rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-[8px] font-black uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#1E2540] text-primary-teal shadow-sm'
                : 'text-text-gray hover:text-text-charcoal dark:hover:text-[#E2E8F0]'
            }`}
          >
            <span className="text-sm leading-none">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────────────────── */}
      <div className="space-y-7 min-h-[300px]">

        {/* FACE */}
        {activeTab === 'face' && (
          <>
            <Section title="Gender Style">
              <ScrollRow>
                {(['man', 'woman'] as const).map(v => (
                  <OptionCard key={v} base={avatar} configKey="sex" value={v}
                    label={v === 'man' ? 'Masculine' : 'Feminine'}
                    active={avatar.sex === v} onSelect={() => update('sex', v)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Skin Tone">
              <div className="flex flex-wrap gap-3 px-1">
                {SKIN_TONES.map(s => (
                  <Swatch key={s.value} color={s.value} label={s.label}
                    active={avatar.faceColor === s.value}
                    onClick={() => update('faceColor', s.value)} />
                ))}
              </div>
            </Section>

            <Section title="Ear Size">
              <ScrollRow>
                {EAR_SIZES.map(e => (
                  <OptionCard key={e.value} base={avatar} configKey="earSize" value={e.value}
                    label={e.label} active={avatar.earSize === e.value}
                    onSelect={() => update('earSize', e.value)} />
                ))}
              </ScrollRow>
            </Section>
          </>
        )}

        {/* HAIR */}
        {activeTab === 'hair' && (
          <>
            <Section title="Hair Style">
              <ScrollRow>
                {HAIR_STYLES.map(h => (
                  <OptionCard key={h.value} base={avatar} configKey="hairStyle" value={h.value}
                    label={h.label} active={avatar.hairStyle === h.value}
                    onSelect={() => update('hairStyle', h.value)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Hair Color">
              <div className="flex flex-wrap gap-3 px-1">
                {HAIR_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label}
                    active={avatar.hairColor === c.value}
                    onClick={() => update('hairColor', c.value)} />
                ))}
              </div>
            </Section>

            <Section title="Hat">
              <ScrollRow>
                {HAT_STYLES.map(h => (
                  <OptionCard key={h.value} base={avatar} configKey="hatStyle" value={h.value}
                    label={h.label} active={avatar.hatStyle === h.value}
                    onSelect={() => update('hatStyle', h.value)} />
                ))}
              </ScrollRow>
            </Section>

            {avatar.hatStyle !== 'none' && (
              <Section title="Hat Color">
                <div className="flex flex-wrap gap-3 px-1">
                  {CLOTHES_COLORS.map(c => (
                    <Swatch key={c.value} color={c.value} label={c.label}
                      active={avatar.hatColor === c.value}
                      onClick={() => update('hatColor', c.value)} />
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* FEATURES */}
        {activeTab === 'features' && (
          <>
            <Section title="Eyes">
              <ScrollRow>
                {EYE_STYLES.map(e => (
                  <OptionCard key={e.value} base={avatar} configKey="eyeStyle" value={e.value}
                    label={e.label} active={avatar.eyeStyle === e.value}
                    onSelect={() => update('eyeStyle', e.value)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Nose">
              <ScrollRow>
                {NOSE_STYLES.map(n => (
                  <OptionCard key={n.value} base={avatar} configKey="noseStyle" value={n.value}
                    label={n.label} active={avatar.noseStyle === n.value}
                    onSelect={() => update('noseStyle', n.value)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Mouth">
              <ScrollRow>
                {MOUTH_STYLES.map(m => (
                  <OptionCard key={m.value} base={avatar} configKey="mouthStyle" value={m.value}
                    label={m.label} active={avatar.mouthStyle === m.value}
                    onSelect={() => update('mouthStyle', m.value)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Glasses">
              <ScrollRow>
                {GLASSES_STYLES.map(g => (
                  <OptionCard key={g.value} base={avatar} configKey="glassesStyle" value={g.value}
                    label={g.label} active={avatar.glassesStyle === g.value}
                    onSelect={() => update('glassesStyle', g.value)} />
                ))}
              </ScrollRow>
            </Section>
          </>
        )}

        {/* OUTFIT */}
        {activeTab === 'outfit' && (
          <>
            <Section title="Top Style">
              <ScrollRow>
                {SHIRT_STYLES.map(s => (
                  <OptionCard key={s.value} base={avatar} configKey="shirtStyle" value={s.value}
                    label={s.label} active={avatar.shirtStyle === s.value}
                    onSelect={() => update('shirtStyle', s.value)} />
                ))}
              </ScrollRow>
            </Section>

            <Section title="Color">
              <div className="flex flex-wrap gap-3 px-1">
                {CLOTHES_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label}
                    active={avatar.shirtColor === c.value}
                    onClick={() => update('shirtColor', c.value)} />
                ))}
              </div>
            </Section>
          </>
        )}

        {/* VIBE */}
        {activeTab === 'vibe' && (
          <>
            <Section title="Background">
              <div className="flex flex-wrap gap-3 px-1">
                {BG_COLORS.map(c => (
                  <Swatch key={c.value} color={c.value} label={c.label}
                    active={avatar.bgColor === c.value}
                    onClick={() => update('bgColor', c.value)} />
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

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => onSave?.(avatar)}
        className="w-full py-4 rounded-2xl bg-primary-teal text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,194,203,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
      >
        Save Avatar ✓
      </button>
    </div>
  );
};
