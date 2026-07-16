import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useChessGame } from './useChessGame'

describe('useChessGame', () => {
  it('初期状態が正しいこと', () => {
    const { result } = renderHook(() => useChessGame())

    expect(result.current.turn).toBe('w')
    expect(result.current.gameStatus).toBe('playing')
    expect(result.current.selectedSquare).toBeNull()
    expect(result.current.legalMoves).toEqual([])
    expect(result.current.lastMove).toBeNull()
    expect(result.current.moveHistory).toEqual([])
    expect(result.current.isCheck).toBe(false)
  })

  it('マスを選択すると selectedSquare と legalMoves が更新される', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.selectSquare('e2')
    })

    expect(result.current.selectedSquare).toBe('e2')
    expect(result.current.legalMoves.sort()).toEqual(['e3', 'e4'])
  })

  it('相手の駒や空マスを選択しても selectedSquare は変化しない', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.selectSquare('e7') // 黒の駒（白番なので選択不可）
    })
    expect(result.current.selectedSquare).toBeNull()

    act(() => {
      result.current.selectSquare('e4') // 空マス
    })
    expect(result.current.selectedSquare).toBeNull()
  })

  it('合法手のマスをクリックすると駒が移動し、手番が切り替わる', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.selectSquare('e2')
    })
    act(() => {
      result.current.selectSquare('e4')
    })

    expect(result.current.selectedSquare).toBeNull()
    expect(result.current.legalMoves).toEqual([])
    expect(result.current.lastMove).toEqual({ from: 'e2', to: 'e4' })
    expect(result.current.turn).toBe('b')
    expect(result.current.moveHistory).toEqual(['e4'])

    const movedPiece = result.current.board.flat().find((p) => p?.square === 'e4')
    expect(movedPiece).toMatchObject({ type: 'p', color: 'w' })
  })

  it('選択中に別の自駒をクリックすると選択が切り替わる', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.selectSquare('e2')
    })
    act(() => {
      result.current.selectSquare('d2')
    })

    expect(result.current.selectedSquare).toBe('d2')
    expect(result.current.legalMoves.sort()).toEqual(['d3', 'd4'])
  })

  it('同じマスを再度クリックすると選択解除される', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.selectSquare('e2')
    })
    act(() => {
      result.current.selectSquare('e2')
    })

    expect(result.current.selectedSquare).toBeNull()
    expect(result.current.legalMoves).toEqual([])
  })

  it('makeMove で直接指手を適用できる（CPU の指手適用を想定）', () => {
    const { result } = renderHook(() => useChessGame())

    let success = false
    act(() => {
      success = result.current.makeMove('e2', 'e4')
    })

    expect(success).toBe(true)
    expect(result.current.turn).toBe('b')
    expect(result.current.lastMove).toEqual({ from: 'e2', to: 'e4' })
  })

  it('makeMove に不正な手を渡すと false を返し状態は変化しない', () => {
    const { result } = renderHook(() => useChessGame())

    let success = true
    act(() => {
      success = result.current.makeMove('e2', 'e5')
    })

    expect(success).toBe(false)
    expect(result.current.turn).toBe('w')
    expect(result.current.lastMove).toBeNull()
  })

  it("チェックメイトになると gameStatus が 'checkmate' になる", () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('f2', 'f3')
    })
    act(() => {
      result.current.makeMove('e7', 'e5')
    })
    act(() => {
      result.current.makeMove('g2', 'g4')
    })
    act(() => {
      result.current.makeMove('d8', 'h4')
    })

    expect(result.current.gameStatus).toBe('checkmate')
    expect(result.current.isCheck).toBe(true)
  })

  it('resetGame でゲームが初期状態に戻る', () => {
    const { result } = renderHook(() => useChessGame())

    act(() => {
      result.current.makeMove('e2', 'e4')
    })
    expect(result.current.turn).toBe('b')

    act(() => {
      result.current.resetGame()
    })

    expect(result.current.turn).toBe('w')
    expect(result.current.moveHistory).toEqual([])
    expect(result.current.lastMove).toBeNull()
    expect(result.current.gameStatus).toBe('playing')
  })
})
