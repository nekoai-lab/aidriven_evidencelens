# Moon Cat AI 判定局 (Evidence Lens)

![Moon Cat AI Badge](https://img.shields.io/badge/Moon%20Cat-AI-purple?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Moon Cat AI 判定局**は、画像がAIによって生成されたものかどうかを判定するWebアプリケーションです。
「サイバー × カワイイ」な世界観の中で、複数の検出モデルと最新のAI技術（Gemini & C2PA）を組み合わせて、高精度かつ分かりやすい判定を提供します。

## 🌙 特徴 (Features)

*   **マルチモデル判定**: 複数のHuggingFace上の検出モデル（Ensemble）を使用し、統計的なAI度を算出。
*   **C2PA (Content Credentials) 対応**: 画像に含まれる電子署名（C2PA/CR）を解析し、来歴を確認。
*   **「月ねこ」による解説**: Google Gemini 2.5 Flash を活用し、結果を「月ねこ」というキャラクターが分かりやすく解説。
*   **サイバー × カワイイ UI**: 黒を基調としたネオンカラーと、遊び心のあるインタラクション。

## 🚀 セットアップ (Getting Started)

### 前提条件
*   Node.js (v18以上推奨)
*   HuggingFace API Token
*   Google Gemini API Key

### 1. リポジトリのクローン
```bash
git clone https://github.com/nekoai-lab/aidriven_evidencelens.git
cd aidriven_evidencelens
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.example` をコピーして `.env` を作成し、必要なキーを入力してください。

```bash
cp .env.example .env
```

`.env` の内容:
```env
HF_TOKEN=your_huggingface_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. アプリケーションの起動
開発サーバー（フロントエンド + バックエンド）を起動します。

**バックエンド (Port 3003)**
```bash
npm run server
```

**フロントエンド (Port 5173)**
別のターミナルで実行してください。
```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 🛠️ 技術スタック

*   **Frontend**: React, TypeScript, Vite, TailwindCSS
*   **Backend**: Node.js, Express
*   **AI/API**: Google Gemini API, HuggingFace Inference API, C2PA-Node

## 📝 License

This project is licensed under the MIT License.
