/** public/stockfish 配下に配置した Stockfish (lite, single-threaded WASM 版) のパス */
const STOCKFISH_SCRIPT_URL = '/stockfish/stockfish-18-lite-single.js'

export interface StockfishWorker {
  /** FEN を渡して最善手（UCI 形式、例: "e2e4"）を取得する */
  getBestMove(fen: string, skillLevel: number, movetime: number): Promise<string>
  /** Worker を終了する */
  terminate(): void
}

/**
 * Stockfish を Web Worker として起動し、UCI プロトコルで通信するためのラッパーを生成する。
 */
export function createStockfishWorker(scriptUrl: string = STOCKFISH_SCRIPT_URL): StockfishWorker {
  const worker = new Worker(scriptUrl)

  let readyPromise: Promise<void> | null = null

  const send = (command: string) => {
    worker.postMessage(command)
  }

  const waitForReady = (): Promise<void> => {
    if (readyPromise) return readyPromise

    readyPromise = new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<string>) => {
        if (event.data === 'uciok') {
          send('isready')
          return
        }
        if (event.data === 'readyok') {
          worker.removeEventListener('message', handleMessage)
          resolve()
        }
      }
      worker.addEventListener('message', handleMessage)
      send('uci')
    })

    return readyPromise
  }

  const getBestMove = async (
    fen: string,
    skillLevel: number,
    movetime: number,
  ): Promise<string> => {
    await waitForReady()

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<string>) => {
        const data = event.data
        if (typeof data === 'string' && data.startsWith('bestmove')) {
          worker.removeEventListener('message', handleMessage)
          const move = data.split(' ')[1]
          resolve(move)
        }
      }
      worker.addEventListener('message', handleMessage)

      send(`setoption name Skill Level value ${skillLevel}`)
      send(`position fen ${fen}`)
      send(`go movetime ${movetime}`)
    })
  }

  const terminate = () => {
    worker.terminate()
  }

  return { getBestMove, terminate }
}
