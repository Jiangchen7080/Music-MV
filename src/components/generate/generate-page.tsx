import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { useProjectStore } from '../../stores/project-store'
import { useConfigStore } from '../../stores/config-store'
import { useTimelineStore } from '../../stores/timeline-store'
import { runGeneration, type GenerationProgress } from './generation-engine'
import { detectHighlight } from '../../utils/highlight-detector'
import { trimAudio } from '../../utils/audio-trimmer'
import type { LyricLine } from '../../utils/lyrics-parser'
import { CheckCircle2, Loader2, Sparkles, Scissors, Music } from 'lucide-react'

const stageLabels: Record<string, string> = {
  'detect': '高光检测',
  'audio-trim': '音频截取',
  'lyrics': '歌词分析',
  'keywords': '关键词提取',
  'search': '素材搜索',
  'complete': '完成',
}

async function getAudioDuration(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  audioContext.close()
  return audioBuffer.duration
}

function generateAutoLyrics(duration: number): LyricLine[] {
  const interval = duration > 120 ? 20 : 15
  const lines: LyricLine[] = []
  for (let t = 0; t < duration; t += interval) {
    lines.push({ time: t, text: '♪' })
  }
  if (lines.length === 0) {
    lines.push({ time: 0, text: '♪' })
  }
  return lines
}

export function GeneratePage() {
  const { lyrics, audioFile, setStep, setTrimInfo, setAudioFile, setOriginalAudioFile, styleDescription } = useProjectStore()
  const { config } = useConfigStore()
  const { setSegments } = useTimelineStore()
  const [progress, setProgress] = useState<GenerationProgress>({ stage: 'detect', progress: 0, detail: '准备中...' })
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trimDesc, setTrimDesc] = useState<string | null>(null)
  const [isInstrumental, setIsInstrumental] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        let effectiveLyrics = lyrics

        if (lyrics.length === 0 && audioFile) {
          setIsInstrumental(true)
          setProgress({ stage: 'lyrics', progress: 5, detail: '纯音乐模式，正在检测音频时长...' })

          const audioDuration = await getAudioDuration(audioFile)
          effectiveLyrics = generateAutoLyrics(audioDuration)

          if (!cancelled) {
            setProgress({ stage: 'lyrics', progress: 10, detail: `音频时长 ${audioDuration.toFixed(0)}s，已生成 ${effectiveLyrics.length} 个分段` })
            await sleep(500)
          }
        }

        if (config.mvDuration !== 'full') {
          setOriginalAudioFile(audioFile)

          setProgress({ stage: 'detect', progress: 15, detail: '正在识别副歌高光段落...' })
          await sleep(300)

          const highlight = effectiveLyrics.length > 0
            ? detectHighlight(effectiveLyrics, config.mvDuration)
            : { startTime: 0, endTime: 45, startLine: 0, endLine: 0, description: '前段高光' }

          setTrimDesc(highlight.description)

          if (!cancelled) {
            setProgress({ stage: 'audio-trim', progress: 25, detail: `正在截取${highlight.description}...` })
          }

          if (audioFile) {
            const trimmed = await trimAudio(audioFile, highlight.startTime, highlight.endTime)
            if (!cancelled) {
              setTrimInfo({
                startTime: highlight.startTime,
                endTime: highlight.endTime,
                trimmedUrl: trimmed.url,
                description: highlight.description,
              })
              setAudioFile(new File([trimmed.blob], audioFile.name, { type: 'audio/wav' }))
            }
          }

          const filteredLyrics = effectiveLyrics.filter(
            l => l.time >= highlight.startTime && l.time <= highlight.endTime
          )

          if (!cancelled) {
            const result = await runGeneration(
              filteredLyrics,
              config.mode,
              config.sources,
              (p) => { if (!cancelled) setProgress(p) },
              styleDescription
            )
            if (!cancelled) {
              setSegments(result)
              setIsComplete(true)
            }
          }
        } else {
          if (!cancelled) {
            setTrimInfo(null)
            const result = await runGeneration(
              effectiveLyrics,
              config.mode,
              config.sources,
              (p) => { if (!cancelled) setProgress(p) },
              styleDescription
            )
            if (!cancelled) {
              setSegments(result)
              setIsComplete(true)
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '生成失败')
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const currentStageIndex = ['detect', 'audio-trim', 'lyrics', 'keywords', 'search', 'complete'].indexOf(progress.stage)

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isComplete ? '生成完成！' : error ? '生成失败' : '正在生成你的 MV...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {!isComplete && !error && (
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto" />
          )}
          {isComplete && (
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          )}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {isInstrumental && (
            <div className="flex items-center justify-center gap-2 text-sm text-surface-400">
              <Music className="w-4 h-4" />
              <span>纯音乐模式</span>
            </div>
          )}

          {trimDesc && !isComplete && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary-300">
              <Scissors className="w-4 h-4" />
              <span>截取模式：{trimDesc}</span>
            </div>
          )}

          <Progress value={progress.progress} />

          <div className="space-y-3">
            {Object.entries(stageLabels).map(([stage, label]) => {
              const stageIndex = Object.keys(stageLabels).indexOf(stage)
              const isDone = stageIndex < currentStageIndex
              const isActive = stage === progress.stage
              const isVisible = config.mvDuration !== 'full' || (stage !== 'detect' && stage !== 'audio-trim')

              if (!isVisible) return null

              return (
                <div key={stage} className="flex items-center gap-3 text-sm">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-surface-600" />
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

          {isComplete && (
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="secondary" onClick={() => setStep('config')}>
                重新配置
              </Button>
              <Button onClick={() => setStep('edit')}>
                进入编辑 <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {error && (
            <Button variant="secondary" onClick={() => setStep('config')}>
              返回重试
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}