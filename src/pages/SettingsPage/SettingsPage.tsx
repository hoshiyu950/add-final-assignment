import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIFFICULTY_ORDER, DIFFICULTY_SETTINGS } from '../../constants/ai'
import type { Difficulty, PieceColor } from '../../types/chess'

const COLOR_OPTIONS: { value: PieceColor; label: string; icon: string }[] = [
  { value: 'w', label: '白（先手）', icon: '\u2654' },
  { value: 'b', label: '黒（後手）', icon: '\u265A' },
]

function SettingsPage() {
  const navigate = useNavigate()
  const [playerColor, setPlayerColor] = useState<PieceColor>('w')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')

  const handleStart = () => {
    navigate('/play', { state: { playerColor, difficulty } })
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-brand-bg px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="mb-12 text-center text-5xl font-bold text-brand-text">設定</h1>

        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-brand-text/50">
            駒の色
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {COLOR_OPTIONS.map((option) => {
              const isSelected = playerColor === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setPlayerColor(option.value)}
                  className={`flex flex-col items-center gap-3 rounded-apple border-2 px-6 py-10 shadow-sm transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-accent bg-brand-accent/10'
                      : 'border-transparent bg-white hover:border-brand-text/10'
                  }`}
                >
                  <span className="text-7xl">{option.icon}</span>
                  <span className="text-xl font-medium text-brand-text">{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-brand-text/50">
            AI 難易度
          </h2>
          <div className="grid grid-cols-3 gap-5">
            {DIFFICULTY_ORDER.map((level) => {
              const isSelected = difficulty === level
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-apple border-2 px-4 py-7 text-xl font-medium shadow-sm transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                      : 'border-transparent bg-white text-brand-text hover:border-brand-text/10'
                  }`}
                >
                  {DIFFICULTY_SETTINGS[level].label}
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-apple bg-brand-accent px-8 py-5 text-2xl font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
          >
            ゲームを始める
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-apple border border-brand-text/20 bg-white px-8 py-5 text-2xl font-medium text-brand-text shadow-sm transition-all duration-150 hover:bg-brand-text/5 active:scale-95"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
