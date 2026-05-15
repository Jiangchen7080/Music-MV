import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useConfigStore } from '../../stores/config-store'
import { useProjectStore } from '../../stores/project-store'
import type { GenerateMode, VideoRatio, Quality, MvDuration, SubtitleStyle, ClipLength } from '../../types/config'
import type { VideoSource } from '../../types/video-clip'
import { Zap, Sparkles } from 'lucide-react'

const modeOptions: { value: GenerateMode; label: string; desc: string }[] = [
  { value: 'lyric-match', label: '逐句匹配', desc: '每句歌词匹配独立画面 + 卡拉OK字幕' },
  { value: 'theme-segment', label: '按主题分段', desc: '按情绪段落匹配统一风格' },
  { value: 'atmosphere-loop', label: '氛围循环', desc: '少量高质量画面 + 居中字幕' },
]

const durationOptions: { value: MvDuration; label: string; desc: string }[] = [
  { value: 'short', label: '短版', desc: '30-60s，适合短视频引流' },
  { value: 'medium', label: '中版', desc: '60-90s，适合小红书/B站' },
  { value: 'full', label: '全曲', desc: '完整歌曲长度' },
]

const ratioOptions: { value: VideoRatio; label: string }[] = [
  { value: '9:16', label: '竖屏 9:16' },
  { value: '16:9', label: '横屏 16:9' },
]

const qualityOptions: { value: Quality; label: string }[] = [
  { value: '720p', label: '720p 流畅' },
  { value: '1080p', label: '1080p 均衡' },
  { value: '2k', label: '2K 高清' },
]

const subtitleOptions: { value: SubtitleStyle; label: string }[] = [
  { value: 'karaoke', label: '卡拉OK高亮' },
  { value: 'bottom-static', label: '底部静态' },
  { value: 'center-art', label: '居中艺术字' },
  { value: 'dynamic-float', label: '动态浮动' },
  { value: 'split-screen', label: '上下分屏' },
  { value: 'typewriter', label: '打字机效果' },
  { value: 'border-frame', label: '边框字幕' },
  { value: 'gradient', label: '渐变过渡' },
  { value: 'corner-annotation', label: '局部标注' },
  { value: 'pop-card', label: '弹出卡片' },
]

const sourceOptions: { value: VideoSource; label: string }[] = [
  { value: 'pixabay', label: 'Pixabay' },
  { value: 'pexels', label: 'Pexels' },
  { value: 'videvo', label: 'Videvo' },
]

interface Preset {
  name: string
  desc: string
  icon: string
  config: {
    mode: GenerateMode
    mvDuration: MvDuration
    videoRatio: VideoRatio
    subtitleStyle: SubtitleStyle
    quality: Quality
    sources: VideoSource[]
  }
}

const presets: Preset[] = [
  {
    name: '短视频爆款',
    desc: '竖屏 9:16 · 短版 · 逐句匹配 · 适合抖音/视频号',
    icon: '📱',
    config: {
      mode: 'lyric-match',
      mvDuration: 'short',
      videoRatio: '9:16',
      subtitleStyle: 'karaoke',
      quality: '1080p',
      sources: ['pixabay', 'pexels'],
    },
  },
  {
    name: '情感慢歌',
    desc: '横屏 16:9 · 全曲 · 按主题分段 · 适合B站/YouTube',
    icon: '🎵',
    config: {
      mode: 'theme-segment',
      mvDuration: 'full',
      videoRatio: '16:9',
      subtitleStyle: 'center-art',
      quality: '1080p',
      sources: ['pixabay', 'pexels'],
    },
  },
  {
    name: '电子氛围',
    desc: '竖屏 9:16 · 中版 · 氛围循环 · 适合短视频',
    icon: '✨',
    config: {
      mode: 'atmosphere-loop',
      mvDuration: 'medium',
      videoRatio: '9:16',
      subtitleStyle: 'dynamic-float',
      quality: '1080p',
      sources: ['pixabay', 'pexels', 'videvo'],
    },
  },
  {
    name: '古风国韵',
    desc: '横屏 16:9 · 全曲 · 按主题分段 · 典雅风格',
    icon: '🏮',
    config: {
      mode: 'theme-segment',
      mvDuration: 'full',
      videoRatio: '16:9',
      subtitleStyle: 'gradient',
      quality: '1080p',
      sources: ['pixabay', 'pexels'],
    },
  },
]

function OptionGroup<T extends string>({
  title, options, value, onChange,
}: {
  title: string
  options: { value: T; label: string; desc?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-surface-300 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              value === opt.value
                ? 'bg-primary-500 text-white'
                : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {opt.label}
            {opt.desc && (
              <span className="block text-xs opacity-70 mt-0.5">{opt.desc}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ConfigPage() {
  const { config, updateConfig } = useConfigStore()
  const setStep = useProjectStore((s) => s.setStep)

  const applyPreset = (preset: Preset) => {
    updateConfig(preset.config)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-primary-500/30 bg-primary-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">快速出片</h3>
              <p className="text-sm text-surface-400 mb-4">使用推荐设置一键生成，适合快速出片。想精细调整可往下配置。</p>
              <Button
                onClick={() => setStep('generate')}
                size="lg"
                className="bg-primary-500 hover:bg-primary-400 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                快速生成 MV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            预设模板
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="text-left p-4 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-primary-500/50 transition-all group"
              >
                <span className="text-2xl block mb-2">{preset.icon}</span>
                <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{preset.name}</p>
                <p className="text-xs text-surface-400 mt-1">{preset.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>生成模式</CardTitle>
        </CardHeader>
        <CardContent>
          <OptionGroup
            title="选择 MV 生成风格"
            options={modeOptions}
            value={config.mode}
            onChange={(v) => updateConfig({ mode: v })}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>MV 时长</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionGroup title="" options={durationOptions} value={config.mvDuration} onChange={(v) => updateConfig({ mvDuration: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>视频比例</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionGroup title="" options={ratioOptions} value={config.videoRatio} onChange={(v) => updateConfig({ videoRatio: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>输出画质</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionGroup title="" options={qualityOptions} value={config.quality} onChange={(v) => updateConfig({ quality: v })} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>字幕风格</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {subtitleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateConfig({ subtitleStyle: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  config.subtitleStyle === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>素材来源</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((opt) => {
              const isSelected = config.sources.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    const newSources = isSelected
                      ? config.sources.filter((s) => s !== opt.value)
                      : [...config.sources, opt.value]
                    updateConfig({ sources: newSources })
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.useLocalVideos}
              onChange={(e) => updateConfig({ useLocalVideos: e.target.checked })}
              className="rounded border-surface-600"
            />
            使用本地素材（可选）
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep('upload')}>
          上一步
        </Button>
        <Button onClick={() => setStep('generate')} size="lg">
          开始生成 MV
        </Button>
      </div>
    </div>
  )
}