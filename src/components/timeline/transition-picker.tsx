import type { TransitionStyle } from '../../types/timeline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

interface TransitionPickerProps {
  current: TransitionStyle
  onChange: (style: TransitionStyle) => void
}

const transitions: { value: TransitionStyle; label: string }[] = [
  { value: 'none', label: '无转场' },
  { value: 'fade', label: '淡入淡出' },
  { value: 'crossfade', label: '交叉溶解' },
  { value: 'push-left', label: '向左推' },
  { value: 'push-right', label: '向右推' },
  { value: 'push-up', label: '向上推' },
  { value: 'zoom', label: '方块缩放' },
  { value: 'circle', label: '圆形展开' },
  { value: 'flash', label: '闪光过渡' },
  { value: 'rotate', label: '旋转翻页' },
  { value: 'wipe', label: '擦除' },
  { value: 'grid', label: '网格分割' },
  { value: 'star', label: '星形展开' },
  { value: 'cube', label: '立方体' },
  { value: 'film', label: '胶片滚动' },
]

export function TransitionPicker({ current, onChange }: TransitionPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">转场效果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {transitions.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange(t.value)}
              className={cn(
                'px-2 py-1 rounded text-xs transition-all',
                current === t.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}