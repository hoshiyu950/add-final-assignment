import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StockfishWorker } from '../features/stockfish/stockfishWorker'
import { useStockfish } from './useStockfish'

function createMockWorker(resolvedMove = 'e2e4') {
  let resolveMove: (move: string) => void = () => {}
  const getBestMove = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        resolveMove = resolve
      }),
  )
  const terminate = vi.fn()

  const worker: StockfishWorker = { getBestMove, terminate }

  return {
    worker,
    getBestMove,
    terminate,
    resolve: (move: string = resolvedMove) => resolveMove(move),
  }
}

describe('useStockfish', () => {
  it('初期状態では isThinking が false, bestMove が null であること', () => {
    const { worker } = createMockWorker()
    const { result } = renderHook(() => useStockfish(() => worker))

    expect(result.current.isThinking).toBe(false)
    expect(result.current.bestMove).toBeNull()
  })

  it('requestMove 呼び出し中は isThinking が true になり、完了すると bestMove が更新される', async () => {
    const mock = createMockWorker('e7e5')
    const { result } = renderHook(() => useStockfish(() => mock.worker))

    let requestPromise!: Promise<string>
    act(() => {
      requestPromise = result.current.requestMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'intermediate',
      )
    })

    expect(result.current.isThinking).toBe(true)

    act(() => {
      mock.resolve('e7e5')
    })
    await act(async () => {
      await requestPromise
    })

    expect(result.current.isThinking).toBe(false)
    expect(result.current.bestMove).toBe('e7e5')
  })

  it('難易度に応じた skillLevel と movetime が Stockfish に渡される', async () => {
    const mock = createMockWorker()
    const { result } = renderHook(() => useStockfish(() => mock.worker))

    act(() => {
      result.current.requestMove('fen-beginner', 'beginner')
    })
    expect(mock.getBestMove).toHaveBeenLastCalledWith('fen-beginner', 2, 500)
    act(() => mock.resolve())

    act(() => {
      result.current.requestMove('fen-advanced', 'advanced')
    })
    expect(mock.getBestMove).toHaveBeenLastCalledWith('fen-advanced', 20, 2000)
    act(() => mock.resolve())
  })

  it('アンマウント時に worker.terminate が呼ばれる', async () => {
    const mock = createMockWorker()
    const { result, unmount } = renderHook(() => useStockfish(() => mock.worker))

    act(() => {
      result.current.requestMove('fen', 'beginner')
    })
    act(() => mock.resolve())
    await waitFor(() => expect(result.current.isThinking).toBe(false))

    unmount()

    expect(mock.terminate).toHaveBeenCalledTimes(1)
  })

  it('同じフックインスタンスでは worker が使い回される（複数回生成されない）', async () => {
    const factory = vi.fn()
    const mock = createMockWorker()
    factory.mockReturnValue(mock.worker)

    const { result } = renderHook(() => useStockfish(factory))

    act(() => {
      result.current.requestMove('fen1', 'beginner')
    })
    act(() => mock.resolve('a2a3'))
    await waitFor(() => expect(result.current.bestMove).toBe('a2a3'))

    act(() => {
      result.current.requestMove('fen2', 'beginner')
    })
    act(() => mock.resolve('b2b3'))
    await waitFor(() => expect(result.current.bestMove).toBe('b2b3'))

    expect(factory).toHaveBeenCalledTimes(1)
  })
})
