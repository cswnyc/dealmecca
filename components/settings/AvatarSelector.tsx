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
                relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200
                ${isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : 'border-border hover:border-border/80 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              `}
              title={`${avatar.name} - ${avatar.description}`}
            >
              {renderAvatar(avatar)}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current selection info */}
      {selectedId && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
              {renderAvatar(AVATAR_LIBRARY.find(a => a.id === selectedId))}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {AVATAR_LIBRARY.find(a => a.id === selectedId)?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {AVATAR_LIBRARY.find(a => a.id === selectedId)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}