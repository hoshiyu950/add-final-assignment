import { useCallback, useRef, useState } from 'react'
import { initGame } from '../features/chess/chessEngine'
import type { BoardState, GameStatus, LastMove, PieceColor, Square } from '../types/chess'

export interface UseChessGameResult {
  board: BoardState
  selectedSquare: Square | null
  legalMoves: Square[]
  lastMove: LastMove | null
  moveHistory: string[]
  turn: PieceColor
  gameStatus: GameStatus
  isCheck: boolean
  /** 現在の局面の FEN 文字列（CPU への局面渡しなどに使用） */
  fen: string
  /** マスを選択する。選択中に合法手のマスをクリックすると駒を移動する */
  selectSquare: (square: Square) => void
  /** 指手を直接適用する（CPU の指手適用などに使用）。成功したら true を返す */
  makeMove: (from: Square, to: Square) => boolean
  /** ゲームをリセットする */
  resetGame: () => void
}

/** チェスゲームの状態を管理するフック */
export function useChessGame(): UseChessGameResult {
  const gameRef = useRef(initGame())

  const [board, setBoard] = useState<BoardState>(() => gameRef.current.getBoard())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<Square[]>([])
  const [lastMove, setLastMove] = useState<LastMove | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [turn, setTurn] = useState<PieceColor>(() => gameRef.current.getTurn())
  const [gameStatus, setGameStatus] = useState<GameStatus>(() => gameRef.current.getStatus())
  const [isCheck, setIsCheck] = useState<boolean>(() => gameRef.current.isCheck())
  const [fen, setFen] = useState<string>(() => gameRef.current.getFen())

  const findPieceAt = useCallback(
    (square: Square) => board.flat().find((piece) => piece?.square === square) ?? null,
    [board],
  )

  const syncStateFromGame = useCallback((newBoard: BoardState, move: LastMove) => {
    const game = gameRef.current
    setBoard(newBoard)
    setLastMove(move)
    setMoveHistory(game.getMoveHistory())
    setTurn(game.getTurn())
    setGameStatus(game.getStatus())
    setIsCheck(game.isCheck())
    setFen(game.getFen())
  }, [])

  const makeMove = useCallback(
    (from: Square, to: Square): boolean => {
      const newBoard = gameRef.current.makeMove(from, to)
      if (!newBoard) {
        return false
      }
      syncStateFromGame(newBoard, { from, to })
      setSelectedSquare(null)
      setLegalMoves([])
      return true
    },
    [syncStateFromGame],
  )

  const selectSquare = useCallback(
    (square: Square) => {
      const game = gameRef.current

      if (selectedSquare) {
        if (square === selectedSquare) {
          // 同じマスを再クリック→選択解除
          setSelectedSquare(null)
          setLegalMoves([])
          return
        }

        if (legalMoves.includes(square)) {
          // 合法手のマス→移動を実行
          makeMove(selectedSquare, square)
          return
        }

        const piece = findPieceAt(square)
        if (piece && piece.color === game.getTurn()) {
          // 自分の別の駒を選択し直す
          setSelectedSquare(square)
          setLegalMoves(game.getLegalMoves(square))
          return
        }

        // それ以外のクリックは選択解除
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      const piece = findPieceAt(square)
      if (piece && piece.color === game.getTurn()) {
        setSelectedSquare(square)
        setLegalMoves(game.getLegalMoves(square))
      }
    },
    [selectedSquare, legalMoves, findPieceAt, makeMove],
  )

  const resetGame = useCallback(() => {
    gameRef.current = initGame()
    const game = gameRef.current
    setBoard(game.getBoard())
    setSelectedSquare(null)
    setLegalMoves([])
    setLastMove(null)
    setMoveHistory([])
    setTurn(game.getTurn())
    setGameStatus(game.getStatus())
    setIsCheck(game.isCheck())
    setFen(game.getFen())
  }, [])

  return {
    board,
    selectedSquare,
    legalMoves,
    lastMove,
    moveHistory,
    turn,
    gameStatus,
    isCheck,
    fen,
    selectSquare,
    makeMove,
    resetGame,
  }
}
