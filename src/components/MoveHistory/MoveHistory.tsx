import { useEffect, useRef } from 'react'

export interface MoveHistoryProps {
  moves: string[]
}

interface MoveRow {
  moveNumber: number
  white?: string
  black?: string
}

function toRows(moves: string[]): MoveRow[] {
  const rows: MoveRow[] = []
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      moveNumber: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }
  return rows
}

function MoveHistory({ moves }: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [moves])

  const rows = toRows(moves)

  return (
    <div
      ref={containerRef}
      data-testid="move-history"
      className="max-h-80 w-full overflow-y-auto rounded-apple border border-brand-text/10 bg-white shadow-sm lg:max-h-[78vh]"
    >
      {rows.length === 0 ? (
        <p className="p-6 text-base text-brand-text/50">まだ指手がありません</p>
      ) : (
        <ul className="divide-y divide-brand-text/5">
          {rows.map((row) => (
            <li
              key={row.moveNumber}
              data-testid={`move-row-${row.moveNumber}`}
              className="flex items-center gap-4 px-4 py-2.5 text-base md:text-lg"
            >
              <span className="w-8 text-brand-text/40">{row.moveNumber}.</span>
              <span className="w-20 font-mono text-brand-text">{row.white}</span>
              <span className="w-20 font-mono text-brand-text">{row.black ?? ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MoveHistory
