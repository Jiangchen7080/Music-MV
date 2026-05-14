import { create } from 'zustand'
import type { TimelineSegment, TransitionStyle } from '../types/timeline'
import type { VideoClip } from '../types/video-clip'

interface TimelineStore {
  segments: TimelineSegment[]
  setSegments: (segments: TimelineSegment[]) => void
  replaceClip: (segmentId: string, clip: VideoClip) => void
  splitSegment: (segmentId: string, atTime: number) => void
  trimSegment: (segmentId: string, trimIn: number, trimOut: number) => void
  reorderSegments: (fromIndex: number, toIndex: number) => void
  changeTransition: (segmentId: string, transition: TransitionStyle) => void
  addAlternativeClips: (segmentId: string, clips: VideoClip[]) => void
  getTotalDuration: () => number
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  segments: [],

  setSegments: (segments) => set({ segments }),

  replaceClip: (segmentId, clip) => set((state) => ({
    segments: state.segments.map((seg) =>
      seg.id === segmentId ? { ...seg, selectedClip: clip } : seg
    ),
  })),

  splitSegment: (segmentId, atTime) => set((state) => {
    const idx = state.segments.findIndex((s) => s.id === segmentId)
    if (idx === -1) return state

    const segment = state.segments[idx]
    if (atTime <= 0 || atTime >= segment.duration) return state

    const newSegments = [...state.segments]
    const firstHalf: TimelineSegment = {
      ...segment,
      id: `${segment.id}-1`,
      duration: atTime,
      trimOut: segment.trimIn + atTime,
    }
    const secondHalf: TimelineSegment = {
      ...segment,
      id: `${segment.id}-2`,
      startTime: segment.startTime + atTime,
      duration: segment.duration - atTime,
      trimIn: segment.trimIn + atTime,
    }
    newSegments.splice(idx, 1, firstHalf, secondHalf)
    return { segments: newSegments }
  }),

  trimSegment: (segmentId, trimIn, trimOut) => set((state) => ({
    segments: state.segments.map((seg) =>
      seg.id === segmentId
        ? { ...seg, trimIn, trimOut, duration: trimOut - trimIn }
        : seg
    ),
  })),

  reorderSegments: (fromIndex, toIndex) => set((state) => {
    const newSegments = [...state.segments]
    const [moved] = newSegments.splice(fromIndex, 1)
    newSegments.splice(toIndex, 0, moved)
    let currentTime = 0
    return {
      segments: newSegments.map((seg) => {
        const updated = { ...seg, startTime: currentTime }
        currentTime += seg.duration
        return updated
      }),
    }
  }),

  changeTransition: (segmentId, transition) => set((state) => ({
    segments: state.segments.map((seg) =>
      seg.id === segmentId ? { ...seg, transition } : seg
    ),
  })),

  addAlternativeClips: (segmentId, clips) => set((state) => ({
    segments: state.segments.map((seg) =>
      seg.id === segmentId
        ? { ...seg, alternativeClips: [...seg.alternativeClips, ...clips] }
        : seg
    ),
  })),

  getTotalDuration: () => {
    return get().segments.reduce((sum, seg) => sum + seg.duration, 0)
  },
}))