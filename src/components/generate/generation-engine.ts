import type { LyricLine } from '../../utils/lyrics-parser'
import { extractKeywords } from '../../utils/keyword-extractor'
import { searchAllSources } from '../../services/search-manager'
import type { VideoSource } from '../../types/video-clip'
import type { TimelineSegment } from '../../types/timeline'
import type { GenerateMode } from '../../types/config'

export interface GenerationProgress {
  stage: string
  progress: number
  detail: string
}

type ProgressCallback = (progress: GenerationProgress) => void

const MUSIC_KEYWORDS = ['music', 'melody', 'rhythm', 'sound', 'wave', 'vibe', 'beat', 'flow']

function extractStyleKeywords(description: string): string[] {
  const words = description.split(/[,，、\s\n]+/).filter(w => w.trim().length > 0)
  return [...new Set(words)]
}

export async function runGeneration(
  lyrics: LyricLine[],
  mode: GenerateMode,
  sources: VideoSource[],
  onProgress: ProgressCallback,
  styleDescription?: string
): Promise<TimelineSegment[]> {
  const isInstrumental = lyrics.every(l => l.text.trim() === '♪' || l.text.trim() === '')
  const styleKeywords = styleDescription ? extractStyleKeywords(styleDescription) : []

  onProgress({ stage: 'lyrics', progress: 10, detail: isInstrumental ? '纯音乐模式，按音频时长分段' : '正在分析歌词结构...' })
  await sleep(200)

  const segments: TimelineSegment[] = []
  let groupSize = mode === 'lyric-match' ? 1 : mode === 'theme-segment' ? 4 : lyrics.length

  onProgress({ stage: 'keywords', progress: 25, detail: styleKeywords.length > 0 ? '结合风格描述优化搜索关键词' : '正在提取搜索关键词...' })
  await sleep(200)

  for (let i = 0; i < lyrics.length; i += groupSize) {
    const group = lyrics.slice(i, i + groupSize)
    const groupText = group.map(l => l.text).join(' ')

    let keywords: string[]
    if (isInstrumental) {
      const kwIndex = i % MUSIC_KEYWORDS.length
      keywords = [MUSIC_KEYWORDS[kwIndex], MUSIC_KEYWORDS[(kwIndex + 1) % MUSIC_KEYWORDS.length]]
    } else {
      keywords = mode === 'atmosphere-loop'
        ? extractKeywords(lyrics.map(l => l.text).join(' '))
        : extractKeywords(groupText)
    }

    if (styleKeywords.length > 0) {
      const styleBoost = styleKeywords.slice(0, 4)
      keywords = [...styleBoost, ...keywords.slice(0, 3 - styleBoost.length)]
    }

    const progressStart = 25 + (i / lyrics.length) * 60

    onProgress({
      stage: 'search',
      progress: Math.round(progressStart),
      detail: `正在搜索素材: "${keywords.slice(0, 3).join(', ')}"`,
    })

    const clips = await searchAllSources(keywords.slice(0, 3).join(' '), sources, 5)

    const segment: TimelineSegment = {
      id: `seg-${i}`,
      lyricsLine: isInstrumental ? `段落 ${Math.floor(i / groupSize) + 1}` : group.map(l => l.text).join('\n'),
      startTime: group[0].time,
      duration: 6,
      selectedClip: clips[0] || null,
      alternativeClips: clips.slice(1),
      transition: 'crossfade',
      trimIn: 0,
      trimOut: 6,
    }
    segments.push(segment)

    await sleep(150)
  }

  onProgress({ stage: 'complete', progress: 100, detail: '素材搜索完成！' })
  await sleep(200)

  return segments
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}