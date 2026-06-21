import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages（プロジェクトページ）配信のため、本番ビルド時のみ base を
// リポジトリ名に合わせる。ローカル開発(npm run dev)はルート('/')のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/typing-practice/' : '/',
  plugins: [react()],
}))
