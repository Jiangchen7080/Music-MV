import { useProjectStore } from '../../stores/project-store'
import { cn } from '../../lib/utils'

const steps = [
  { key: 'upload', label: '上传' },
  { key: 'config', label: '配置' },
  { key: 'generate', label: '生成' },
  { key: 'edit', label: '编辑' },
  { key: 'output', label: '下载' },
] as const

export function StepIndicator() {
  const currentStep = useProjectStore((s) => s.currentStep)
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-2 px-6 py-4">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'step-dot',
                i < currentIndex && 'step-dot-completed',
                i === currentIndex && 'step-dot-active',
                i > currentIndex && 'step-dot-pending'
              )}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className={cn(
              'text-sm hidden sm:inline',
              i <= currentIndex ? 'text-white' : 'text-surface-400'
            )}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('step-line', i < currentIndex ? 'step-line-active' : 'step-line-pending')} />
          )}
        </div>
      ))}
    </div>
  )
}