import type { TimelineSegment } from '../../types/timeline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Scissors } from 'lucide-react'
import { Button } from '../ui/button'
import { useTimelineStore } from '../../stores/timeline-store'

interface SegmentCardProps {
  segment: TimelineSegment
}

export function SegmentCard({ segment }: SegmentCardProps) {
  const splitSegment = useTimelineStore((s) => s.splitSegment)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">片段详情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-surface-400 text-xs">歌词</p>
          <p className="text-white">{segment.lyricsLine}</p>
        </div>
        <div>
          <p className="text-surface-400 text-xs">时长</p>
          <p className="text-white">{segment.duration.toFixed(1)} 秒</p>
        </div>
        <div>
          <p className="text-surface-400 text-xs">当前素材</p>
          <p className="text-white">
            {segment.selectedClip
              ? `${segment.selectedClip.source} · ${segment.selectedClip.duration.toFixed(1)}s`
              : '无素材'}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="secondary" onClick={() => splitSegment(segment.id, segment.duration / 2)}>
            <Scissors className="w-3 h-3 mr-1" /> 分割
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}