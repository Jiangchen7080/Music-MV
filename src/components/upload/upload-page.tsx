import { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FileDropzone } from './file-dropzone'
import { useProjectStore } from '../../stores/project-store'
import { parseLyrics } from '../../utils/lyrics-parser'
import { Music, FileText, Palette } from 'lucide-react'

export function UploadPage() {
  const { audioFile, setAudioFile, setOriginalAudioFile, setLyrics, setStep, styleDescription, setStyleDescription } = useProjectStore()
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState('')
  const [lyricsMode, setLyricsMode] = useState<'file' | 'text'>('file')
  const [noLyrics, setNoLyrics] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleLyricsFile = (file: File) => {
    setLyricsFile(file)
    setNoLyrics(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setLyricsText(text)
    }
    reader.readAsText(file)
  }

  const handleNext = () => {
    if (!audioFile) return
    if (noLyrics || !lyricsText) {
      setLyrics([], '')
    } else {
      const parsed = parseLyrics(lyricsText)
      setLyrics(parsed, lyricsText)
    }
    setStep('config')
  }

  const canProceed = !!audioFile

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>上传音乐文件</CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropzone
            accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
            label="上传音乐文件（MP3 / WAV / M4A）"
            icon="audio"
            onFile={(file) => {
              setAudioFile(file)
              setOriginalAudioFile(file)
            }}
            currentFile={audioFile}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>上传歌词</CardTitle>
          <p className="text-xs text-surface-400 font-normal">纯音乐可不填歌词，系统将自动按音频时长智能分段</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {noLyrics ? (
            <div className="flex flex-col items-center gap-3 py-6 text-surface-400">
              <Music className="w-10 h-10" />
              <p className="text-sm">纯音乐模式，无需歌词</p>
              <Button variant="secondary" size="sm" onClick={() => setNoLyrics(false)}>
                <FileText className="w-3 h-3 mr-1" /> 添加歌词
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Button
                  variant={lyricsMode === 'file' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setLyricsMode('file')}
                >
                  上传文件
                </Button>
                <Button
                  variant={lyricsMode === 'text' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setLyricsMode('text')}
                >
                  粘贴文本
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNoLyrics(true)
                    setLyricsText('')
                    setLyricsFile(null)
                  }}
                  className="ml-auto text-surface-400"
                >
                  纯音乐
                </Button>
              </div>

              {lyricsMode === 'file' ? (
                <FileDropzone
                  accept=".lrc,.txt,.srt,.lrc,.txt,.srt"
                  label="上传歌词文件（LRC / TXT / SRT）"
                  icon="text"
                  onFile={handleLyricsFile}
                  currentFile={lyricsFile}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  placeholder="在此粘贴歌词文本...&#10;支持 LRC 格式（带时间戳）或纯文本"
                  className="w-full h-40 bg-surface-900 border border-surface-700 rounded-lg p-4 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500"
                />
              )}

              {lyricsText && (
                <div className="bg-surface-900 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-xs text-surface-400 mb-2">歌词预览：</p>
                  {parseLyrics(lyricsText).map((line, i) => (
                    <p key={i} className="text-sm text-surface-200">
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>歌曲风格描述</CardTitle>
          <p className="text-xs text-surface-400 font-normal">可选。描述歌曲风格和画面诉求，帮助更精准匹配视频素材</p>
        </CardHeader>
        <CardContent>
          <textarea
            value={styleDescription}
            onChange={(e) => setStyleDescription(e.target.value)}
            placeholder='例如：歌曲风格：抒情慢歌，温暖治愈的氛围&#10;画面诉求：夕阳、海边、落叶、温暖的光影、慢镜头&#10;&#10;也可以简单写：古风、中国风、山水意境'
            className="w-full h-28 bg-surface-900 border border-surface-700 rounded-lg p-4 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500"
          />
          <div className="flex gap-4 mt-2 text-xs text-surface-500">
            <span>💡 可填写：歌曲风格 · 画面氛围 · 色调偏好 · 场景元素</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} size="lg">
          下一步：配置参数
        </Button>
      </div>
    </div>
  )
}