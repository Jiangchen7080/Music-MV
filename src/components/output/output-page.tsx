import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { useProjectStore } from '../../stores/project-store'
import { useConfigStore } from '../../stores/config-store'
import { useTimelineStore } from '../../stores/timeline-store'
import { renderVideo, type RenderProgress } from '../../services/render-engine'
import { generateCopyrightText } from '../../utils/copyright'
import { Sparkles, Download, Film, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react'

const stageLabels: Record<string, string> = {
  'ffmpeg-load': '加载渲染引擎',
  'download-clips': '下载视频素材',
  'render': '视频渲染合成',
  'complete': '完成',
}

export function OutputPage() {
  const { audioFile, trimInfo, setStep } = useProjectStore()
  const { config } = useConfigStore()
  const { segments } = useTimelineStore()
  const [renderState, setRenderState] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState<RenderProgress>({ stage: 'ffmpeg-load', progress: 0, detail: '' })
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const outputRef = useRef<HTMLVideoElement>(null)
  const cancelRef = useRef(false)

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl)
    }
  }, [outputUrl])

  const isVertical = config.videoRatio === '9:16'
  const copyrightText = generateCopyrightText(segments)
  const mvDurationLabel = config.mvDuration === 'short' ? '短版' : config.mvDuration === 'medium' ? '中版' : '全曲'

  const handleRender = async () => {
    if (!audioFile) return

    cancelRef.current = false
    setRenderState('rendering')
    setErrorMessage(null)
    setVideoError(false)

    try {
      const blob = await renderVideo(segments, audioFile, config, (p) => {
        if (cancelRef.current) throw new Error('渲染已取消')
        setProgress(p)
      })

      const url = URL.createObjectURL(blob)
      setOutputUrl(url)
      setRenderState('done')
    } catch (err) {
      if (cancelRef.current) {
        setRenderState('idle')
        return
      }
      setErrorMessage(err instanceof Error ? err.message : '渲染失败，请重试')
      setRenderState('error')
    }
  }

  const handleCancel = () => {
    cancelRef.current = true
  }

  const handleDownload = () => {
    if (!outputUrl) return
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `AI-MV_${config.videoRatio}_${mvDurationLabel}.mp4`
    a.click()
  }

  const currentStageIndex = ['ffmpeg-load', 'download-clips', 'render', 'complete'].indexOf(progress.stage)

  const hasClips = segments.some(s => s.selectedClip !== null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary-400" />
            导出 MV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`relative rounded-xl overflow-hidden bg-black/60 ${isVertical ? 'max-w-[40%] mx-auto' : ''}`}>
            {outputUrl && !videoError ? (
              <video
                ref={outputRef}
                src={outputUrl}
                controls
                className={`w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'}`}
                onError={() => setVideoError(true)}
              />
            ) : (
              <div className={`${isVertical ? 'aspect-[9/16] max-h-[400px]' : 'aspect-video'} flex flex-col items-center justify-center gap-3 text-surface-500`}>
                {renderState === 'rendering' ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                    <p className="text-sm text-primary-400">渲染完成后自动显示预览</p>
                  </>
                ) : videoError ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-sm text-amber-400">视频预览不可用，请尝试下载</p>
                  </>
                ) : (
                  <>
                    <Film className="w-12 h-12" />
                    <p className="text-sm">渲染完成后可预览</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-surface-400">
            <span>{isVertical ? '竖屏 9:16' : '横屏 16:9'}</span>
            <span>·</span>
            <span>{mvDurationLabel}</span>
            {trimInfo && (
              <>
                <span>·</span>
                <span>{trimInfo.description}</span>
              </>
            )}
            <span>·</span>
            <span>{segments.length} 个片段</span>
          </div>

          {renderState === 'idle' && !hasClips && (
            <p className="text-xs text-amber-400 text-center">
              提示：当前没有片段已分配视频素材，渲染结果可能不完整。
            </p>
          )}

          {renderState === 'rendering' && (
            <div className="space-y-4">
              <Progress value={progress.progress} className="h-2" />
              <div className="space-y-2">
                {Object.entries(stageLabels).map(([stage, label]) => {
                  const stageIndex = Object.keys(stageLabels).indexOf(stage)
                  const isDone = stageIndex < currentStageIndex
                  const isActive = stage === progress.stage

                  return (
                    <div key={stage} className="flex items-center gap-3 text-sm">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-surface-600 shrink-0" />
                      )}
                      <span className={isDone || isActive ? 'text-white' : 'text-surface-500'}>
                        {label}
                      </span>
                      {isActive && (
                        <span className="text-xs text-surface-400 ml-auto">{progress.detail}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <Button variant="ghost" size="sm" className="w-full text-surface-400" onClick={handleCancel}>
                <XCircle className="w-3 h-3 mr-1" /> 取消渲染
              </Button>
            </div>
          )}

          {renderState === 'error' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-400">{errorMessage || '渲染失败'}</p>
            </div>
          )}

          {renderState === 'idle' && (
            <Button className="w-full" size="lg" onClick={handleRender} disabled={!audioFile}>
              <Sparkles className="w-4 h-4 mr-2" />
              开始渲染 MV
            </Button>
          )}

          {renderState === 'rendering' && (
            <Button className="w-full" size="lg" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              渲染中...
            </Button>
          )}

          {renderState === 'done' && (
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setRenderState('idle'); setOutputUrl(null); setVideoError(false) }}>
                重新渲染
              </Button>
              <Button className="flex-1" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载 MP4
              </Button>
            </div>
          )}

          {renderState === 'error' && (
            <Button className="w-full" onClick={handleRender}>
              重试渲染
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">素材来源 & 版权信息</CardTitle>
              {showDetails ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
            </div>
          </CardHeader>
        </button>
        {showDetails && (
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {segments.map((seg, i) => {
                const clip = seg.selectedClip
                if (!clip) return null
                return (
                  <div key={seg.id} className="text-xs text-surface-400 flex items-start gap-2">
                    <span className="text-surface-500 shrink-0">#{i + 1}</span>
                    <span>{clip.author ? `作者: ${clip.author}` : clip.source} · {clip.license || clip.source === 'pixabay' ? 'Pixabay License' : clip.source === 'pexels' ? 'Pexels License' : 'Videvo License'}</span>
                  </div>
                )
              })}
              <p className="text-[10px] text-surface-500 mt-3 pt-2 border-t border-surface-800">
                {copyrightText}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => setStep('edit')} className="text-surface-400">
          返回编辑
        </Button>
      </div>
    </div>
  )
}