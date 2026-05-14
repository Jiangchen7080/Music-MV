import { useState, useRef } from 'react'
import type { TimelineSegment } from '../../types/timeline'
import { cn } from '../../lib/utils'

function ThumbnailImg({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-surface-800 animate-pulse" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-surface-800 flex items-center justify-center">
          <span className="text-[8px] text-surface-500">加载失败</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-40' : 'opacity-0'
          )}
        />
      )}
    </>
  )
}

interface TimelineBarProps {
  segments: TimelineSegment[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TimelineBar({ segments, selectedId, onSelect }: TimelineBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div ref={containerRef} className="bg-surface-900 rounded-xl p-3 overflow-x-auto">
      <div className="flex gap-1 min-w-[300px]">
        {segments.map((seg) => {
          const width = Math.max(8, (seg.duration / totalDuration) * 100)
          return (
            <button
              key={seg.id}
              onClick={() => onSelect(seg.id)}
              style={{ width: `${width}%`, minWidth: '60px' }}
              className={cn(
                'relative h-16 rounded-lg transition-all overflow-hidden group',
                selectedId === seg.id
                  ? 'ring-2 ring-primary-500 bg-primary-500/20'
                  : 'bg-surface-800 hover:bg-surface-700'
              )}
            >
              {seg.selectedClip?.thumbnail && (
                <ThumbnailImg src={seg.selectedClip.thumbnail} alt="" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-white font-medium leading-tight text-center px-1 line-clamp-2">
                  {seg.lyricsLine.slice(0, 20)}
                </span>
                <span className="text-[9px] text-surface-400 mt-0.5">{seg.duration.toFixed(1)}s</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}