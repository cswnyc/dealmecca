'use client';

import { useState } from 'react';
import { AVATAR_LIBRARY, AvatarOption } from '@/lib/avatar-library';

interface AvatarSelectorProps {
  currentAvatarId?: string;
  onSelect: (avatarId: string) => void;
  disabled?: boolean;
}

export default function AvatarSelector({ currentAvatarId, onSelect, disabled = false }: AvatarSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentAvatarId || AVATAR_LIBRARY[0].id);

  const handleAvatarClick = (avatarId: string) => {
    if (disabled) return;
    setSelectedId(avatarId);
    onSelect(avatarId);
  };

  const renderAvatar = (avatar: AvatarOption | undefined) => {
    if (!avatar) {
      return <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">?</div>;
    }
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: avatar.svg.replace(
            '<svg viewBox="0 0 100 100"',
            '<svg viewBox="0 0 100 100" class="w-full h-full"'
          )
        }}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Change your avatar
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Choose an avatar that represents you. This will be displayed in your posts and comments.
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md">
        {AVATAR_LIBRARY.map((avatar) => {
          const isSelected = selectedId === avatar.id;

          return (
            <button
              key={avatar.id}
              onClick={() => handleAvatarClick(avatar.id)}
              disabled={disabled}
              className={`
                relative w-16 h-16 rounded-full overflow-hidden p-1 transition-all duration-200
                ${isSelected
                  ? 'avatar-selected'
                  : 'border-3 border-transparent hover:border-[#2575FC]/30'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              `}
              title={`${avatar.name} - ${avatar.description}`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
                {renderAvatar(avatar)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current selection info */}
      {selectedId && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg"
          style={{ background: 'linear-gradient(135deg, rgba(37, 117, 252, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
            {renderAvatar(AVATAR_LIBRARY.find(a => a.id === selectedId))}
          </div>
          <div>
            <p className="font-medium text-[#162B54] dark:text-[#EAF0FF]">
              {AVATAR_LIBRARY.find(a => a.id === selectedId)?.name}
            </p>
            <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">
              {AVATAR_LIBRARY.find(a => a.id === selectedId)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}