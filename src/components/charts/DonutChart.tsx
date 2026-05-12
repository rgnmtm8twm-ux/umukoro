'use client'

interface Slice {
  label: string
  value: number
  color: string
}

interface Props {
  data: Slice[]
  size?: number
}

export function DonutChart({ data, size = 120 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return null

  const r = size / 2 - 8
  const cx = size / 2
  const cy = size / 2
  const stroke = r * 0.55

  let startAngle = -Math.PI / 2
  const arcs = data.map((slice) => {
    const angle = (slice.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    startAngle += angle
    const x2 = cx + r * Math.cos(startAngle)
    const y2 = cy + r * Math.sin(startAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    return { ...slice, x1, y1, x2, y2, largeArc }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0">
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={`M ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.largeArc} 1 ${arc.x2} ${arc.y2}`}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={14} fontWeight="700" fill="#0F172A">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8} fill="#94A3B8">
          total
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="text-xs text-[#334155]">{slice.label}</span>
            <span className="ml-auto pl-4 text-xs font-semibold text-[#0F172A]">{slice.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
