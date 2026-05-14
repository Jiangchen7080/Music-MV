import type { VideoClip } from './video-clip'

export type TransitionStyle =
  | 'none' | 'fade' | 'crossfade'
  | 'push-left' | 'push-right' | 'push-up'
  | 'zoom' | 'circle' | 'flash'
  | 'rotate' | 'wipe' | 'grid'
  | 'star' | 'cube' | 'film'

export interface TimelineSegment {
  id: string
  lyricsLine: string
  startTime: number
  duration: number
  selectedClip: VideoClip | null
  alternativeClips: VideoClip[]
  transition: TransitionStyle
  trimIn: number
  trimOut: number
}

export interface TimelineState {
  segments: TimelineSegment[]
  totalDuration: number
}