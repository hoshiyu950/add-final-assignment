import { Link } from 'react-router-dom'
import { PIECE_NAME_JA, PIECE_UNICODE } from '../../constants/pieces'
import type { PieceType } from '../../types/chess'

const PIECE_MOVEMENT: { type: PieceType; description: string }[] = [
  { type: 'k', description: '上下左右斜めのいずれかの方向に 1 マスだけ移動できます。' },
  {
    type: 'q',
    description: '上下左右斜めのいずれかの方向に、駒がある場所まで何マスでも移動できます。',
  },
  { type: 'r', description: '上下左右のいずれかの方向に、駒がある場所まで何マスでも移動できます。' },
  { type: 'b', description: '斜め方向に、駒がある場所まで何マスでも移動できます。' },
  { type: 'n', description: '「L字型」（2マス+1マスの直角）に移動できます。他の駒を飛び越えられます。' },
  {
    type: 'p',
    description:
      '前方に 1 マス（初手のみ 2 マス）移動できます。相手の駒は斜め前方 1 マスにあるときのみ取れます。',
  },
]

function RulesPage() {
  return (
    <div className="min-h-screen bg-brand-bg px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-12 text-5xl font-bold text-brand-text">ルール確認</h1>

        <section className="mb-8 rounded-apple bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-brand-text">1. ゲームの目的</h2>
          <p className="text-lg leading-relaxed text-brand-text/80">
            チェスは、相手の「キング」を詰ませる（チェックメイトにする）ことを目指す 2
            人対戦のボードゲームです。8×8 のマスからなる盤上で、白と黒が交互に駒を動かします。
          </p>
        </section>

        <section className="mb-8 rounded-apple bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-brand-text">2. 各駒の動き方</h2>
          <ul className="flex flex-col gap-6">
            {PIECE_MOVEMENT.map((piece) => (
              <li key={piece.type} className="flex items-start gap-6">
                <span className="text-5xl leading-none">{PIECE_UNICODE.w[piece.type]}</span>
                <div>
                  <p className="text-xl font-medium text-brand-text">
                    {PIECE_NAME_JA[piece.type]}
                  </p>
                  <p className="text-lg leading-relaxed text-brand-text/70">
                    {piece.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8 rounded-apple bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-brand-text">
            3. チェック・チェックメイト
          </h2>
          <p className="text-lg leading-relaxed text-brand-text/80">
            自分のキングが相手の駒に取られる状態を「チェック（王手）」と呼びます。チェックされている場合は、次の手で必ずチェックを回避しなければなりません。チェックを回避する手が存在しない場合、「チェックメイト（詰み）」となり、その時点でゲームが終了し、チェックをかけた側の勝利となります。
          </p>
        </section>

        <section className="mb-12 rounded-apple bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-brand-text">
            4. 引き分け（ステイルメイト）
          </h2>
          <p className="text-lg leading-relaxed text-brand-text/80">
            手番のプレイヤーがチェックされていないにもかかわらず、合法な手が 1
            つも存在しない状態を「ステイルメイト」と呼びます。この場合、ゲームは引き分けとなります。
          </p>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block rounded-apple bg-brand-accent px-8 py-5 text-2xl font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RulesPage
