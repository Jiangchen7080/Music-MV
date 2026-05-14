import type { LyricLine } from './lyrics-parser'

export interface HighlightResult {
  startTime: number
  endTime: number
  startLine: number
  endLine: number
  description: string
}

const SHORT_DURATION = 45
const MEDIUM_DURATION = 75

export function detectHighlight(
  lyrics: LyricLine[],
  mode: 'short' | 'medium' | 'full'
): HighlightResult {
  if (mode === 'full' || lyrics.length === 0) {
    const lastLine = lyrics[lyrics.length - 1]
    const endTime = lastLine ? lastLine.time + 4 : 30
    return {
      startTime: lyrics[0]?.time || 0,
      endTime,
      startLine: 0,
      endLine: lyrics.length - 1,
      description: '全曲',
    }
  }

  const lineCounts = new Map<string, { count: number; firstIndex: number }>()
  lyrics.forEach((line, i) => {
    const text = line.text.trim()
    if (text.length < 2) return
    const existing = lineCounts.get(text)
    if (existing) {
      existing.count++
    } else {
      lineCounts.set(text, { count: 1, firstIndex: i })
    }
  })

  const sorted = [...lineCounts.entries()]
    .filter(([_, data]) => data.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)

  const targetDuration = mode === 'short' ? SHORT_DURATION : MEDIUM_DURATION
  let chorusStartIdx = Math.floor(lyrics.length * 0.25)
  let chorusEndIdx = Math.floor(lyrics.length * 0.5)

  if (sorted.length > 0) {
    const chorusLine = sorted[0][0]
    chorusStartIdx = lyrics.findIndex(l => l.text.trim() === chorusLine)
    const allOccurrences = lyrics
      .map((l, i) => ({ text: l.text.trim(), index: i }))
      .filter(l => l.text === chorusLine)
      .map(l => l.index)

    if (allOccurrences.length > 1) {
      const firstChorus = allOccurrences[0]
      const secondChorus = allOccurrences[1]
      const chorusLength = secondChorus - firstChorus
      chorusStartIdx = firstChorus
      chorusEndIdx = Math.min(firstChorus + chorusLength, lyrics.length - 1)
    }
  }

  if (mode === 'short') {
    const startIdx = Math.max(0, chorusStartIdx - 1)
    const endIdx = Math.min(lyrics.length - 1, chorusEndIdx + 2)
    return {
      startTime: lyrics[startIdx]?.time || 0,
      endTime: lyrics[endIdx]?.time || lyrics[lyrics.length - 1]?.time || 60,
      startLine: startIdx,
      endLine: endIdx,
      description: '副歌高光片段',
    }
  }

  const startIdx = Math.max(0, chorusStartIdx - 4)
  const endIdx = Math.min(lyrics.length - 1, chorusEndIdx + 4)
  let endTime = lyrics[endIdx]?.time || lyrics[lyrics.length - 1]?.time || 90
  if (endTime - lyrics[startIdx].time > targetDuration) {
    endTime = lyrics[startIdx].time + targetDuration
  }
  return {
    startTime: lyrics[startIdx]?.time || 0,
    endTime,
    startLine: startIdx,
    endLine: endIdx,
    description: '主歌+副歌精华',
  }
}