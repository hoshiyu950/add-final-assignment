import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlayPage from './PlayPage'

const getBestMoveMock = vi.fn()
const terminateMock = vi.fn()

vi.mock('../../features/stockfish/stockfishWorker', () => ({
  createStockfishWorker: () => ({
    getBestMove: getBestMoveMock,
    terminate: terminateMock,
  }),
}))

function renderPlayPage(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/play', state }]}>
      <Routes>
        <Route path="/play" element={<PlayPage />} />
        <Route path="/" element={<div>ホームページ（スタブ）</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PlayPage', () => {
  beforeEach(() => {
    getBestMoveMock.mockReset()
    terminateMock.mockReset()
  })

  it('初期状態でチェス盤と手番表示、指手履歴が表示される', () => {
    renderPlayPage({ playerColor: 'w', difficulty: 'beginner' })

    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です')
    expect(screen.getByTestId('square-e2')).toBeInTheDocument()
    expect(screen.getByTestId('move-history')).toBeInTheDocument()
  })

  it('プレイヤーが指すと CPU の番になり、AI が応手する（ローディング表示あり）', async () => {
    const user = userEvent.setup()
    getBestMoveMock.mockResolvedValue('e7e5')

    renderPlayPage({ playerColor: 'w', difficulty: 'beginner' })

    await user.click(screen.getByTestId('square-e2'))
    await user.click(screen.getByTestId('square-e4'))

    await waitFor(() => expect(getBestMoveMock).toHaveBeenCalled())
    expect(getBestMoveMock).toHaveBeenCalledWith(expect.any(String), 2, 500)

    await waitFor(() => {
      expect(screen.getByTestId('square-e5')).toHaveTextContent('\u265F')
    })
    await waitFor(() =>
      expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です'),
    )
  })

  it("Fool's mate でチェックメイトになり、あなたの負けモーダルが表示される", async () => {
    const user = userEvent.setup()
    getBestMoveMock.mockResolvedValueOnce('e7e5').mockResolvedValueOnce('d8h4')

    renderPlayPage({ playerColor: 'w', difficulty: 'beginner' })

    await user.click(screen.getByTestId('square-f2'))
    await user.click(screen.getByTestId('square-f3'))

    await waitFor(() =>
      expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です'),
    )

    await user.click(screen.getByTestId('square-g2'))
    await user.click(screen.getByTestId('square-g4'))

    const modal = await screen.findByTestId('game-over-modal', {}, { timeout: 3000 })
    expect(modal).toHaveTextContent('あなたの負け')

    await user.click(screen.getByRole('button', { name: 'ホームに戻る' }))
    expect(await screen.findByText('ホームページ（スタブ）')).toBeInTheDocument()
  })

  it('location.state がない場合はデフォルト設定（白・中級）で開始する', () => {
    renderPlayPage(null)
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です')
  })

  it('王手になると「王手！」表示とキングのハイライトが行われる', async () => {
    const user = userEvent.setup()
    getBestMoveMock
      .mockResolvedValueOnce('e7e5') // 1...e5
      .mockResolvedValueOnce('b8c6') // 2...Nc6
      .mockResolvedValue('d7d6') // 以降のフォールバック（本テストでは使用しない）

    renderPlayPage({ playerColor: 'w', difficulty: 'beginner' })

    // 1. e4
    await user.click(screen.getByTestId('square-e2'))
    await user.click(screen.getByTestId('square-e4'))
    await waitFor(() =>
      expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です'),
    )

    // 2. Qh5
    await user.click(screen.getByTestId('square-d1'))
    await user.click(screen.getByTestId('square-h5'))
    await waitFor(() =>
      expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です'),
    )

    // 3. Qxe5+ (e7 に何もないため e5 のポーンを取り、e ファイル上で王手)
    await user.click(screen.getByTestId('square-h5'))
    await user.click(screen.getByTestId('square-e5'))

    await waitFor(() => expect(screen.getByTestId('turn-indicator')).toHaveTextContent('王手！'))
    const kingSquare = screen.getByTestId('square-e8')
    expect(kingSquare.querySelector('.bg-red-500\\/50')).not.toBeNull()
  })

  it('ステイルメイトになると引き分けモーダルが表示される', async () => {
    const user = userEvent.setup()
    // 既知の「最速ステイルメイト」の手順（黒側は Stockfish モックで再現）
    getBestMoveMock
      .mockResolvedValueOnce('a7a5')
      .mockResolvedValueOnce('a8a6')
      .mockResolvedValueOnce('h7h5')
      .mockResolvedValueOnce('a6h6')
      .mockResolvedValueOnce('f7f6')
      .mockResolvedValueOnce('e8f7')
      .mockResolvedValueOnce('d8d3')
      .mockResolvedValueOnce('d3h7')
      .mockResolvedValueOnce('f7g6')

    renderPlayPage({ playerColor: 'w', difficulty: 'beginner' })

    const whiteMoves: [string, string][] = [
      ['e2', 'e3'],
      ['d1', 'h5'],
      ['h5', 'a5'],
      ['a5', 'c7'],
      ['h2', 'h4'],
      ['c7', 'd7'],
      ['d7', 'b7'],
      ['b7', 'b8'],
      ['b8', 'c8'],
      ['c8', 'e6'],
    ]

    for (let i = 0; i < whiteMoves.length; i++) {
      const [from, to] = whiteMoves[i]
      await user.click(screen.getByTestId(`square-${from}`))
      await user.click(screen.getByTestId(`square-${to}`))

      const isLastMove = i === whiteMoves.length - 1
      if (!isLastMove) {
        await waitFor(() =>
          expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です'),
        )
      }
    }

    const modal = await screen.findByTestId('game-over-modal', {}, { timeout: 3000 })
    expect(modal).toHaveTextContent('引き分け')
  })

  it('後攻（黒）選択時、StrictMode のマウント二重実行後でも AI の初手が適用される', async () => {
    // 各 Worker インスタンスを疑似的に区別し、terminate() されたインスタンスの
    // getBestMove Promise は二度と解決されないことをシミュレートする。
    // （実際の Web Worker の terminate() 後は postMessage の応答が来なくなる挙動を再現）
    let currentToken = 0
    const terminatedTokens = new Set<number>()
    const resolvers = new Map<number, (move: string) => void>()

    getBestMoveMock.mockImplementation(() => {
      const token = ++currentToken
      return new Promise<string>((resolve) => {
        resolvers.set(token, (move: string) => {
          if (!terminatedTokens.has(token)) {
            resolve(move)
          }
        })
      })
    })
    terminateMock.mockImplementation(() => {
      terminatedTokens.add(currentToken)
    })

    render(
      <StrictMode>
        <MemoryRouter
          initialEntries={[
            { pathname: '/play', state: { playerColor: 'b', difficulty: 'beginner' } },
          ]}
        >
          <Routes>
            <Route path="/play" element={<PlayPage />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    )

    // StrictMode により getBestMove が複数回呼ばれるはずなので、その全てを解決してみる。
    // 終了済み（terminate 済み）のトークンに対する解決は無視される。
    await waitFor(() => expect(getBestMoveMock).toHaveBeenCalled())
    resolvers.forEach((resolve) => resolve('e2e4'))

    // 修正前は「AI 思考中...」のまま止まってしまっていたが、
    // 修正後は最終的に有効なリクエストが解決され、プレイヤー（黒）の手番に戻る。
    await waitFor(
      () => {
        expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です')
      },
      { timeout: 3000 },
    )
    expect(screen.queryByTestId('thinking-overlay')).not.toBeInTheDocument()
  })
})
