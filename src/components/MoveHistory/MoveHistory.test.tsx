import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MoveHistory from './MoveHistory'

describe('MoveHistory', () => {
  it('指手がない場合はメッセージを表示する', () => {
    render(<MoveHistory moves={[]} />)
    expect(screen.getByText('まだ指手がありません')).toBeInTheDocument()
  })

  it('白黒の指手を手番ごとに横並びで表示する', () => {
    render(<MoveHistory moves={['e4', 'e5', 'd4', 'd5']} />)

    const row1 = screen.getByTestId('move-row-1')
    expect(row1).toHaveTextContent('1.')
    expect(row1).toHaveTextContent('e4')
    expect(row1).toHaveTextContent('e5')

    const row2 = screen.getByTestId('move-row-2')
    expect(row2).toHaveTextContent('2.')
    expect(row2).toHaveTextContent('d4')
    expect(row2).toHaveTextContent('d5')
  })

  it('白番のみ指した場合、黒の欄は空になる', () => {
    render(<MoveHistory moves={['e4']} />)
    const row1 = screen.getByTestId('move-row-1')
    expect(row1).toHaveTextContent('e4')
  })

  it('指手が増えると自動的に一番下までスクロールする', () => {
    const { rerender, getByTestId } = render(<MoveHistory moves={['e4']} />)
    const container = getByTestId('move-history')

    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 500,
    })
    container.scrollTop = 0

    rerender(<MoveHistory moves={['e4', 'e5']} />)

    expect(container.scrollTop).toBe(500)
  })
})
