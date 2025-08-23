# API設定用の環境変数設定例

# .env.local ファイルに以下を追加

# 楽天 Developers API
# https://webservice.rakuten.co.jp/ でアプリケーションIDを取得
RAKUTEN_APP_ID=your_rakuten_application_id_here

# Yahoo! JAPAN Web API
# https://developer.yahoo.co.jp/ でClient IDを取得  
YAHOO_APP_ID=your_yahoo_client_id_here

# 設定方法:
# 1. 上記のサイトでAPIキーを取得
# 2. Railsアプリのルートディレクトリに .env.local ファイルを作成
# 3. 上記の値を実際のAPIキーに置き換えて記載
# 4. Railsサーバーを再起動

# 注意:
# - APIキーは機密情報です。Gitにコミットしないでください
# - .env.local は .gitignore に追加済みです
# - 本番環境では環境変数として設定してください
