import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useConfigStore } from '../../stores/config-store'
import { useProjectStore } from '../../stores/project-store'
import type { GenerateMode, VideoRatio, Quality, MvDuration, SubtitleStyle, ClipLength } from '../../types/config'
import type { VideoSource } from '../../types/video-clip'

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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