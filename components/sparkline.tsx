"use client"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ data, width = 200, height = 40, color = "#3b82f6" }: SparklineProps) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1 // Avoid division by zero

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="flex items-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#sparkline-gradient)"
        />
      </svg>
    </div>
  )
}

