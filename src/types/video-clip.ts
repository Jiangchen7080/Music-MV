export type VideoSource = 'pixabay' | 'pexels' | 'videvo'

export interface VideoClip {
  id: string
  source: VideoSource
  url: string
  thumbnail: string
  duration: number
  resolution: { w: number; h: number }
  tags: string[]
  author: string
  license: string
  downloadSize: number
}