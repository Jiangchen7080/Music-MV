import { useEffect, useRef } from 'react'

interface AudioWaveformProps {
  audioUrl: string | null
  segmentStart: number
  segmentEnd: number
  totalDuration: number
}

export function AudioWaveform({ audioUrl, segmentStart, segmentEnd, totalDuration }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const waveDataRef = useRef<number[]>([])

  useEffect(() => {
    if (!audioUrl) return

    const fetchAndDecode = async () => {
      try {
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        audioContext.close()

        const channelData = audioBuffer.getChannelData(0)
        const step = Math.floor(channelData.length / 400)
        const peaks: number[] = []

        for (let i = 0; i < 400; i++) {
          let sum = 0
          const start = i * step
          for (let j = 0; j < step; j++) {
            sum += Math.abs(channelData[start + j] || 0)
          }
          peaks.push(sum / step)
        }

        const maxPeak = Math.max(...peaks, 0.01)
        waveDataRef.current = peaks.map(p => p / maxPeak)
        drawWaveform()
      } catch {
        // silently fail
      }
    }

    fetchAndDecode()
  }, [audioUrl])

  useEffect(() => {
    drawWaveform()
  }, [segmentStart, segmentEnd, totalDuration])

  function drawWaveform() {
    const canvas = canvasRef.current
    if (!canvas || waveDataRef.current.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerY = height / 2

    ctx.clearRect(0, 0, width, height)

    const barWidth = width / waveDataRef.current.length
    const barGap = 1

    waveDataRef.current.forEach((amplitude, i) => {
      const x = i * barWidth
      const barHeight = amplitude * (height - 4)

      const timePosition = (i / waveDataRef.current.length) * totalDuration
      const inSegment = timePosition >= segmentStart && timePosition <= segmentEnd

      ctx.fillStyle = inSegment ? 'rgba(99, 102, 241, 0.8)' : 'rgba(100, 116, 139, 0.3)'
      ctx.fillRect(x + barGap / 2, centerY - barHeight / 2, Math.max(1, barWidth - barGap), barHeight)
    })

    const startX = (segmentStart / totalDuration) * width
    const endX = (segmentEnd / totalDuration) * width

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(startX, 0)
    ctx.lineTo(startX, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(endX, 0)
    ctx.lineTo(endX, height)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${segmentStart.toFixed(1)}s`, startX, height - 4)
    ctx.fillText(`${segmentEnd.toFixed(1)}s`, endX, height - 4)
  }

  return (
    <div className="px-4 py-2 bg-black/30">
      <canvas
        ref={canvasRef}
        className="w-full h-16"
      />
      <div className="flex justify-between text-[10px] text-surface-500 mt-1">
        <span>0s</span>
        <span>{totalDuration.toFixed(1)}s</span>
      </div>
    </div>
  )
}