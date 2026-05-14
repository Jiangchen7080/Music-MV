import type { VideoClip } from '../types/video-clip'
import type { TimelineSegment } from '../types/timeline'

export function generateCopyrightText(segments: TimelineSegment[]): string {
  const usedClips = segments
    .map((s) => s.selectedClip)
    .filter((c): c is VideoClip => c !== null)

  const uniqueClips = usedClips.filter(
    (clip, i, arr) => arr.findIndex((c) => c.id === clip.id) === i
  )

  const lines = [
    '本视频素材来源声明：',
    '',
    ...uniqueClips.map(
      (clip) => `- ${clip.source} · 作者: ${clip.author} · ${clip.license}`
    ),
    '',
    '音乐: AI 生成原创音乐',
    '制作工具: AI-MV Studio',
  ]

  return lines.join('\n')
}