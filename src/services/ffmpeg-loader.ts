import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

let ffmpegInstance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null

export type LoadProgress = {
  stage: 'download-core' | 'load'
  percent: number
}

export async function getFFmpeg(
  onProgress?: (p: LoadProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance

  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const ff = new FFmpeg()

    ff.on('log', ({ message }) => {
      console.log('[FFmpeg]', message)
    })

    onProgress?.({ stage: 'download-core', percent: 10 })

    const baseURL = CORE_URL
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
    onProgress?.({ stage: 'download-core', percent: 50 })
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    onProgress?.({ stage: 'download-core', percent: 80 })

    await ff.load({
      coreURL,
      wasmURL,
    })

    onProgress?.({ stage: 'load', percent: 100 })
    ffmpegInstance = ff
    return ff
  })()

  return loadingPromise
}

export function resetFFmpeg() {
  ffmpegInstance = null
  loadingPromise = null
}