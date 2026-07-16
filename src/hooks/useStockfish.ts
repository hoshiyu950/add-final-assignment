import { useCallback, useEffect, useRef, useState } from 'react'
import { DIFFICULTY_SETTINGS } from '../constants/ai'
import { createStockfishWorker, type StockfishWorker } from '../features/stockfish/stockfishWorker'
import type { Difficulty } from '../types/chess'

export interface UseStockfishResult {
  /** AI が思考中かどうか */
  isThinking: boolean
  /** 直近に取得した最善手（UCI 形式）。未取得の場合は null */
  bestMove: string | null
  /** AI に指手を要求する */
  requestMove: (fen: string, difficulty: Difficulty) => Promise<string>
}

/**
 * Stockfish AI を利用するためのフック。
 * @param workerFactory テスト用に Worker 生成処理を差し替えるためのファクトリ（省略時は実際の Stockfish Worker を使用）
 */
export function useStockfish(
  workerFactory: () => StockfishWorker = createStockfishWorker,
): UseStockfishResult {
  const workerRef = useRef<StockfishWorker | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [bestMove, setBestMove] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const requestMove = useCallback(
    async (fen: string, difficulty: Difficulty): Promise<string> => {
      if (!workerRef.current) {
        workerRef.current = workerFactory()
      }
      const { skillLevel, movetime } = DIFFICULTY_SETTINGS[difficulty]

      setIsThinking(true)
      try {
        const move = await workerRef.current.getBestMove(fen, skillLevel, movetime)
        setBestMove(move)
        return move
      } finally {
        setIsThinking(false)
      }
    },
    [workerFactory],
  )

  return { isThinking, bestMove, requestMove }
}
