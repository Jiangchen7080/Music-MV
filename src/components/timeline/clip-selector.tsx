import { useState } from 'react'
import type { VideoClip } from '../../types/video-clip'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

function ClipThumbnail({ clip, isSelected, onSelect }: { clip: VideoClip; isSelected: boolean; onSelect: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-lg overflow-hidden aspect-video group',
        isSelected && 'ring-2 ring-primary-500'
      )}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-surface-800 animate-pulse" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-surface-800 flex items-center justify-center">
          <span className="text-xs text-surface-500">加载失败</span>
        </div>
      ) : (
        <img
          src={clip.thumbnail}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-xs text-white">替换</span>
      </div>
      <div className="absolute bottom-1 left-1 bg-black/70 text-[10px] text-white px-1 rounded">
        {clip.duration.toFixed(1)}s
      </div>
      <div className="absolute top-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded">
        {clip.source}
      </div>
    </button>
  )
}

interface ClipSelectorProps {
  currentClip: VideoClip | null
  alternatives: VideoClip[]
  onSelect: (clip: VideoClip) => void
}

export function ClipSelector({ currentClip, alternatives, onSelect }: ClipSelectorProps) {
  const allClips = currentClip ? [currentClip, ...alternatives] : alternatives

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">替换素材</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {allClips.map((clip) => (
            <ClipThumbnail
              key={clip.id}
              clip={clip}
              isSelected={currentClip?.id === clip.id}
              onSelect={() => onSelect(clip)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}