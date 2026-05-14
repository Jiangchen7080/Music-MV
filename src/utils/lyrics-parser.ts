export interface LyricLine {
  time: number
  text: string
}

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.trim().split('\n')
  const result: LyricLine[] = []

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  for (const line of lines) {
    const match = line.match(timeRegex)
    if (!match) continue

    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const centiseconds = parseInt(match[3])
    const timeInSeconds = minutes * 60 + seconds + centiseconds / (match[3].length === 3 ? 1000 : 100)

    const text = line.replace(timeRegex, '').trim()
    if (text) {
      result.push({ time: timeInSeconds, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export function parsePlainText(text: string): LyricLine[] {
  return text.trim().split('\n').filter(Boolean).map((line, i) => ({
    time: i * 4,
    text: line.trim(),
  }))
}

export function parseLyrics(input: string): LyricLine[] {
  if (input.includes('[00:')) {
    return parseLrc(input)
  }
  return parsePlainText(input)
}