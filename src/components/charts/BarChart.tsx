'use client'

interface Bar {
  label: string
  value: number
  color?: string
}

interface Props {
  data: Bar[]
  height?: number
  maxValue?: number
  formatValue?: (v: number) => string
}

export function BarChart({ data, height = 160, maxValue, formatValue }: Props) {
  if (!data.length) return null
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)
  const barW = Math.max(8, Math.floor((100 - data.length * 2) / data.length))

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${data.length * (barW + 4)} ${height + 24}`}
        className="w-full"
        style={{ minWidth: `${data.length * 24}px` }}
      >
        {data.map((d, i) => {
          const barH = max > 0 ? Math.max(2, (d.value / max) * height) : 2
          const x = i * (barW + 4)
          const y = height - barH
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                fill={d.color ?? '#3457A6'}
                opacity={0.85}
              />
              {/* Value on top */}
              {d.value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#64748B"
                  fontWeight="600"
                >
                  {formatValue ? formatValue(d.value) : d.value}
                </text>
              )}
              {/* Label below */}
              <text
                x={x + barW / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize={7}
                fill="#94A3B8"
              >
                {d.label.slice(0, 6)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
