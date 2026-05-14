const stopWords = new Set([
  '的', '了', '在', '是', '我', '你', '他', '她', '它',
  '们', '这', '那', '就', '也', '还', '都', '要', '有',
  '和', '与', '及', '或', '不', '把', '被', '让', '给',
  '为', '所', '以', '而', '但', '可', '若', '虽', '因',
  '于', '之', '其', '该', '此', '如', '何', '与', '且',
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of',
  'by', 'with', 'from', 'and', 'or', 'but', 'is', 'are',
])

export function extractKeywords(text: string): string[] {
  const cleaned = text.replace(/[^\w\u4e00-\u9fff\s]/g, ' ')
  const words = cleaned.split(/\s+/).filter(w => w.length > 0 && !stopWords.has(w.toLowerCase()))
  const unique = [...new Set(words)]
  return unique.slice(0, 5)
}

export function extractThemeKeywords(lines: string[]): string[] {
  const allKeywords = lines.flatMap(extractKeywords)
  const frequency = new Map<string, number>()
  for (const kw of allKeywords) {
    frequency.set(kw, (frequency.get(kw) || 0) + 1)
  }
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)
}