import { create } from 'zustand'
import type { GenerateConfig } from '../types/config'

interface ConfigStore {
  config: GenerateConfig
  updateConfig: (partial: Partial<GenerateConfig>) => void
}

const defaultConfig: GenerateConfig = {
  mode: 'lyric-match',
  mvDuration: 'full',
  videoRatio: '16:9',
  sources: ['pixabay', 'pexels'],
  useLocalVideos: false,
  subtitleStyle: 'karaoke',
  transitionStyle: 'crossfade',
  clipLength: 'auto',
  quality: '1080p',
}

export const useConfigStore = create<ConfigStore>((set) => ({
  config: defaultConfig,
  updateConfig: (partial) => set((state) => ({
    config: { ...state.config, ...partial },
  })),
}))