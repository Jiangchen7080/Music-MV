import { create } from 'zustand'
import type { LyricLine } from '../utils/lyrics-parser'

type Step = 'upload' | 'config' | 'generate' | 'edit' | 'output'

export interface TrimInfo {
  startTime: number
  endTime: number
  trimmedUrl: string | null
  description: string
}

interface ProjectStore {
  currentStep: Step
  audioFile: File | null
  audioUrl: string | null
  originalAudioFile: File | null
  lyrics: LyricLine[]
  lyricsRaw: string
  styleDescription: string
  trimInfo: TrimInfo | null
  setStep: (step: Step) => void
  setAudioFile: (file: File | null) => void
  setOriginalAudioFile: (file: File | null) => void
  setLyrics: (lyrics: LyricLine[], raw: string) => void
  setStyleDescription: (desc: string) => void
  setTrimInfo: (info: TrimInfo | null) => void
  reset: () => void
}

const initialState = {
  currentStep: 'upload' as Step,
  audioFile: null as File | null,
  audioUrl: null as string | null,
  originalAudioFile: null as File | null,
  lyrics: [] as LyricLine[],
  lyricsRaw: '',
  styleDescription: '',
  trimInfo: null as TrimInfo | null,
}

export const useProjectStore = create<ProjectStore>((set) => ({
  ...initialState,
  setStep: (step) => set({ currentStep: step }),
  setAudioFile: (file) => set({
    audioFile: file,
    audioUrl: file ? URL.createObjectURL(file) : null,
  }),
  setOriginalAudioFile: (file) => set({ originalAudioFile: file }),
  setLyrics: (lyrics, raw) => set({ lyrics, lyricsRaw: raw }),
  setStyleDescription: (desc) => set({ styleDescription: desc }),
  setTrimInfo: (info) => set({ trimInfo: info }),
  reset: () => set(initialState),
}))