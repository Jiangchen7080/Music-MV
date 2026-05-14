import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from './ffmpeg-loader'
import type { TimelineSegment } from '../types/timeline'
import type { GenerateConfig } from '../types/config'

export interface RenderProgress {
  stage: 'ffmpeg-load' | 'download-clips' | 'render' | 'complete' | 'error'
  progress: number
  detail: string
}

type OnProgress = (p: RenderProgress) => void

let ffmpegLogs: string[] = []

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},000`
}

function escapeSRT(text: string): string {
  return text.replace(/-->/g, '->').replace(/<[^>]*>/g, '')
}

function buildSRT(segments: TimelineSegment[]): string {
  return segments.map((seg, i) => {
    const startTime = formatTime(seg.startTime)
    const endTime = formatTime(seg.startTime + seg.duration)
    const text = escapeSRT(seg.lyricsLine || '♪')
    return `${i + 1}\n${startTime} --> ${endTime}\n${text}\n`
  }).join('\n')
}

function getTargetSize(ratio: string): { w: number; h: number } {
  return ratio === '9:16' ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 }
}

async function downloadClips(
  ff: FFmpeg,
  segments: TimelineSegment[],
  onProgress: OnProgress
): Promise<string[]> {
  const clipFiles: string[] = []

  for (let i = 0; i < segments.length; i++) {
    const clip = segments[i].selectedClip
    if (!clip) continue

    onProgress({
      stage: 'download-clips',
      progress: Math.round((i / segments.length) * 100),
      detail: `下载素材 ${i + 1}/${segments.length}: ${clip.source}`,
    })

    try {
      const ext = clip.url.split('.').pop()?.split('?')[0] || 'mp4'
      const filename = `clip_${i}.${ext}`
      const data = await fetchFile(clip.url)
      await ff.writeFile(filename, data)
      clipFiles.push(filename)
    } catch {
      clipFiles.push(`clip_${i}.mp4`)
    }
  }

  return clipFiles
}

export async function renderVideo(
  segments: TimelineSegment[],
  audioFile: File,
  config: GenerateConfig,
  onProgress: OnProgress
): Promise<Blob> {
  ffmpegLogs = []

  onProgress({ stage: 'ffmpeg-load', progress: 0, detail: '加载 FFmpeg 引擎...' })

  const ff = await getFFmpeg((p) => {
    onProgress({
      stage: 'ffmpeg-load',
      progress: Math.round(p.percent * 0.3),
      detail: p.stage === 'download-core' ? '下载 FFmpeg 核心文件...' : '初始化引擎...',
    })
  })

  ff.on('log', ({ message }) => {
    ffmpegLogs.push(message)
  })

  onProgress({ stage: 'ffmpeg-load', progress: 30, detail: 'FFmpeg 引擎已就绪' })

  const { w, h } = getTargetSize(config.videoRatio)

  onProgress({ stage: 'download-clips', progress: 0, detail: '开始下载视频素材...' })
  const clipFiles = await downloadClips(ff, segments, onProgress)

  if (clipFiles.length === 0) {
    throw new Error('没有可用的视频素材')
  }

  onProgress({ stage: 'download-clips', progress: 100, detail: '素材下载完成' })

  onProgress({ stage: 'render', progress: 0, detail: '准备渲染...' })

  const srtContent = buildSRT(segments)
  await ff.writeFile('subtitles.srt', srtContent)

  const audioData = await fetchFile(audioFile)
  await ff.writeFile('audio.mp3', audioData)

  const scaleFilter = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1`

  const filterParts: string[] = []
  const inputLabels: string[] = []

  clipFiles.forEach((_, i) => {
    filterParts.push(`[${i}:v]${scaleFilter}[v${i}]`)
    inputLabels.push(`[v${i}]`)
  })

  const concatFilter = `${inputLabels.join('')}concat=n=${clipFiles.length}:v=1:a=0[vid]`
  const fullFilter = `${filterParts.join(';')};${concatFilter}`

  const inputArgs: string[] = []
  clipFiles.forEach((f) => {
    inputArgs.push('-i', f)
  })

  const audioInputIndex = clipFiles.length

  ff.on('progress', ({ progress: p }) => {
    onProgress({
      stage: 'render',
      progress: 5 + Math.round(p * 90),
      detail: `视频渲染中 ${Math.round(p * 100)}%`,
    })
  })

  let renderSuccess = false
  let lastError = ''

  const renderAttempts = [
    {
      name: 'with subtitles',
      args: [
        ...inputArgs,
        '-i', 'audio.mp3',
        '-filter_complex', `${fullFilter};[vid]subtitles=subtitles.srt:force_style='Fontsize=20,Alignment=2,PrimaryColour=&H00FFFFFF'[out]`,
        '-map', '[out]',
        '-map', `${audioInputIndex}:a`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-preset', 'ultrafast',
        '-movflags', '+faststart',
        'output.mp4',
      ],
    },
    {
      name: 'without subtitles',
      args: [
        ...inputArgs,
        '-i', 'audio.mp3',
        '-filter_complex', fullFilter,
        '-map', '[vid]',
        '-map', `${audioInputIndex}:a`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-preset', 'ultrafast',
        '-movflags', '+faststart',
        'output.mp4',
      ],
    },
  ]

  for (const attempt of renderAttempts) {
    if (renderSuccess) break
    try {
      onProgress({
        stage: 'render',
        progress: 10,
        detail: `渲染中${attempt.name !== 'with subtitles' ? '（字幕回退模式）' : ''}...`,
      })
      await ff.exec(attempt.args)
      renderSuccess = true
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      const logTail = ffmpegLogs.slice(-5).join(' | ')
      lastError = `${lastError} | FFmpeg: ${logTail}`
    }
  }

  if (!renderSuccess) {
    throw new Error(`渲染失败: ${lastError}`)
  }

  onProgress({ stage: 'render', progress: 95, detail: '正在打包输出文件...' })

  const data = await ff.readFile('output.mp4')
  const uint8 = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string)
  const safeBuffer = new ArrayBuffer(uint8.length)
  new Uint8Array(safeBuffer).set(uint8)

  clipFiles.forEach((f) => {
    try { ff.deleteFile(f) } catch { /* ignore */ }
  })
  try { ff.deleteFile('subtitles.srt') } catch { /* ignore */ }
  try { ff.deleteFile('audio.mp3') } catch { /* ignore */ }
  try { ff.deleteFile('output.mp4') } catch { /* ignore */ }

  onProgress({ stage: 'complete', progress: 100, detail: '渲染完成！' })

  return new Blob([safeBuffer], { type: 'video/mp4' })
}