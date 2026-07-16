import type { Difficulty } from '../types/chess'

export interface DifficultySetting {
  label: string
  skillLevel: number
  movetime: number
}

/** 難易度ごとの Stockfish パラメータ */
export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySetting> = {
  beginner: { label: '初級', skillLevel: 2, movetime: 500 },
  intermediate: { label: '中級', skillLevel: 10, movetime: 1000 },
  advanced: { label: '上級', skillLevel: 20, movetime: 2000 },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced']
