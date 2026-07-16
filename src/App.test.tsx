import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('/ でホーム画面が表示される', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Chess' })).toBeInTheDocument()
  })

  it('/settings で設定画面が表示される', () => {
    renderAt('/settings')
    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('/play でプレイ画面が表示される', () => {
    renderAt('/play')
    expect(screen.getByTestId('turn-indicator')).toBeInTheDocument()
  })

  it('/rules でルール確認画面が表示される', () => {
    renderAt('/rules')
    expect(screen.getByRole('heading', { name: 'ルール確認' })).toBeInTheDocument()
  })

  it('存在しないパスは / にリダイレクトされる', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: 'Chess' })).toBeInTheDocument()
  })

  it('ホームからリンクで各画面に遷移できる', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('link', { name: 'ゲームを始める' }))
    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('設定画面の戻るボタンが機能する', async () => {
    const user = userEvent.setup()
    renderAt('/settings')
    await user.click(screen.getByRole('button', { name: '戻る' }))
    expect(screen.getByRole('heading', { name: 'Chess' })).toBeInTheDocument()
  })

  it('設定画面からプレイ画面へ設定を渡して遷移できる', async () => {
    const user = userEvent.setup()
    renderAt('/settings')
    await user.click(screen.getByRole('button', { name: '上級' }))
    await user.click(screen.getByRole('button', { name: 'ゲームを始める' }))
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('あなたの番です')
  })
})
