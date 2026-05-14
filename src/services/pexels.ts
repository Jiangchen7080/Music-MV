import type { VideoClip } from '../types/video-clip'

const PEXELS_API = 'https://api.pexels.com/videos/search'

export async function searchPexels(query: string, perPage: number = 10): Promise<VideoClip[]> {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY
  if (!apiKey) return []

  const url = `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=${perPage}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    })
    const data = await res.json()

    return (data.videos || []).map((video: any) => {
      const hdFile = video.video_files?.find((f: any) => f.quality === 'hd') || video.video_files?.[0]
      const thumb = video.image || ''
      return {
        id: `pexels-${video.id}`,
        source: 'pexels' as const,
        url: hdFile?.link || '',
        thumbnail: thumb,
        duration: video.duration,
        resolution: { w: hdFile?.width || 1920, h: hdFile?.height || 1080 },
        tags: [],
        author: video.user?.name || 'Unknown',
        license: 'Pexels License (Free for commercial use, no attribution required)',
        downloadSize: hdFile?.size || 0,
      }
    })
  } catch {
    return []
  }
}