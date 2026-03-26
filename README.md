# VPS Proxy Setup Tool

WebArena VPS に Squid プロキシを構築するスクリプト生成ツール。

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 で起動。

## Vercel デプロイ

### 方法1: GitHub連携（推奨）

1. このリポジトリを GitHub に push
2. [vercel.com](https://vercel.com) にログイン
3. 「Import Project」からリポジトリを選択
4. そのまま「Deploy」をクリック

### 方法2: Vercel CLI

```bash
npm i -g vercel
vercel
```

## 使い方

1. VPS の IP アドレスと root パスワードを入力
2. プロキシの認証情報を設定
3. 「スクリプト生成」をクリック
4. 表示された SSH コマンドで VPS に接続
5. セットアップスクリプトをコピーして VPS のターミナルに貼り付け実行
6. curl コマンドで動作確認
