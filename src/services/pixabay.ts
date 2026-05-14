import type { VideoClip } from '../types/video-clip'

const PIXABAY_API = 'https://pixabay.com/api/videos'

export async function searchPixabay(query: string, perPage: number = 10): Promise<VideoClip[]> {
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY
  if (!apiKey) return []

  const url = `${PIXABAY_API}?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&safesearch=true`

  try {
    const res = await fetch(url)
    const data = await res.json()

    return (data.hits || []).map((hit: any) => ({
      id: `pixabay-${hit.id}`,
      source: 'pixabay' as const,
      url: hit.videos?.medium?.url || '',
      thumbnail: hit.videos?.tiny?.url || hit.pageURL,
      duration: hit.duration,
      resolution: { w: hit.videos?.medium?.width || 1920, h: hit.videos?.medium?.height || 1080 },
      tags: (hit.tags || '').split(',').map((t: string) => t.trim()),
      author: hit.user,
      license: 'Pixabay License (Free for commercial use, no attribution required)',
      downloadSize: hit.videos?.medium?.size || 0,
    }))
  } catch {
    return []
  }
}