import type { PieceColor, PieceType } from '../types/chess'

/** 駒の Unicode チェス文字 */
export const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '\u2654',
    q: '\u2655',
    r: '\u2656',
    b: '\u2657',
    n: '\u2658',
    p: '\u2659',
  },
  b: {
    k: '\u265A',
    q: '\u265B',
    r: '\u265C',
    b: '\u265D',
    n: '\u265E',
    p: '\u265F',
  },
}

/** 駒種別ごとの日本語名（ルール説明画面などで使用） */
export const PIECE_NAME_JA: Record<PieceType, string> = {
  k: 'キング',
  q: 'クイーン',
  r: 'ルーク',
  b: 'ビショップ',
  n: 'ナイト',
  p: 'ポーン',
}
