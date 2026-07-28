# Individual History

## 概要
Individual Historyは、Google Chrome等のブラウザ履歴を素早く検索・閲覧できるブラウザ拡張機能です。サイドパネルやポップアップからシームレスにアクセスでき、直感的なUIでこれまでの履歴を探すことができます。

## 主な機能
- **履歴検索**: 現在表示しているURLや任意のキーワードに基づき、過去のブラウジング履歴を検索・表示します。
- **サイドパネル連携**: ブラウザのサイドパネルに表示し、現在のページを見ながら履歴を参照できます（Keep機能）。
- **テーマ切り替え**: ユーザーの好みに合わせてダークモードとライトモードを切り替えることができます。
- **無限スクロール**: 過去の履歴を遡ってスムーズに追加読み込みを行います。

## 技術スタック
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Plasmo](https://docs.plasmo.com/) (ブラウザ拡張機能開発フレームワーク)
- pnpm

## 開発環境の構築方法

### 前提条件
- Node.js (推奨バージョンに準拠)
- pnpm

### インストールと起動
1. リポジトリをクローンします。
   ```bash
   git clone https://github.com/keitan1130/individual-history.git
   cd individual-history
   ```
2. 依存関係をインストールします。
   ```bash
   pnpm install
   ```
3. 開発用サーバーを起動します。
   ```bash
   pnpm dev
   ```
4. Chromeブラウザで拡張機能管理画面（`chrome://extensions/`）を開きます。
5. 右上の「デベロッパーモード」をオンにします。
6. 「パッケージ化されていない拡張機能を読み込む」をクリックし、プロジェクト内の `build/chrome-mv3-dev` フォルダを選択して読み込みます。

## 本番ビルド
```bash
pnpm build
```
ビルドが完了すると、`build/chrome-mv3-prod` フォルダが生成されます。ストアへの公開や配布にはこのフォルダを使用します。

## ディレクトリ構成
- `features/`: 主要なUIコンポーネントやビジネスロジック (HistoryViewer 等)
- `assets/`: 拡張機能で使用するアイコンや画像ファイル
- `popup.tsx`: ポップアップ起動時のエントリーポイント
- `sidepanel.tsx`: サイドパネル起動時のエントリーポイント

## ライセンス
[MIT License](LICENSE)

このプロジェクトでは、Googleが提供する Material Icons を使用しています。
Material Icons are licensed under the Apache License 2.0.
https://www.apache.org/licenses/LICENSE-2.0
