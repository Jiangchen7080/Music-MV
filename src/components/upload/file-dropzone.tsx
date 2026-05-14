import { useState, useRef, type DragEvent } from 'react'
import { cn } from '../../lib/utils'
import { Upload, FileAudio, FileText } from 'lucide-react'

interface FileDropzoneProps {
  accept: string
  label: string
  icon: 'audio' | 'text'
  onFile: (file: File) => void
  currentFile: File | null
}

export function FileDropzone({ accept, label, icon, onFile, currentFile }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  const IconComponent = icon === 'audio' ? FileAudio : FileText

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        dragging
          ? 'border-primary-500 bg-primary-500/10'
          : currentFile
            ? 'border-primary-500/50 bg-surface-900'
            : 'border-surface-700 hover:border-surface-500 bg-surface-900/50'
      )}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      {currentFile ? (
        <div className="flex flex-col items-center gap-2">
          <IconComponent className="w-8 h-8 text-primary-400" />
          <p className="text-sm text-white">{currentFile.name}</p>
          <p className="text-xs text-surface-400">点击更换文件</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-surface-400" />
          <p className="text-sm text-surface-300">{label}</p>
          <p className="text-xs text-surface-500">支持拖拽或点击上传</p>
        </div>
      )}
    </div>
  )
}