import { describe, expect, it } from 'vitest'
import { initGame } from './chessEngine'

describe('chessEngine', () => {
  describe('initGame / getBoard', () => {
    it('初期盤面が正しいこと', () => {
      const game = initGame()
      const board = game.getBoard()

      // 8x8 の配列であること
      expect(board.length).toBe(8)
      board.forEach((row) => expect(row.length).toBe(8))

      // 0行目（8段目）は黒の後列
      expect(board[0].map((p) => p?.type)).toEqual([
        'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
      ])
      board[0].forEach((p) => expect(p?.color).toBe('b'))

      // 1行目（7段目）は黒のポーン
      board[1].forEach((p) => expect(p?.type).toBe('p'))
      board[1].forEach((p) => expect(p?.color).toBe('b'))

      // 2〜5行目は空
      for (let i = 2; i <= 5; i++) {
        board[i].forEach((p) => expect(p).toBeNull())
      }

      // 6行目（2段目）は白のポーン
      board[6].forEach((p) => expect(p?.type).toBe('p'))
      board[6].forEach((p) => expect(p?.color).toBe('w'))

      // 7行目（1段目）は白の後列
      expect(board[7].map((p) => p?.type)).toEqual([
        'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
      ])
      board[7].forEach((p) => expect(p?.color).toBe('w'))
    })

    it('初期の手番は白であること', () => {
      const game = initGame()
      expect(game.getTurn()).toBe('w')
    })

    it('初期状態は playing であること', () => {
      const game = initGame()
      expect(game.getStatus()).toBe('playing')
      expect(game.isCheck()).toBe(false)
      expect(game.isGameOver()).toBe(false)
    })
  })

  describe('getLegalMoves', () => {
    it('e2 のポーンは e3, e4 に移動可能', () => {
      const game = initGame()
      const moves = game.getLegalMoves('e2')
      expect(moves.sort()).toEqual(['e3', 'e4'])
    })

    it('駒が存在しないマスは合法手が空配列', () => {
      const game = initGame()
      expect(game.getLegalMoves('e4')).toEqual([])
    })
  })

  describe('makeMove', () => {
    it('合法手を適用すると盤面が更新され、手番が切り替わる', () => {
      const game = initGame()
      const board = game.makeMove('e2', 'e4')
      expect(board).not.toBeNull()
      expect(game.getTurn()).toBe('b')
      expect(game.getFen()).toContain('4P3')
    })

    it('不正な手は適用されないこと', () => {
      const game = initGame()
      const beforeFen = game.getFen()
      const result = game.makeMove('e2', 'e5')
      expect(result).toBeNull()
      expect(game.getFen()).toBe(beforeFen)
      expect(game.getTurn()).toBe('w')
    })

    it('指手履歴に SAN 表記で記録される', () => {
      const game = initGame()
      game.makeMove('e2', 'e4')
      game.makeMove('e7', 'e5')
      expect(game.getMoveHistory()).toEqual(['e4', 'e5'])
    })
  })

  describe('チェックメイト検出', () => {
    it("Fool's mate でチェックメイトが検出されること", () => {
      const game = initGame()
      game.makeMove('f2', 'f3')
      game.makeMove('e7', 'e5')
      game.makeMove('g2', 'g4')
      game.makeMove('d8', 'h4')

      expect(game.isCheckmate()).toBe(true)
      expect(game.isCheck()).toBe(true)
      expect(game.isGameOver()).toBe(true)
      expect(game.getStatus()).toBe('checkmate')
    })
  })

  describe('ステイルメイト検出', () => {
    it('既知のステイルメイト局面が検出されること', () => {
      // 黒番でステイルメイトになる有名な局面
      const game = initGame('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
      expect(game.isStaleMate()).toBe(true)
      expect(game.isCheckmate()).toBe(false)
      expect(game.isGameOver()).toBe(true)
      expect(game.getStatus()).toBe('stalemate')
    })
  })
})
