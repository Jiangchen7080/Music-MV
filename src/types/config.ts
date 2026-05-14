import type { VideoSource } from './video-clip'

export type GenerateMode = 'lyric-match' | 'theme-segment' | 'atmosphere-loop'
export type VideoRatio = '9:16' | '16:9'
export type Quality = '720p' | '1080p' | '2k'
export type MvDuration = 'short' | 'medium' | 'full'
export type SubtitleStyle =
  | 'karaoke' | 'bottom-static' | 'center-art' | 'dynamic-float'
  | 'split-screen' | 'typewriter' | 'border-frame' | 'gradient'
  | 'corner-annotation' | 'pop-card'
export type ClipLength = 'auto' | 'short' | 'medium' | 'long'

export interface GenerateConfig {
  mode: GenerateMode
  mvDuration: MvDuration
  videoRatio: VideoRatio
  sources: VideoSource[]
  useLocalVideos: boolean
  subtitleStyle: SubtitleStyle
  transitionStyle: string
  clipLength: ClipLength
  quality: Quality
}