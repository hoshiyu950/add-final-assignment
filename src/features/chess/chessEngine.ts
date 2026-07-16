import { Chess } from 'chess.js'
import type { BoardState, GameStatus, PieceColor, Square } from '../../types/chess'

/**
 * chess.js の Chess インスタンスをラップし、アプリ内で使いやすい API を提供するクラス。
 */
export class ChessEngine {
  private chess: Chess

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess()
  }

  /** 指定したマスにある駒が移動可能なマスの一覧を返す */
  getLegalMoves(square: Square): Square[] {
    const moves = this.chess.moves({ square, verbose: true })
    return moves.map((move) => move.to as Square)
  }

  /**
   * 指手を適用する。合法手であれば新しい盤面状態を返し、内部状態を更新する。
   * 不正な手の場合は内部状態を変更せず null を返す。
   */
  makeMove(from: Square, to: Square): BoardState | null {
    try {
      const move = this.chess.move({ from, to, promotion: 'q' })
      if (!move) {
        return null
      }
      return this.getBoard()
    } catch {
      return null
    }
  }

  /** 現在の盤面状態を 8x8 配列で返す（0 行目が 8 段目、7 行目が 1 段目） */
  getBoard(): BoardState {
    return this.chess.board().map((row) =>
      row.map((cell) =>
        cell
          ? { type: cell.type, color: cell.color, square: cell.square as Square }
          : null,
      ),
    )
  }

  /** 王手中かどうかを返す */
  isCheck(): boolean {
    return this.chess.isCheck()
  }

  /** チェックメイトかどうかを返す */
  isCheckmate(): boolean {
    return this.chess.isCheckmate()
  }

  /** ステイルメイトかどうかを返す */
  isStaleMate(): boolean {
    return this.chess.isStalemate()
  }

  /** ゲームが終了しているかどうかを返す（チェックメイト・ステイルメイトなど） */
  isGameOver(): boolean {
    return this.chess.isGameOver()
  }

  /** 代数記法（SAN）の指手履歴を返す */
  getMoveHistory(): string[] {
    return this.chess.history()
  }

  /** 現在の手番（'w' | 'b'）を返す */
  getTurn(): PieceColor {
    return this.chess.turn() as PieceColor
  }

  /** 現在の局面を FEN 文字列で返す */
  getFen(): string {
    return this.chess.fen()
  }

  /** ゲームの状態（プレイ中／チェックメイト／ステイルメイト）を返す */
  getStatus(): GameStatus {
    if (this.chess.isCheckmate()) return 'checkmate'
    if (this.chess.isStalemate()) return 'stalemate'
    return 'playing'
  }
}

/** 新しいゲームインスタンスを生成する */
export function initGame(fen?: string): ChessEngine {
  return new ChessEngine(fen)
}
