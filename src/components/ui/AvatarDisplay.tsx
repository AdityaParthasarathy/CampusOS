import React from 'react';
import { AvatarState, DEFAULT_AVATAR, migrateAvatar } from '@/hooks/useAvatar';

interface AvatarDisplayProps {
  avatar: AvatarState | string | null | undefined;
  className?: string;
  fallbackSeed?: string;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const Eye = ({ cx, cy, eyeColor, style }: { cx: number; cy: number; eyeColor: string; style: string }) => {
  const rx = style === 'almond' ? 13 : style === 'sleepy' ? 13 : 13;
  const ry = style === 'almond' ? 8  : style === 'sleepy' ? 6  : 10;
  return (
    <g>
      {/* sclera */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" />
      {/* iris */}
      <circle cx={cx} cy={cy} r={style === 'sleepy' ? 4.5 : 7} fill={eyeColor} />
      {/* pupil */}
      <circle cx={cx} cy={cy} r={style === 'sleepy' ? 2.5 : 4} fill="#111" />
      {/* catchlight */}
      <circle cx={cx + 3} cy={cy - 2.5} r={2} fill="white" opacity="0.9" />
      {/* upper lid shadow */}
      <path
        d={`M ${cx - rx} ${cy} Q ${cx} ${cy - ry * 1.4} ${cx + rx} ${cy}`}
        fill="rgba(0,0,0,0.10)"
      />
      {/* top lash line */}
      <path
        d={`M ${cx - rx} ${cy} Q ${cx} ${cy - ry * 1.3} ${cx + rx} ${cy}`}
        fill="none"
        stroke="#222"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* wink — closed eye overlay */}
      {style === 'wink' && cx < 100 && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#F1C27D" opacity="0.85" />
      )}
    </g>
  );
};

const Brow = ({ cx, cy, style }: { cx: number; cy: number; style?: string }) => {
  if (style === 'flat') {
    return <path d={`M ${cx - 13} ${cy} L ${cx + 13} ${cy}`} fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />;
  }
  if (style === 'thick') {
    return <path d={`M ${cx - 14} ${cy + 2} Q ${cx} ${cy - 6} ${cx + 14} ${cy + 2}`} fill="none" stroke="#222" strokeWidth="3.5" strokeLinecap="round" />;
  }
  // arch (default)
  return <path d={`M ${cx - 13} ${cy + 1} Q ${cx} ${cy - 7} ${cx + 13} ${cy + 1}`} fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />;
};

/* ─── Hair back layers (drawn before the face) ───────────────────────────── */

const HairBack = ({ style, color }: { style: string; color: string }) => {
  switch (style) {
    case 'long':
      return (
        <g fill={color}>
          {/* main long hair behind head */}
          <path d="M 46 95 Q 40 28 100 22 Q 160 28 154 95 Q 158 165 148 202 L 52 202 Q 42 165 46 95 Z" />
        </g>
      );
    case 'curly':
      return (
        <g fill={color}>
          <path d="M 46 88 Q 44 26 100 18 Q 156 26 154 88 Q 165 60 152 38 Q 148 8 128 14 Q 118 -4 100 0 Q 82 -4 72 14 Q 52 8 48 38 Q 35 60 46 88 Z" />
          <circle cx="52"  cy="44" r="16" />
          <circle cx="148" cy="44" r="16" />
          <circle cx="76"  cy="22" r="14" />
          <circle cx="124" cy="22" r="14" />
          <circle cx="100" cy="16" r="14" />
        </g>
      );
    case 'bob':
      return (
        <g fill={color}>
          <path d="M 46 115 Q 42 28 100 22 Q 158 28 154 115 Q 152 148 136 155 Q 100 162 64 155 Q 48 148 46 115 Z" />
        </g>
      );
    case 'waves':
      return (
        <g fill={color}>
          <path d="M 44 95 Q 40 28 100 22 Q 160 28 156 95 Q 158 138 148 160 Q 100 172 52 160 Q 42 138 44 95 Z" />
        </g>
      );
    case 'bun':
      return (
        <g fill={color}>
          {/* tight back */}
          <path d="M 50 88 Q 50 32 100 28 Q 150 32 150 88 Q 148 58 100 54 Q 52 58 50 88 Z" />
          {/* the bun */}
          <circle cx="100" cy="14" r="22" />
          <ellipse cx="100" cy="34" rx="14" ry="8" />
        </g>
      );
    case 'buzz':
      return (
        <g fill={color} opacity="0.85">
          {/* ultra-thin stubble cap */}
          <path d="M 50 88 Q 50 34 100 31 Q 150 34 150 88 Q 148 62 100 60 Q 52 62 50 88 Z" />
        </g>
      );
    case 'short':
    default:
      return (
        <g fill={color}>
          <path d="M 48 90 Q 48 26 100 22 Q 152 26 152 90 Q 150 52 100 48 Q 50 52 48 90 Z" />
        </g>
      );
  }
};

/* ─── Hair front layers (drawn after the face, for bangs/sides) ──────────── */

const HairFront = ({ style, color }: { style: string; color: string }) => {
  switch (style) {
    case 'long':
      return (
        <g fill={color}>
          {/* side strands in front of face */}
          <path d="M 48 90 Q 42 110 44 150 Q 46 165 52 170 Q 52 140 50 110 Q 48 100 48 90 Z" />
          <path d="M 152 90 Q 158 110 156 150 Q 154 165 148 170 Q 148 140 150 110 Q 152 100 152 90 Z" />
          {/* top parting / fringe detail */}
          <path d="M 70 36 Q 100 28 130 36 Q 100 44 70 36 Z" />
        </g>
      );
    case 'bob':
      return (
        <g fill={color}>
          <path d="M 46 115 Q 44 130 48 148 Q 52 155 64 155 Q 52 148 50 130 Q 48 118 46 115 Z" />
          <path d="M 154 115 Q 156 130 152 148 Q 148 155 136 155 Q 148 148 150 130 Q 152 118 154 115 Z" />
          <path d="M 68 36 Q 100 28 132 36 Q 100 46 68 36 Z" />
        </g>
      );
    case 'curly':
      return (
        <g fill={color}>
          <circle cx="50"  cy="72"  r="12" />
          <circle cx="150" cy="72"  r="12" />
          <circle cx="58"  cy="52"  r="10" />
          <circle cx="142" cy="52"  r="10" />
        </g>
      );
    case 'bun':
      // bun wrap ring
      return (
        <g>
          <circle cx="100" cy="14" r="22" fill={color} />
          <circle cx="100" cy="14" r="16" fill="none" stroke={color} strokeWidth="5" opacity="0.6" />
          <circle cx="100" cy="14" r="8"  fill={color} opacity="0.8" />
        </g>
      );
    case 'waves':
      return (
        <g fill={color}>
          <path d="M 44 95 Q 40 110 42 130 Q 44 120 46 100 Z" />
          <path d="M 156 95 Q 160 110 158 130 Q 156 120 154 100 Z" />
          <path d="M 68 36 Q 100 26 132 36 Q 100 46 68 36 Z" />
        </g>
      );
    case 'short':
    default:
      return (
        <g fill={color}>
          {/* slight fringe */}
          <path d="M 65 40 Q 100 28 135 40 Q 100 50 65 40 Z" />
        </g>
      );
  }
};

/* ─── Clothes ─────────────────────────────────────────────────────────────── */

const Clothes = ({ style, color, skin }: { style: string; color: string; skin: string }) => {
  const darken = (hex: string) => {
    try {
      const n = parseInt(hex.replace('#',''), 16);
      const r = Math.max(0, (n>>16)-30);
      const g = Math.max(0, ((n>>8)&0xff)-30);
      const b = Math.max(0, (n&0xff)-30);
      return `rgb(${r},${g},${b})`;
    } catch { return hex; }
  };

  return (
    <g>
      {/* Neck */}
      <rect x="87" y="143" width="26" height="22" rx="4" fill={skin} />

      {/* Body */}
      <path d="M 10 202 L 22 168 Q 100 150 178 168 L 190 202 Z" fill={color} />

      {/* Collar / style details */}
      {style === 'tshirt' && (
        <path d="M 87 155 Q 100 165 113 155 Q 106 148 100 148 Q 94 148 87 155 Z" fill={darken(color)} />
      )}
      {style === 'hoodie' && (
        <>
          <path d="M 87 155 Q 100 168 113 155 Q 106 148 100 148 Q 94 148 87 155 Z" fill={darken(color)} />
          <path d="M 22 168 Q 28 155 40 152 Q 50 150 60 152 L 55 168 Z" fill={darken(color)} />
          <path d="M 178 168 Q 172 155 160 152 Q 150 150 140 152 L 145 168 Z" fill={darken(color)} />
          {/* hoodie string */}
          <line x1="92" y1="155" x2="88" y2="178" stroke={darken(color)} strokeWidth="2" strokeLinecap="round" />
          <line x1="108" y1="155" x2="112" y2="178" stroke={darken(color)} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {style === 'collar' && (
        <>
          <path d="M 87 152 L 78 164 L 100 158 L 122 164 L 113 152 Q 100 162 87 152 Z" fill="white" opacity="0.9" />
          <path d="M 87 152 Q 100 160 100 160 L 87 152 Z" fill={darken(color)} />
          <path d="M 113 152 Q 100 160 100 160 L 113 152 Z" fill={darken(color)} />
        </>
      )}
      {style === 'vneck' && (
        <path d="M 87 153 L 100 170 L 113 153 Q 106 148 100 148 Q 94 148 87 153 Z" fill={darken(color)} />
      )}
    </g>
  );
};

/* ─── Accessory ──────────────────────────────────────────────────────────── */

const Accessory = ({ style, color }: { style: string; color: string }) => {
  switch (style) {
    case 'glasses':
      return (
        <g fill="none" stroke="#222" strokeWidth="2.2">
          <ellipse cx="75" cy="86" rx="15" ry="12" />
          <ellipse cx="125" cy="86" rx="15" ry="12" />
          <line x1="90" y1="86" x2="110" y2="86" />
          <line x1="40" y1="82" x2="60" y2="84" />
          <line x1="140" y1="84" x2="160" y2="82" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <ellipse cx="75" cy="86" rx="17" ry="12" fill="#111" opacity="0.85" />
          <ellipse cx="125" cy="86" rx="17" ry="12" fill="#111" opacity="0.85" />
          <line x1="92" y1="86" x2="108" y2="86" stroke="#333" strokeWidth="2.5" />
          <line x1="38" y1="82" x2="58" y2="85" stroke="#333" strokeWidth="2" />
          <line x1="142" y1="85" x2="162" y2="82" stroke="#333" strokeWidth="2" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M 48 88 C 48 28 152 28 152 88" fill="none" stroke="#222" strokeWidth="5" />
          <rect x="36"  y="76" width="16" height="26" rx="7" fill={color} />
          <rect x="148" y="76" width="16" height="26" rx="7" fill={color} />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M 44 65 Q 44 30 100 28 Q 156 30 156 65 L 160 58 Q 164 52 160 48 Q 156 44 148 46 L 44 65 Z" fill={color} />
          <path d="M 44 65 Q 100 55 156 65" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          {/* brim shadow */}
          <path d="M 44 65 L 35 70 Q 28 75 35 78 Q 45 80 56 76 L 44 65 Z" fill="rgba(0,0,0,0.12)" />
        </g>
      );
    default:
      return null;
  }
};

/* ─── Main SVG Avatar ─────────────────────────────────────────────────────── */

const SnapAvatar: React.FC<{ a: AvatarState }> = ({ a }) => {
  const lipColor = a.skin === '#FDDBB4' || a.skin === '#F1C27D' || a.skin === '#E0AC69'
    ? '#C97B7B' : '#A0524A';

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Background */}
      <circle cx="100" cy="100" r="100" fill={a.bgColor || '#E0F7FA'} />

      {/* Clothes + neck (behind head) */}
      <Clothes style={a.clothes} color={a.color} skin={a.skin} />

      {/* Hair back layer */}
      <HairBack style={a.hair} color={a.hairColor} />

      {/* Ears */}
      <ellipse cx="48"  cy="93" rx="9" ry="12" fill={a.skin} />
      <ellipse cx="152" cy="93" rx="9" ry="12" fill={a.skin} />
      {/* inner ear */}
      <ellipse cx="48"  cy="93" rx="4.5" ry="7" fill="rgba(0,0,0,0.07)" />
      <ellipse cx="152" cy="93" rx="4.5" ry="7" fill="rgba(0,0,0,0.07)" />

      {/* Head */}
      <ellipse cx="100" cy="90" rx="52" ry="56" fill={a.skin} />
      {/* subtle face shading */}
      <ellipse cx="100" cy="90" rx="52" ry="56" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />

      {/* Cheek blush */}
      <circle cx="68"  cy="110" r="12" fill="rgba(255,160,130,0.18)" />
      <circle cx="132" cy="110" r="12" fill="rgba(255,160,130,0.18)" />

      {/* Eyes */}
      <Eye cx={75}  cy={86} eyeColor={a.eyeColor} style={a.eyes} />
      <Eye cx={125} cy={86} eyeColor={a.eyeColor} style={a.eyes} />

      {/* Eyebrows */}
      <Brow cx={75}  cy={70} />
      <Brow cx={125} cy={70} />

      {/* Nose — two soft dots */}
      <circle cx="95"  cy="102" r="2.5" fill="rgba(0,0,0,0.14)" />
      <circle cx="105" cy="102" r="2.5" fill="rgba(0,0,0,0.14)" />

      {/* Mouth */}
      {a.mouth === 'smile' && (
        <g>
          <path d="M 83 116 Q 100 130 117 116" fill={lipColor} stroke={lipColor} strokeWidth="1" strokeLinecap="round" />
          <path d="M 83 116 Q 100 124 117 116" fill="rgba(255,255,255,0.3)" />
        </g>
      )}
      {a.mouth === 'open' && (
        <g>
          <path d="M 83 116 Q 100 134 117 116 Z" fill="#6B2D2D" />
          <path d="M 87 116 Q 100 122 113 116" fill="white" />
          <path d="M 83 116 Q 100 120 117 116" fill={lipColor} />
        </g>
      )}
      {a.mouth === 'neutral' && (
        <path d="M 86 118 Q 100 122 114 118" fill="none" stroke={lipColor} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {a.mouth === 'smirk' && (
        <path d="M 86 118 Q 104 128 116 118" fill={lipColor} stroke={lipColor} strokeWidth="1" strokeLinecap="round" />
      )}
      {a.mouth === 'surprise' && (
        <ellipse cx="100" cy="120" rx="9" ry="11" fill="#6B2D2D" />
      )}

      {/* Hair front layer */}
      <HairFront style={a.hair} color={a.hairColor} />

      {/* Accessory on top */}
      <Accessory style={a.accessory} color={a.color} />
    </svg>
  );
};

/* ─── Exported Component ──────────────────────────────────────────────────── */

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  className = 'w-10 h-10',
  fallbackSeed = 'fallback',
}) => {
  // No avatar → DiceBear lorelei (much cleaner style than avataaars)
  if (!avatar) {
    return (
      <img
        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${fallbackSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
        alt="Avatar"
        className={`${className} object-cover rounded-full bg-white`}
      />
    );
  }

  // String URL (Google photo or old DiceBear URL)
  if (typeof avatar === 'string') {
    if (avatar.includes('dicebear') && avatar.includes('avataaars')) {
      // Upgrade old avataaars URL to lorelei
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

  // AvatarState object — migrate if needed and render custom SVG
  const migrated: AvatarState = (avatar as any).bgColor !== undefined
    ? avatar as AvatarState
    : migrateAvatar(avatar as unknown as Record<string, string>);

  return (
    <div className={`${className} rounded-full overflow-hidden`}>
      <SnapAvatar a={migrated} />
    </div>
  );
};
