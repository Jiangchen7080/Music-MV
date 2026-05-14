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

function getTargetSize(ratio: string): { w: number; h: number } {
  return ratio === '9:16' ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 }
}

async function downloadClips(
  ff: any,
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
      detail: `下载素材 ${i + 1}/${segments.length}`,
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

  ff.on('log', ({ message }: { message: string }) => {
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

  const audioData = await fetchFile(audioFile)
  await ff.writeFile('audio.mp3', audioData)

  ff.on('progress', ({ progress: p }: { progress: number }) => {
    onProgress({
      stage: 'render',
      progress: 5 + Math.round(p * 90),
      detail: `渲染中 ${Math.round(p * 100)}%`,
    })
  })

  let renderSuccess = false
  let lastError = ''

  const strategies = [
    {
      name: 'concat protocol + scale',
      build: () => {
        const concatInput = `concat:${clipFiles.join('|')}`
        return [
          '-i', concatInput,
          '-i', 'audio.mp3',
          '-vf', `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`,
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-pix_fmt', 'yuv420p',
          '-shortest',
          '-preset', 'ultrafast',
          '-movflags', '+faststart',
          'output.mp4',
        ]
      },
    },
    {
      name: 'concat protocol no scale',
      build: () => {
        const concatInput = `concat:${clipFiles.join('|')}`
        return [
          '-i', concatInput,
          '-i', 'audio.mp3',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-pix_fmt', 'yuv420p',
          '-shortest',
          '-preset', 'ultrafast',
          '-movflags', '+faststart',
          'output.mp4',
        ]
      },
    },
  ]

  for (const strategy of strategies) {
    if (renderSuccess) break
    try {
      onProgress({
        stage: 'render',
        progress: 10,
        detail: `渲染中${strategy.name !== 'concat protocol + scale' ? '（简化模式）' : ''}...`,
      })
      await ff.exec(strategy.build())
      renderSuccess = true
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      const logTail = ffmpegLogs.slice(-3).join(' | ')
      lastError = `${lastError} | ${logTail}`
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
  try { ff.deleteFile('audio.mp3') } catch { /* ignore */ }
  try { ff.deleteFile('output.mp4') } catch { /* ignore */ }

  onProgress({ stage: 'complete', progress: 100, detail: '渲染完成！' })

  return new Blob([safeBuffer], { type: 'video/mp4' })
}