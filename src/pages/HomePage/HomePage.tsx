import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 text-center">
      <h1 className="mb-6 text-7xl font-bold tracking-tight text-brand-text sm:text-8xl md:text-9xl">
        Chess
      </h1>
      <p className="mb-16 text-xl text-brand-text/60 sm:text-2xl">
        CPU と対戦できるチェスウェブアプリ
      </p>

      <div className="flex w-full max-w-md flex-col gap-5">
        <Link
          to="/settings"
          className="rounded-apple bg-brand-accent px-8 py-5 text-2xl font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
        >
          ゲームを始める
        </Link>
        <Link
          to="/rules"
          className="rounded-apple border border-brand-text/20 bg-white px-8 py-5 text-2xl font-medium text-brand-text shadow-sm transition-all duration-150 hover:bg-brand-text/5 active:scale-95"
        >
          ルールを確認する
        </Link>
      </div>
    </div>
  )
}

export default HomePage
