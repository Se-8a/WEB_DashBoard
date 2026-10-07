[README.md](https://github.com/user-attachments/files/33146287/README.md)
# Neon Dashboard

ブラウザ上で動作する、メディア操作対応のWeb Dashboardです。

Android端末をメディア操作用のDashboardとして利用する構成に加えて、PCではChrome/Edge系ブラウザの拡張機能を介して、別タブで再生中のYouTube / YouTube Musicを操作できます。

## Features

### Dashboard

- メディア情報表示
  - 曲名
  - アーティスト
  - アルバム
  - 再生時間
  - 総再生時間
- アルバムアート表示
- シークバー
- 再生 / 一時停止
- 前の曲
- 次の曲
- NEXT UP表示
- ビジュアライザー
- 天気情報
- RSS
- 端末情報
- バーンイン防止

### PC Browser Media Bridge

ブラウザ拡張機能を使用することで、DashboardからYouTube / YouTube Musicの別タブを操作できます。

```text
Dashboard
   │
   │ window.postMessage
   ▼
Neon Dashboard Media Bridge
   │
   │ chrome.runtime
   ▼
YouTube / YouTube Music
```

通常のWebページだけでは別タブのメディアを直接操作できないため、ブラウザ拡張機能を使用しています。

## Repository Structure

```text
WEB_Dashboard/
├── DashboardWEB_PC.html
├── README.md
└── extension/
    ├── manifest.json
    ├── background.js
    ├── content.js
    └── dashboard-bridge.js
```

## PC版Dashboard

以下のリンクからアクセスできます

`https://se-8a.github.io/WEB_DashBoard/`

## Browser Extension

現在の安定版は **Neon Dashboard Media Bridge v0.2.4** です。

### 対応サイト

- YouTube
- YouTube Music
- GitHub Pages版 Neon Dashboard
- localhost / 127.0.0.1 / file:// のDashboard

### 導入方法

1. GitHub Releasesなどから拡張機能のZIPをダウンロードする。
2. ZIPを展開する。
3. ChromeまたはEdgeで以下を開く。

```text
chrome://extensions/
```

4. **デベロッパーモード**を有効にする。
5. **パッケージ化されていない拡張機能を読み込む**を選択する。
6. `manifest.json` が直接入っているフォルダを選択する。
7. YouTube / YouTube Musicのタブを再読み込みする。
8. Dashboardも再読み込みする。

## Usage

1. YouTubeまたはYouTube Musicをブラウザで開く。
2. 動画・音楽を再生する。
3. GitHub Pages版Dashboardを開く。
4. Dashboardのメディアコントローラーから操作する。

DashboardとYouTubeを同じブラウザで開いている必要があります。

## Extension Components

### `dashboard-bridge.js`

Dashboardと拡張機能の間を接続します。

Dashboardからの`window.postMessage`を受け取り、拡張機能のService Workerへ転送します。

### `background.js`

拡張機能のService Workerです。

主に以下を担当します。

- 操作対象タブの管理
- Dashboardからのコマンド転送
- メディア情報の取得要求
- YouTube / YouTube Music側Content Scriptとの通信

### `content.js`

YouTube / YouTube Musicのページに注入されます。

主に以下を担当します。

- HTML5 Media Elementの取得
- 再生 / 一時停止
- シーク
- 前後の曲への移動
- 再生状態の取得
- 曲名などのメディア情報取得
- アルバムアート取得

YouTube MusicではSPAによるページ遷移に対応するため、アルバムアートを現在のプレイヤーUIから取得する処理を使用しています。

## Permissions

拡張機能では主に以下を使用します。

```text
tabs
```

また、YouTube / YouTube MusicのページへContent Scriptを注入するため、以下のホスト権限を使用します。

```text
https://www.youtube.com/*
https://music.youtube.com/*
```

## Notes

### Tailwind CSS

DashboardではTailwind CSS CDNを使用しています。

本番環境ではTailwind CLI / PostCSSによるビルドが推奨されるため、ブラウザのConsoleに以下の警告が表示される場合があります。

```text
cdn.tailwindcss.com should not be used in production
```

これはDashboardのメディアブリッジ機能のエラーではありません。

### Album Art

YouTube / YouTube MusicはSPAとして動作するため、ページURLが変わってもページ全体が再読み込みされない場合があります。

そのため、アルバムアートは固定された`og:image`だけに依存せず、現在のプレイヤーUIなどから取得します。

## Version

### v0.2.4

- GitHub Pages版Dashboardとの接続を改善
- Dashboard bridgeのロード確認を追加
- bridgeとService Worker間のエラー処理を改善
- YouTube / YouTube Music操作機能を維持
- GitHub Pages環境での動作に対応

## License

現在、このリポジトリに個別のライセンスは設定していません。
利用・改変・再配布については、リポジトリ所有者が設定するライセンスに従ってください。
