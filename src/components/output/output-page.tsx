import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useProjectStore } from '../../stores/project-store'
import { useConfigStore } from '../../stores/config-store'
import { useTimelineStore } from '../../stores/timeline-store'
import { generateCopyrightText } from '../../utils/copyright'
import { Download, Copy, Check, RotateCcw, Construction, Scissors } from 'lucide-react'

export function OutputPage() {
  const { setStep, audioFile, trimInfo } = useProjectStore()
  const { config } = useConfigStore()
  const { segments } = useTimelineStore()
  const [copied, setCopied] = useState(false)

  const copyrightText = generateCopyrightText(segments)

  const handleCopyCopyright = async () => {
    await navigator.clipboard.writeText(copyrightText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)
  const totalClips = segments.filter((s) => s.selectedClip).length
  const sourceStats = segments.reduce((acc, s) => {
    if (s.selectedClip) {
      acc[s.selectedClip.source] = (acc[s.selectedClip.source] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const firstThumbnail = segments.find((s) => s.selectedClip?.thumbnail)?.selectedClip?.thumbnail
  const isVertical = config.videoRatio === '9:16'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MV 概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`bg-black/60 rounded-xl flex items-center justify-center overflow-hidden relative ${isVertical ? 'aspect-[9/16] max-w-[40%] mx-auto' : 'aspect-video'}`}>
            {firstThumbnail ? (
              <img src={firstThumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            ) : null}
            <div className="text-center text-surface-400 relative z-10">
              <Download className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium text-white mb-2">{audioFile?.name?.replace(/\.[^/.]+$/, '') || '我的MV'}</p>
              <p className="text-sm">
                {totalDuration.toFixed(0)} 秒 · {totalClips} 个素材片段
              </p>
              <p className="text-xs mt-1">
                {config.videoRatio} · {Object.entries(sourceStats).map(([s, c]) => `${s}(${c})`).join(' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-surface-500">
            <span>{config.videoRatio === '9:16' ? '竖屏' : '横屏'}</span>
            <span>·</span>
            <span>{config.mvDuration === 'full' ? '全曲' : config.mvDuration === 'short' ? '短版' : '中版'}</span>
            {trimInfo && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  {trimInfo.description}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>版权声明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="bg-surface-900 rounded-lg p-4 text-xs text-surface-300 whitespace-pre-wrap font-mono">
            {copyrightText}
          </pre>
          <Button variant="secondary" size="sm" onClick={handleCopyCopyright}>
            {copied ? (
              <><Check className="w-3 h-3 mr-1" /> 已复制</>
            ) : (
              <><Copy className="w-3 h-3 mr-1" /> 复制版权说明</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>视频合成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-surface-800 rounded-lg">
            <Construction className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm text-surface-300">
              <p className="text-white font-medium mb-1">视频合成功能开发中</p>
              <p>当前版本已完成素材搜索、时间线编辑和配置流程。下一步将接入 FFmpeg.wasm 实现浏览器端视频渲染合成，支持 MP4 导出下载。</p>
              <p className="mt-2 text-xs text-surface-500">预计下一阶段更新。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep('edit')}>
          <RotateCcw className="w-4 h-4 mr-1" /> 返回编辑
        </Button>
        <Button size="lg" disabled>
          <Download className="w-4 h-4 mr-1" />
          下载视频
        </Button>
      </div>
    </div>
  )
}