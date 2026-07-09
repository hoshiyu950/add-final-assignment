# チェスウェブアプリ 実装計画

## 方針

- 実装は AI エージェントに全面委託する
- 各タスクは独立して完了できる粒度に分解する
- 完了条件にはブラウザ動作確認と Vitest によるユニットテストを含める
- タスクは上から順に実施する（依存関係を考慮した順序）

---

## フェーズ一覧

| フェーズ | 内容 | 依存 |
|----------|------|------|
| Phase 1 | プロジェクトセットアップ | なし |
| Phase 2 | ルーティングと画面骨格 | Phase 1 |
| Phase 3 | ゲームロジック層 | Phase 1 |
| Phase 4 | チェス盤 UI | Phase 2, 3 |
| Phase 5 | CPU AI 統合 | Phase 3 |
| Phase 6 | プレイ画面の完成 | Phase 4, 5 |
| Phase 7 | ホーム・設定・ルール画面 | Phase 2 |
| Phase 8 | スタイリング仕上げ | Phase 6, 7 |
| Phase 9 | テスト・品質確認 | Phase 6, 7 |

---

## 詳細タスク

### Phase 1: プロジェクトセットアップ

#### Task 1-1: Vite + React + TypeScript プロジェクト作成

**作業内容**
- `npm create vite@latest` で React + TypeScript テンプレートを生成する
- プロジェクト名は `chess-app`（またはルートディレクトリに直接生成）

**インストールするパッケージ**

| パッケージ | 用途 |
|------------|------|
| `react-router-dom` v6 | 画面遷移 |
| `chess.js` | チェスルール判定・FEN 管理 |
| `stockfish` | チェス AI エンジン（WASM 版） |
| `tailwindcss` + `autoprefixer` + `postcss` | スタイリング |
| `vitest` + `@testing-library/react` + `jsdom` | ユニットテスト |

**完了条件**
- `npm run dev` でブラウザにデフォルトページが表示される
- `npm run test` が実行できる（テストなしでも通過）
- `tailwind.config.js` と `postcss.config.js` が正しく設定されている

---

#### Task 1-2: ディレクトリ構成の作成

**ディレクトリ構成**

```
src/
├── components/        # 共通 UI コンポーネント
│   └── Button/
├── pages/             # 各画面コンポーネント
│   ├── HomePage/
│   ├── SettingsPage/
│   ├── PlayPage/
│   └── RulesPage/
├── features/
│   ├── chess/         # ゲームロジック（chess.js ラッパー）
│   └── stockfish/     # AI エンジン統合
├── hooks/             # カスタム React フック
├── types/             # 型定義
├── constants/         # 定数（カラー、AI レベルなど）
├── App.tsx            # ルーティング定義
└── main.tsx           # エントリーポイント
```

**完了条件**
- 上記ディレクトリが空ファイル（`.gitkeep`）込みで作成されている

---

### Phase 2: ルーティングと画面骨格

#### Task 2-1: React Router v6 によるルーティング設定

**作業内容**
- `App.tsx` に以下のルートを定義する

| パス | コンポーネント |
|------|---------------|
| `/` | `HomePage` |
| `/settings` | `SettingsPage` |
| `/play` | `PlayPage` |
| `/rules` | `RulesPage` |

**完了条件**
- 各 URL に直接アクセスして対応ページが表示される
- 存在しないパスは `/` にリダイレクトされる

---

#### Task 2-2: 各画面のスケルトンコンポーネント作成

**作業内容**
- `HomePage`、`SettingsPage`、`PlayPage`、`RulesPage` それぞれに最低限のマークアップを実装する
- 各ページにページタイトルと「ホームへ戻る」リンクを配置する（仮）

**完了条件**
- 全 4 ページがブラウザで表示できる
- ページ間のリンク遷移が機能する

---

### Phase 3: ゲームロジック層

#### Task 3-1: chess.js ラッパーモジュールの実装

**ファイル**: `src/features/chess/chessEngine.ts`

**実装する関数**

| 関数名 | 説明 |
|--------|------|
| `initGame()` | 新しいゲームインスタンスを返す |
| `getLegalMoves(square)` | 指定マスの合法手リストを返す |
| `makeMove(from, to)` | 指手を適用し、新しいゲーム状態を返す |
| `getBoard()` | 現在の盤面状態（8×8 配列）を返す |
| `isCheck()` | 王手中かどうかを返す |
| `isCheckmate()` | チェックメイトかどうかを返す |
| `isStaleMate()` | ステイルメイトかどうかを返す |
| `isGameOver()` | ゲーム終了かどうかを返す |
| `getMoveHistory()` | 代数記法の指手リストを返す |
| `getTurn()` | 現在の手番（`'w'` / `'b'`）を返す |
| `getFen()` | 現在の FEN 文字列を返す |

**完了条件**
- Vitest で以下をテストする
  - 初期盤面が正しいこと
  - 合法手が正しく返ること（例: e2 のポーンは e3, e4 に移動可能）
  - 不正な手は適用されないこと
  - チェックメイト状態が正しく検出されること

---

#### Task 3-2: ゲーム状態管理フックの実装

**ファイル**: `src/hooks/useChessGame.ts`

**管理するステート**

| ステート | 型 | 説明 |
|----------|----|------|
| `board` | `BoardState` | 現在の盤面 |
| `selectedSquare` | `Square \| null` | 選択中のマス |
| `legalMoves` | `Square[]` | 選択駒の合法手 |
| `lastMove` | `{ from: Square, to: Square } \| null` | 直前の指手 |
| `moveHistory` | `string[]` | 指手履歴（代数記法） |
| `turn` | `'w' \| 'b'` | 現在の手番 |
| `gameStatus` | `'playing' \| 'checkmate' \| 'stalemate'` | ゲーム状態 |
| `isCheck` | `boolean` | 王手中フラグ |

**実装するアクション**

| アクション | 説明 |
|------------|------|
| `selectSquare(square)` | マスを選択／移動を実行 |
| `resetGame()` | ゲームをリセット |

**完了条件**
- Vitest で以下をテストする
  - マスを選択すると `selectedSquare` と `legalMoves` が更新される
  - 合法手のマスをクリックすると駒が移動する
  - 移動後に `turn` が切り替わる

---

### Phase 4: チェス盤 UI

#### Task 4-1: `ChessBoard` コンポーネントの実装

**ファイル**: `src/components/ChessBoard/ChessBoard.tsx`

**UI 仕様**

- 8×8 マスのグリッドを描画する
- マスの色：白マス `#FFFEFE`、黒マス `#6B7280`
- 駒は Unicode チェス文字（または SVG アイコン）で表示する
- 選択中のマスを青系でハイライトする（`#0071E3` 半透明）
- 合法手のマスをドット（●）またはリングでハイライトする
- 直前の指手（移動元・移動先）を黄色系でハイライトする
- 王手中のキングのマスを赤系でハイライトする
- 盤面の縦軸（1–8）横軸（a–h）のラベルを表示する
- プレイヤーが黒駒を選んだ場合は盤面を 180° 反転する

**Props**

```typescript
interface ChessBoardProps {
  board: BoardState;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isCheck: boolean;
  playerColor: 'w' | 'b';
  turn: 'w' | 'b';
  onSquareClick: (square: Square) => void;
}
```

**完了条件**
- ブラウザで初期盤面が正しく表示される
- 駒をクリックすると合法手がハイライトされる
- 駒が正しく移動する

---

#### Task 4-2: `MoveHistory` コンポーネントの実装

**ファイル**: `src/components/MoveHistory/MoveHistory.tsx`

**UI 仕様**

- 手番番号、白の指手、黒の指手を横並びで表示する
  ```
  1.  e2-e4    e7-e5
  2.  d2-d4    d7-d5
  ```
- スクロール可能な縦リストで最新手が下に追加される
- 最新の指手が自動スクロールで見えるようにする

**Props**

```typescript
interface MoveHistoryProps {
  moves: string[];
}
```

**完了条件**
- ブラウザで指手履歴が正しく表示される
- 指手が増えると自動スクロールする

---

### Phase 5: CPU AI 統合

#### Task 5-1: Stockfish Web Worker の実装

**ファイル**: `src/features/stockfish/stockfishWorker.ts`

**実装内容**

- Stockfish WASM を Web Worker として動作させる
- FEN 文字列を渡すと最善手を返す非同期インターフェースを実装する

```typescript
interface StockfishWorker {
  getBestMove(fen: string, skillLevel: number, movetime: number): Promise<string>;
  terminate(): void;
}
```

**完了条件**
- 初期局面の FEN を渡して最善手が返ってくることをブラウザで確認する

---

#### Task 5-2: `useStockfish` フックの実装

**ファイル**: `src/hooks/useStockfish.ts`

**難易度パラメータ**

| 難易度 | Skill Level | movetime (ms) |
|--------|-------------|---------------|
| 初級   | 2           | 500           |
| 中級   | 10          | 1000          |
| 上級   | 20          | 2000          |

**管理するステート**

| ステート | 型 | 説明 |
|----------|----|------|
| `isThinking` | `boolean` | AI 思考中フラグ |
| `bestMove` | `string \| null` | 最善手（UCI 形式） |

**実装するアクション**

| アクション | 説明 |
|------------|------|
| `requestMove(fen, difficulty)` | AI に指手を要求する |

**完了条件**
- `isThinking` が思考中は `true` になる
- 指手が返ってくると `bestMove` が更新される

---

### Phase 6: プレイ画面の完成

#### Task 6-1: `PlayPage` の組み立て

**ファイル**: `src/pages/PlayPage/PlayPage.tsx`

**レイアウト**

```
[手番表示 / チェック警告]
+------------------+  +------------------+
|                  |  |  指手履歴         |
|   ChessBoard     |  |                  |
|                  |  +------------------+
|                  |  |  AI 思考中...     |
+------------------+  +------------------+
```

**実装内容**

- `useChessGame` と `useStockfish` を組み合わせてゲームを制御する
- AI の手番になったら自動的に `requestMove` を呼び出す
- AI の指手が返ってきたら `makeMove` でゲームに適用する
- `isThinking` が `true` の間はローディングスピナーを表示する
- ゲーム終了時にモーダルを表示する（「あなたの勝ち」「あなたの負け」「引き分け」）
- モーダルから「ホームに戻る」ボタンでホームへ遷移する

**設定データの受け取り**

- React Router の `location.state` から `{ playerColor, difficulty }` を受け取る

**完了条件**
- ブラウザで完全なゲームが動作する（初手〜チェックメイトまで遊べる）
- AI が正しく応手する
- ゲーム終了モーダルが表示される

---

### Phase 7: ホーム・設定・ルール画面

#### Task 7-1: `HomePage` の実装

**ファイル**: `src/pages/HomePage/HomePage.tsx`

**UI 仕様**

- アプリ名（例：「Chess」）を大きく表示する
- 「ゲームを始める」ボタン：`/settings` へ遷移
- 「ルールを確認する」ボタン：`/rules` へ遷移
- Apple ライクな中央揃えレイアウト

**完了条件**
- ブラウザでボタンが動作し、正しい画面に遷移する

---

#### Task 7-2: `SettingsPage` の実装

**ファイル**: `src/pages/SettingsPage/SettingsPage.tsx`

**UI 仕様**

- 駒の色選択：白 / 黒 のトグルまたはカードUI
- 難易度選択：初級 / 中級 / 上級 のカードUI
- 「ゲームを始める」ボタン：選択内容を `location.state` に渡して `/play` へ遷移
- 「戻る」ボタン：`/` へ遷移

**完了条件**
- 白/黒の選択状態が視覚的にわかる
- 難易度の選択状態が視覚的にわかる
- ゲーム開始ボタンで正しい設定が `PlayPage` に渡される

---

#### Task 7-3: `RulesPage` の実装

**ファイル**: `src/pages/RulesPage/RulesPage.tsx`

**UI 仕様**

- セクション構成：
  1. ゲームの目的
  2. 各駒の動き方（テキスト + 駒の Unicode 文字）
  3. チェック・チェックメイトの説明
  4. 引き分け（ステイルメイト）の説明
- 「ホームに戻る」ボタン

**完了条件**
- ブラウザで全セクションが読める
- ホームに戻るボタンが動作する

---

### Phase 8: スタイリング仕上げ

#### Task 8-1: グローバルスタイルとデザイントークンの定義

**ファイル**: `tailwind.config.js`、`src/index.css`

**設定内容**

```javascript
// tailwind.config.js の extend
colors: {
  brand: {
    bg: '#F5F5F7',
    accent: '#0071E3',
    text: '#1D1D1F',
    board: {
      light: '#FFFEFE',
      dark: '#6B7280',
    },
  },
},
fontFamily: {
  sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
},
borderRadius: {
  apple: '12px',
},
```

**完了条件**
- Tailwind のカスタムカラーが全コンポーネントで参照できる

---

#### Task 8-2: レスポンシブ対応

**作業内容**

- `ChessBoard` はビューポート幅に応じてサイズを可変にする（`min(90vw, 480px)` 程度）
- `PlayPage` のレイアウトをモバイルでは縦積み、デスクトップでは横並びにする
- Tailwind の `sm:` / `md:` / `lg:` ブレークポイントを使用する

**完了条件**
- スマートフォン（375px）でチェス盤が操作できる
- デスクトップ（1280px）で横並びレイアウトが崩れない

---

#### Task 8-3: アニメーションとマイクロインタラクション

**作業内容**

- ボタンのホバー・クリック時にトランジションを付ける（`transition-all duration-150`）
- モーダルの表示・非表示にフェードインアニメーションを付ける
- AI 思考中のローディングスピナーを実装する

**完了条件**
- ブラウザで各アニメーションが滑らかに動作する

---

### Phase 9: テスト・品質確認

#### Task 9-1: ユニットテストの整備

**対象ファイル**

| ファイル | テスト内容 |
|----------|-----------|
| `src/features/chess/chessEngine.test.ts` | 全関数の動作確認 |
| `src/hooks/useChessGame.test.ts` | ステート遷移の確認 |
| `src/hooks/useStockfish.test.ts` | AI 呼び出しのモックテスト |

**完了条件**
- `npm run test` がエラーなく通過する
- カバレッジ：ゲームロジック層（`features/chess/`）は 80% 以上

---

#### Task 9-2: ブラウザ動作確認チェックリスト

以下をブラウザで手動確認する。

- [ ] ホーム画面が表示される
- [ ] 設定画面で白/黒・難易度を選択できる
- [ ] プレイ画面でチェス盤が正しく表示される
- [ ] 駒を選択すると合法手がハイライトされる
- [ ] 駒を移動できる
- [ ] AI が応手する（ローディング表示あり）
- [ ] チェック状態が表示される
- [ ] チェックメイトでモーダルが表示される
- [ ] ステイルメイトで引き分けモーダルが表示される
- [ ] ルール確認画面が表示される
- [ ] スマートフォンサイズ（375px）で操作できる

---

## 成果物一覧

| ファイル | 説明 |
|----------|------|
| `src/App.tsx` | ルーティング定義 |
| `src/features/chess/chessEngine.ts` | chess.js ラッパー |
| `src/features/stockfish/stockfishWorker.ts` | Stockfish 統合 |
| `src/hooks/useChessGame.ts` | ゲーム状態管理フック |
| `src/hooks/useStockfish.ts` | AI フック |
| `src/components/ChessBoard/ChessBoard.tsx` | チェス盤コンポーネント |
| `src/components/MoveHistory/MoveHistory.tsx` | 指手履歴コンポーネント |
| `src/pages/HomePage/HomePage.tsx` | ホーム画面 |
| `src/pages/SettingsPage/SettingsPage.tsx` | 設定画面 |
| `src/pages/PlayPage/PlayPage.tsx` | プレイ画面 |
| `src/pages/RulesPage/RulesPage.tsx` | ルール確認画面 |
| `tailwind.config.js` | Tailwind 設定 |
