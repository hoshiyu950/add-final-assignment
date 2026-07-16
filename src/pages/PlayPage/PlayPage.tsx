import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ChessBoard from '../../components/ChessBoard/ChessBoard'
import MoveHistory from '../../components/MoveHistory/MoveHistory'
import { useChessGame } from '../../hooks/useChessGame'
import { useStockfish } from '../../hooks/useStockfish'
import type { Difficulty, PieceColor, Square } from '../../types/chess'

interface PlaySettings {
  playerColor: PieceColor
  difficulty: Difficulty
}

const DEFAULT_SETTINGS: PlaySettings = {
  playerColor: 'w',
  difficulty: 'intermediate',
}

function PlayPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const settings: PlaySettings = (location.state as PlaySettings | null) ?? DEFAULT_SETTINGS

  const {
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
  } = useChessGame()

  const { isThinking, requestMove } = useStockfish()

  // 同一局面に対して AI 手を二重リクエストしないようにするためのガード
  const requestedFenRef = useRef<string | null>(null)

  useEffect(() => {
    if (gameStatus !== 'playing') return
    if (turn === settings.playerColor) return
    if (requestedFenRef.current === fen) return

    requestedFenRef.current = fen

    let cancelled = false
    requestMove(fen, settings.difficulty).then((move) => {
      if (cancelled) return
      const from = move.slice(0, 2) as Square
      const to = move.slice(2, 4) as Square
      makeMove(from, to)
    })

    return () => {
      cancelled = true
      // React.StrictMode の開発時二重実行でエフェクトがクリーンアップされた場合、
      // 「リクエスト済み」フラグを戻して次回の実行で再リクエストできるようにする。
      // （Worker がクリーンアップで terminate される一方、このガードが残ると
      //   二度と AI に手を要求できず「AI 思考中...」のまま止まってしまうため）
      if (requestedFenRef.current === fen) {
        requestedFenRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameStatus, fen, settings.playerColor, settings.difficulty])

  const isGameOver = gameStatus !== 'playing'

  const resultMessage = (() => {
    if (gameStatus === 'checkmate') {
      return turn === settings.playerColor ? 'あなたの負け' : 'あなたの勝ち'
    }
    if (gameStatus === 'stalemate') {
      return '引き分け'
    }
    return null
  })()

  return (
    <div className="min-h-screen bg-brand-bg p-3 md:p-4 lg:p-5">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-2 flex items-center justify-end">
          <Link
            to="/"
            className="rounded-apple bg-brand-accent px-6 py-3 text-lg font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95 md:text-xl"
          >
            ホームへ戻る
          </Link>
        </div>

        <div className="mb-3 text-center" data-testid="turn-indicator">
          <p className="text-lg font-medium text-brand-text md:text-xl">
            {turn === settings.playerColor ? 'あなたの番です' : 'CPU の番です'}
            {isCheck && <span className="ml-2 font-bold text-red-600">王手！</span>}
          </p>
        </div>

        <div className="relative">
          <div className="flex justify-center">
            <div className="relative">
              <ChessBoard
                board={board}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isCheck={isCheck}
                playerColor={settings.playerColor}
                turn={turn}
                onSquareClick={selectSquare}
              />
              {isThinking && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-white/60"
                  data-testid="thinking-overlay"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 animate-spin rounded-full border-[6px] border-brand-accent border-t-transparent" />
                    <p className="text-lg font-medium text-brand-text">AI 思考中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center min-[1600px]:absolute min-[1600px]:right-0 min-[1600px]:top-0 min-[1600px]:mt-0 min-[1600px]:block">
            <div className="w-full max-w-xl min-[1600px]:w-72">
              <MoveHistory moves={moveHistory} />
            </div>
          </div>
        </div>

        {isGameOver && (
          <div
            className="fixed inset-0 flex animate-fade-in items-center justify-center bg-black/40 p-4"
            data-testid="game-over-modal"
          >
            <div className="w-full max-w-md animate-scale-in rounded-apple bg-white p-8 text-center shadow-lg">
              <h2 className="mb-6 text-4xl font-bold text-brand-text">{resultMessage}</h2>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-apple bg-brand-accent px-6 py-3 text-lg font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-95"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayPage
