import type { VideoClip } from '../types/video-clip'
import { searchPixabay } from './pixabay'
import { searchPexels } from './pexels'
import { searchVidevo } from './videvo'
import type { VideoSource } from '../types/video-clip'

const adapters: Record<VideoSource, (query: string, perPage?: number) => Promise<VideoClip[]>> = {
  pixabay: searchPixabay,
  pexels: searchPexels,
  videvo: searchVidevo,
}

export async function searchAllSources(
  query: string,
  sources: VideoSource[],
  perPage: number = 10
): Promise<VideoClip[]> {
  const results = await Promise.allSettled(
    sources.map(source => adapters[source](query, perPage))
  )

  const clips: VideoClip[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      clips.push(...result.value)
    }
  }

  return clips
}

export async function searchForLyricLine(
  line: string,
  sources: VideoSource[],
  keywords?: string[]
): Promise<VideoClip[]> {
  const query = keywords?.join(' ') || line
  return searchAllSources(query, sources, 8)
}