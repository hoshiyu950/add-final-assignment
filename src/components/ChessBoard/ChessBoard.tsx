import { useMemo } from 'react'
import { PIECE_UNICODE } from '../../constants/pieces'
import type { BoardState, LastMove, PieceColor, Square } from '../../types/chess'

export interface ChessBoardProps {
  board: BoardState
  selectedSquare: Square | null
  legalMoves: Square[]
  lastMove: LastMove | null
  isCheck: boolean
  playerColor: PieceColor
  turn: PieceColor
  onSquareClick: (square: Square) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const INDICES = [0, 1, 2, 3, 4, 5, 6, 7] as const

function squareFromRowCol(row: number, col: number): Square {
  const file = FILES[col]
  const rank = 8 - row
  return `${file}${rank}` as Square
}

function ChessBoard({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  playerColor,
  turn,
  onSquareClick,
}: ChessBoardProps) {
  const flipped = playerColor === 'b'

  const displayRows = flipped ? [...INDICES].reverse() : [...INDICES]
  const displayCols = flipped ? [...INDICES].reverse() : [...INDICES]

  const checkedKingSquare = useMemo(() => {
    if (!isCheck) return null
    for (const row of board) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === turn) {
          return piece.square
        }
      }
    }
    return null
  }, [board, isCheck, turn])

  return (
    <div className="inline-block select-none">
      <div className="flex">
        <div className="flex w-8 flex-col sm:w-10 md:w-12 lg:w-14">
          {displayRows.map((row) => (
            <div
              key={row}
              className="flex flex-1 items-center justify-center text-sm text-brand-text/60 sm:text-base md:text-lg lg:text-xl"
            >
              {8 - row}
            </div>
          ))}
        </div>

        <div
          className="grid aspect-square w-[min(90vw,80vh,1000px)] grid-cols-8 grid-rows-8 overflow-hidden rounded-apple border border-brand-text/20 shadow-md"
          role="grid"
          aria-label="チェス盤"
        >
          {displayRows.map((row) =>
            displayCols.map((col) => {
              const square = squareFromRowCol(row, col)
              const piece = board[row][col]
              const isLight = (row + col) % 2 === 0
              const isSelected = selectedSquare === square
              const isLegalMove = legalMoves.includes(square)
              const isLastMoveSquare =
                lastMove !== null && (lastMove.from === square || lastMove.to === square)
              const isCheckedKing = checkedKingSquare === square

              const bgClass = isLight ? 'bg-brand-board-light' : 'bg-brand-board-dark'

              return (
                <button
                  key={square}
                  type="button"
                  role="gridcell"
                  aria-label={
                    piece
                      ? `${square} ${piece.color === 'w' ? '白' : '黒'}の${piece.type}`
                      : square
                  }
                  data-square={square}
                  data-testid={`square-${square}`}
                  onClick={() => onSquareClick(square)}
                  className={`relative flex items-center justify-center text-4xl transition-all duration-150 hover:brightness-95 active:scale-95 sm:text-5xl md:text-6xl lg:text-7xl ${bgClass}`}
                >
                  {isCheckedKing && (
                    <span className="absolute inset-0 bg-red-500/50" aria-hidden="true" />
                  )}
                  {isLastMoveSquare && !isCheckedKing && (
                    <span className="absolute inset-0 bg-yellow-300/50" aria-hidden="true" />
                  )}
                  {isSelected && (
                    <span className="absolute inset-0 bg-brand-accent/40" aria-hidden="true" />
                  )}
                  {piece && (
                    <span
                      className={`relative z-10 leading-none ${
                        piece.color === 'w' ? 'chess-piece-white' : 'chess-piece-black'
                      }`}
                    >
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                  {isLegalMove && !piece && (
                    <span
                      className="absolute z-10 h-1/4 w-1/4 rounded-full bg-brand-accent/50"
                      aria-hidden="true"
                    />
                  )}
                  {isLegalMove && piece && (
                    <span
                      className="absolute inset-1 z-0 rounded-full border-4 border-brand-accent/60 sm:border-[6px] md:inset-2 md:border-8"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            }),
          )}
        </div>
      </div>

      <div className="flex pl-8 sm:pl-10 md:pl-12 lg:pl-14">
        {displayCols.map((col) => (
          <div
            key={col}
            className="flex flex-1 items-center justify-center text-sm text-brand-text/60 sm:text-base md:text-lg lg:text-xl"
          >
            {FILES[col]}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChessBoard
