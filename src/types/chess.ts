export type Square =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8'

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'

export type PieceColor = 'w' | 'b'

export interface Piece {
  type: PieceType
  color: PieceColor
  square: Square
}

/** 8x8 の盤面配列。0 行目が 8 段目（黒側）、7 行目が 1 段目（白側）に対応する。 */
export type BoardState = (Piece | null)[][]

export type GameStatus = 'playing' | 'checkmate' | 'stalemate'

export interface LastMove {
  from: Square
  to: Square
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
