import React from 'react';
import { AvatarState } from '@/hooks/useAvatar';

interface AvatarDisplayProps {
  avatar: AvatarState | string | null | undefined;
  className?: string; // e.g., 'w-10 h-10', 'w-full h-full'
  fallbackSeed?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatar, className = "w-10 h-10", fallbackSeed = "fallback" }) => {
  if (!avatar) {
    return <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`} alt="Avatar" className={`${className} object-cover rounded-full bg-white`} />;
  }

  if (typeof avatar === 'string') {
    return <img src={avatar} alt="Avatar" className={`${className} object-cover rounded-full bg-white`} />;
  }

  // It's an AvatarState object
  return (
    <div className={`${className} relative rounded-full overflow-hidden bg-white shadow-inner flex items-center justify-center isolate border-2 border-primary-teal/5`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-teal/5 to-secondary-coral/5 -z-10" />
      
      <svg viewBox="0 0 160 160" className="w-[85%] h-[85%] mt-4" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(80, 80)">
          {/* Base Head */}
          <circle cx="0" cy="0" r="45" fill={avatar.skin} stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
          
          {/* Body/Clothes */}
          <g transform="translate(0, 50)">
            <path 
              d="M -50 40 Q -50 0 0 0 Q 50 0 50 40 L 50 60 L -50 60 Z" 
              fill={avatar.color} 
              stroke="rgba(0,0,0,0.05)" 
              strokeWidth="2" 
            />
            {avatar.clothes === 'v-neck' && (
              <path d="M -15 0 L 0 20 L 15 0 Z" fill="#edf2f7" opacity="0.6" />
            )}
            {(avatar.clothes === 'shirt' || avatar.clothes === 'tank') && (
              <path d="M -20 0 Q 0 15 20 0 Z" fill="#edf2f7" opacity="0.6" />
            )}
            {avatar.clothes === 'hoodie' && (
              <path d="M -30 0 Q 0 -10 30 0 L 35 20 Q 0 40 -35 20 Z" fill={avatar.color} filter="brightness(0.85)" />
            )}
          </g>

          {/* Hair back layer if needed, otherwise just front */}
          <g fill={avatar.color}>
            {avatar.hair === 'style1' && <path d="M -45 5 Q -45 -55 0 -55 Q 45 -55 45 5 Q 45 -20 0 -35 Q -45 -20 -45 5 Z" />}
            {avatar.hair === 'style2' && <path d="M -50 10 Q -50 -50 0 -50 Q 50 -50 50 10 Q 45 -15 0 -25 Q -45 -15 -50 10 Z" />}
            {avatar.hair === 'style3' && <path d="M -40 -10 Q -40 -45 0 -45 Q 40 -45 40 -10 Q 0 -30 -40 -10 Z" />}
            {avatar.hair === 'style4' && <circle cx="0" cy="-40" r="22" />}
          </g>

          {/* Eyes */}
          <g fill="#1F1F1F">
            {avatar.eyes === 'normal' && (
              <>
                <circle cx="-15" cy="-5" r="5" />
                <circle cx="15" cy="-5" r="5" />
              </>
            )}
            {avatar.eyes === 'blink' && (
              <>
                <rect x="-20" y="-6" width="10" height="2" rx="1" />
                <rect x="10" y="-6" width="10" height="2" rx="1" />
              </>
            )}
            {avatar.eyes === 'wink' && (
              <>
                <circle cx="-15" cy="-5" r="5" />
                <rect x="10" y="-6" width="10" height="2" rx="1" />
              </>
            )}
            {avatar.eyes === 'cool' && (
              <path d="M -25 -8 L 25 -8 L 20 -2 L -20 -2 Z" />
            )}
          </g>

          {/* Mouth */}
          <g fill="none" stroke="#1F1F1F" strokeWidth="3" strokeLinecap="round">
            {avatar.mouth === 'smile' && <path d="M -10 15 Q 0 25 10 15" />}
            {avatar.mouth === 'laugh' && <path d="M -14 15 Q 0 35 14 15 Z" fill="#1F1F1F" />}
            {avatar.mouth === 'neutral' && <line x1="-8" y1="18" x2="8" y2="18" />}
            {avatar.mouth === 'surprise' && <circle cx="0" cy="20" r="4" fill="#1F1F1F" strokeWidth="0" />}
          </g>

          {/* Accessory */}
          {avatar.accessory === 'glasses' && (
            <g fill="none" stroke="#1F1F1F" strokeWidth="3">
              <circle cx="-15" cy="-5" r="12" />
              <circle cx="15" cy="-5" r="12" />
              <line x1="-3" y1="-5" x2="3" y2="-5" />
            </g>
          )}
          {avatar.accessory === 'headphones' && (
            <g>
              <path d="M -40 5 C -40 -50 40 -50 40 5" fill="none" stroke="#1F1F1F" strokeWidth="5" />
              <rect x="-45" y="-10" width="10" height="30" rx="5" fill={avatar.color} />
              <rect x="35" y="-10" width="10" height="30" rx="5" fill={avatar.color} />
            </g>
          )}
          {avatar.accessory === 'cap' && (
            <g>
              <path d="M -40 -30 Q 0 -55 40 -30 L 55 -30 A 5 5 0 0 1 50 -20 L -45 -20 Z" fill={avatar.color} opacity="0.9" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
