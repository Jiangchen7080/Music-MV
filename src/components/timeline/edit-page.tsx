import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useProjectStore } from '../../stores/project-store'
import { useConfigStore } from '../../stores/config-store'
import { useTimelineStore } from '../../stores/timeline-store'
import { TimelineBar } from './timeline-bar'
import { SegmentCard } from './segment-card'
import { ClipSelector } from './clip-selector'
import { TransitionPicker } from './transition-picker'
import { TrimAdjuster } from './trim-adjuster'
import { AudioWaveform } from './audio-waveform'
import { Play, Download, ImageIcon } from 'lucide-react'

export function EditPage() {
  const { setStep, audioUrl } = useProjectStore()
  const { config } = useConfigStore()
  const { segments } = useTimelineStore()
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    segments[0]?.id || null
  )

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId)
  const isVertical = config.videoRatio === '9:16'
  const totalDuration = segments.length > 0
    ? segments[segments.length - 1].startTime + segments[segments.length - 1].duration
    : 0

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] gap-4">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1">
            <CardContent className="p-0 flex flex-col bg-black/40 rounded-xl overflow-hidden min-h-[300px]">
              {selectedSegment?.selectedClip?.thumbnail ? (
                <div className="relative flex-1 flex flex-col">
                  <div className={`relative flex-1 min-h-[200px] flex items-center justify-center ${isVertical ? 'max-w-[40%] mx-auto' : ''}`}>
                    <div className={isVertical ? 'aspect-[9/16] max-h-[400px]' : 'aspect-video w-full'}>
                      <img
                        src={selectedSegment.selectedClip.thumbnail}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent ${isVertical ? 'rounded' : ''}`} />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="bg-black/60 rounded px-2 py-1 text-xs text-white">
                        {selectedSegment.selectedClip.source}
                      </div>
                      <div className="bg-black/60 rounded px-2 py-1 text-xs text-white">
                        {selectedSegment.lyricsLine.slice(0, 30)}
                      </div>
                    </div>
                  </div>
                  {audioUrl && (
                    <div className="px-4 py-3 bg-black/40">
                      <audio controls src={audioUrl} className="w-full" />
                    </div>
                  )}
                  {audioUrl && selectedSegment && (
                    <AudioWaveform
                      audioUrl={audioUrl}
                      segmentStart={selectedSegment.startTime}
                      segmentEnd={selectedSegment.startTime + selectedSegment.duration}
                      totalDuration={totalDuration}
                    />
                  )}
                </div>
              ) : audioUrl ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] gap-3">
                  <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
                    <Play className="w-6 h-6 text-surface-400" />
                  </div>
                  <p className="text-sm text-surface-400">音频预览</p>
                  <audio controls src={audioUrl} className="w-full max-w-md mt-2" />
                  {selectedSegment && (
                    <AudioWaveform
                      audioUrl={audioUrl}
                      segmentStart={selectedSegment.startTime}
                      segmentEnd={selectedSegment.startTime + selectedSegment.duration}
                      totalDuration={totalDuration}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] gap-2 text-surface-500">
                  <ImageIcon className="w-12 h-12" />
                  <p className="text-sm">选择片段预览视频素材</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <TimelineBar
              segments={segments}
              selectedId={selectedSegmentId}
              onSelect={setSelectedSegmentId}
            />
            <div className="text-xs text-surface-500 ml-2 whitespace-nowrap">
              {config.videoRatio} · {config.mvDuration === 'full' ? '全曲' : config.mvDuration === 'short' ? '短版' : '中版'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedSegment ? (
            <>
              <SegmentCard segment={selectedSegment} />
              <ClipSelector
                currentClip={selectedSegment.selectedClip}
                alternatives={selectedSegment.alternativeClips}
                onSelect={(clip) => {
                  useTimelineStore.getState().replaceClip(selectedSegment.id, clip)
                }}
              />
              <TransitionPicker
                current={selectedSegment.transition}
                onChange={(t) => {
                  useTimelineStore.getState().changeTransition(selectedSegment.id, t)
                }}
              />
              <TrimAdjuster />
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-surface-400">
                选择时间线上的片段进行编辑
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep('generate')}>
          返回生成
        </Button>
        <Button onClick={() => setStep('output')}>
          <Download className="w-4 h-4 mr-1" />
          导出视频
        </Button>
      </div>
    </div>
  )
}