import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { useProjectStore } from '../../stores/project-store'
import { useConfigStore } from '../../stores/config-store'
import { useTimelineStore } from '../../stores/timeline-store'
import { trimAudio } from '../../utils/audio-trimmer'
import { runGeneration } from '../generate/generation-engine'
import { Scissors, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export function TrimAdjuster() {
  const { trimInfo, setTrimInfo, setAudioFile, originalAudioFile, lyrics, styleDescription } = useProjectStore()
  const { config } = useConfigStore()
  const { setSegments } = useTimelineStore()
  const [expanded, setExpanded] = useState(false)
  const [startTime, setStartTime] = useState(trimInfo?.startTime ?? 0)
  const [endTime, setEndTime] = useState(trimInfo?.endTime ?? 30)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)

  const totalDuration = useMemo(() => {
    if (!originalAudioFile) return 0
    return Math.max(endTime, startTime + 10)
  }, [originalAudioFile, endTime, startTime])

  if (config.mvDuration === 'full' || !trimInfo) return null

  const handleApplyTrim = async () => {
    if (startTime >= endTime) {
      setRegenerateError('结束时间必须大于开始时间')
      return
    }
    if (endTime - startTime < 10) {
      setRegenerateError('截取时长不能少于10秒')
      return
    }

    setIsRegenerating(true)
    setRegenerateError(null)

    try {
      const fileToTrim = originalAudioFile || useProjectStore.getState().audioFile
      if (!fileToTrim) {
        setRegenerateError('找不到原始音频文件')
        setIsRegenerating(false)
        return
      }

      const trimmed = await trimAudio(fileToTrim, startTime, endTime)

      setTrimInfo({
        startTime,
        endTime,
        trimmedUrl: trimmed.url,
        description: `手动截取 (${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s)`,
      })

      setAudioFile(new File([trimmed.blob], fileToTrim.name, { type: 'audio/wav' }))

      const filteredLyrics = lyrics.filter(
        l => l.time >= startTime && l.time <= endTime
      )

      if (filteredLyrics.length === 0) {
        setRegenerateError('该时间段内没有歌词')
        setIsRegenerating(false)
        return
      }

      const result = await runGeneration(
        filteredLyrics,
        config.mode,
        config.sources,
        () => {},
        styleDescription
      )

      setSegments(result)
      setExpanded(false)
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : '重新截取失败')
    }

    setIsRegenerating(false)
  }

  return (
    <Card>
      <CardHeader className="p-3 pb-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2 text-xs">
            <Scissors className="w-3 h-3 text-primary-400" />
            <span className="text-surface-300">截取调整</span>
            <span className="text-surface-500">{trimInfo.description}</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-surface-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-surface-500" />
          )}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-surface-400 mb-1 block">开始时间（秒）</label>
              <input
                type="number"
                min={0}
                max={endTime - 10}
                step={0.5}
                value={startTime}
                onChange={(e) => {
                  setStartTime(Number(e.target.value))
                  setRegenerateError(null)
                }}
                className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-surface-400 mb-1 block">结束时间（秒）</label>
              <input
                type="number"
                min={startTime + 10}
                max={totalDuration}
                step={0.5}
                value={endTime}
                onChange={(e) => {
                  setEndTime(Number(e.target.value))
                  setRegenerateError(null)
                }}
                className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span>截取时长：{(endTime - startTime).toFixed(1)}s</span>
          </div>

          <div className="bg-surface-800 rounded-lg p-2">
            <div className="relative h-2 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary-500/30 rounded-full"
                style={{
                  left: `${(startTime / totalDuration) * 100}%`,
                  width: `${((endTime - startTime) / totalDuration) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 w-2 h-full bg-primary-400 rounded-full -translate-x-1/2 cursor-pointer"
                style={{ left: `${(startTime / totalDuration) * 100}%` }}
              />
              <div
                className="absolute top-0 w-2 h-full bg-primary-400 rounded-full -translate-x-1/2 cursor-pointer"
                style={{ left: `${(endTime / totalDuration) * 100}%` }}
              />
            </div>
          </div>

          {regenerateError && (
            <p className="text-xs text-red-400">{regenerateError}</p>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={handleApplyTrim}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 正在重新截取...</>
            ) : (
              <><Scissors className="w-3 h-3 mr-1" /> 重新截取并生成</>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}