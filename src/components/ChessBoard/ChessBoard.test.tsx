import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { initGame } from '../../features/chess/chessEngine'
import ChessBoard from './ChessBoard'

function setup(overrides: Partial<React.ComponentProps<typeof ChessBoard>> = {}) {
  const game = initGame()
  const onSquareClick = vi.fn()

  const props: React.ComponentProps<typeof ChessBoard> = {
    board: game.getBoard(),
    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    isCheck: false,
    playerColor: 'w',
    turn: 'w',
    onSquareClick,
    ...overrides,
  }

  render(<ChessBoard {...props} />)
  return { onSquareClick }
}

describe('ChessBoard', () => {
  it('初期盤面の駒が正しく表示される', () => {
    setup()
    // 白のポーン(e2)と黒のポーン(e7)が表示されていること
    expect(screen.getByTestId('square-e2')).toHaveTextContent('\u2659')
    expect(screen.getByTestId('square-e7')).toHaveTextContent('\u265F')
    // キング
    expect(screen.getByTestId('square-e1')).toHaveTextContent('\u2654')
    expect(screen.getByTestId('square-e8')).toHaveTextContent('\u265A')
  })

  it('マスをクリックすると onSquareClick が呼ばれる', async () => {
    const user = userEvent.setup()
    const { onSquareClick } = setup()

    await user.click(screen.getByTestId('square-e2'))
    expect(onSquareClick).toHaveBeenCalledWith('e2')
  })

  it('合法手のマスにドットが表示される', () => {
    setup({ selectedSquare: 'e2', legalMoves: ['e3', 'e4'] })
    const square = screen.getByTestId('square-e4')
    expect(square.querySelector('span')).not.toBeNull()
  })

  it('playerColor が black のとき盤面が反転する', () => {
    setup({ playerColor: 'b' })
    // 反転時は a8 相当の位置に元々 a1 (白ルーク)が来るはず。
    // grid の並び順を data-square から確認: 先頭セルが h1 になるはず。
    const cells = screen.getAllByRole('gridcell')
    expect(cells[0]).toHaveAttribute('data-square', 'h1')
    expect(cells[cells.length - 1]).toHaveAttribute('data-square', 'a8')
  })

  it('通常時（白視点）は先頭セルが a8 になる', () => {
    setup({ playerColor: 'w' })
    const cells = screen.getAllByRole('gridcell')
    expect(cells[0]).toHaveAttribute('data-square', 'a8')
    expect(cells[cells.length - 1]).toHaveAttribute('data-square', 'h1')
  })

  it('王手中のキングのマスがハイライトされる', () => {
    const game = initGame('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3')
    setup({ board: game.getBoard(), isCheck: true, turn: 'w' })
    const kingSquare = screen.getByTestId('square-e1')
    expect(kingSquare.querySelector('.bg-red-500\\/50')).not.toBeNull()
  })
})
