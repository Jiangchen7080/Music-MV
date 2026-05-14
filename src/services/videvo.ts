import type { VideoClip } from '../types/video-clip'

const VIDEVO_API = 'https://api.videvo.net/api/v2/videos'

export async function searchVidevo(query: string, perPage: number = 10): Promise<VideoClip[]> {
  const apiKey = import.meta.env.VITE_VIDEVO_API_KEY
  if (!apiKey) return []

  const url = `${VIDEVO_API}?q=${encodeURIComponent(query)}&count=${perPage}&license=royalty-free`

  try {
    const res = await fetch(url, {
      headers: { 'Api-Key': apiKey },
    })
    const data = await res.json()

    return (data.videos || []).map((video: any) => ({
      id: `videvo-${video.id}`,
      source: 'videvo' as const,
      url: video.downloads?.[0]?.url || '',
      thumbnail: video.thumbnails?.[0]?.url || '',
      duration: video.duration,
      resolution: { w: video.width || 1920, h: video.height || 1080 },
      tags: video.tags || [],
      author: video.author || 'Unknown',
      license: 'Videvo Royalty-Free License',
      downloadSize: video.downloads?.[0]?.size || 0,
    }))
  } catch {
    return []
  }
}