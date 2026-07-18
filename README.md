# tiles SPACE — デジタルショールーム・デモ

空間を最初に体験し、床・壁・カウンターに使われた素材へ自然に進む、限定公開の静的デモサイトです。正式な商品データが未提供のため、商品画面には `DEMO TILE / 正式商品選定前` と `要確認` を明示しています。

## ローカル起動

依存パッケージの追加はありません。ルートディレクトリで静的サーバーを起動します。

```bash
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173/` を開いてください。既存の限定公開ゲートを通過すると、ショールームが表示されます。

## 主要画面

- `index.html?view=showroom` — ROOM / MATERIAL / STORYを切り替える没入型ショールーム
- `index.html?view=projects` — 公開済みプロジェクト一覧とカテゴリ絞り込み
- `index.html?view=materials` — タイル単体画像を使った素材一覧
- `index.html?view=material&id=travertine` — 素材詳細
- `index.html?view=favorites` — タイル・部屋・プロジェクトのMY MATERIAL BOARD
- `index.html?view=samples` — 複数素材のサンプル候補とデモ請求フォーム
- `index.html?view=consultation` — 空間デザイン相談の確認導線
- `index.html?view=search` — 空間・部屋・素材の横断検索
- `admin.html` — 公開画面にリンクを置かないデモ管理画面

## データ保存

- お気に入り: `localStorage` の `tiles-space-favorites`
- サンプル候補: `localStorage` の `tiles-space-sample-cart`
- 管理画面のプロジェクト・部屋・商品: IndexedDB の `tiles-space-demo-admin`
- デモ管理セッション: `sessionStorage` の `tiles-space-demo-admin-session`

保存処理はRepositoryクラスへ集約し、各UIからブラウザ保存APIを直接呼ばない構成です。既存のお気に入りキーは維持しています。

## 管理画面の制約

`admin.html` はローカル操作確認用で、パスワードをHTML・JavaScript・localStorageへ保存しません。「デモ管理画面に入る」でsessionStorageへデモロールを設定するだけであり、本番認証ではありません。

本番化には少なくとも以下が必要です。

- Supabase Auth等による管理者認証
- PostgresとRow Level Securityによる権限制御
- Supabase Storage等による画像アップロード
- 公開／下書きのサーバー側制御
- サンプル請求と相談フォームの安全な送信API
- 入力検証、監査ログ、バックアップ

## テスト

JavaScript変更後は必ず実行します。

```bash
SITE_NODE=/path/to/node npm test
```

Node.jsがPATHにある環境では `npm test` だけで実行できます。

## アクセス制限

既存のアクセスゲートは静的ホスティング用の簡易制限です。SHA-256ハッシュのみをコードに置いていますが、サーバー側認証ではありません。機密情報は配置しないでください。
