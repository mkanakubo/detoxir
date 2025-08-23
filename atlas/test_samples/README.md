# シミュレーションAPI検証用サンプル

このディレクトリには、各シミュレーションAPIエンドポイントの検証用サンプルJSONファイルが含まれています。

## ファイル構成

### 1. gradual_intake.json
段階的摂取シミュレーション用のサンプルデータ
- エンドポイント: `POST /api/v1/simulation/gradual_intake`
- 内容: コーヒー200mgを5分間隔で8回に分けて摂取

### 2. detailed_analysis.json
詳細濃度分析用のサンプルデータ
- エンドポイント: `POST /api/v1/simulation/detailed_analysis`
- 内容: 朝、昼、夕方の3回のカフェイン摂取履歴

### 3. concentration_timeline.json
濃度タイムライン生成用のサンプルデータ
- エンドポイント: `POST /api/v1/simulation/concentration_timeline`
- 内容: 朝と午後の2回摂取での30分間隔タイムライン

### 4. create_intake_events.json
摂取イベント生成用のサンプルデータ
- エンドポイント: `POST /api/v1/simulation/create_intake_events`
- 内容: エナジードリンク300mgを10分間隔で6回分割

### 5. high_dose_timeline.json
高濃度摂取タイムライン用のサンプルデータ（危険域分析用）
- エンドポイント: `POST /api/v1/simulation/concentration_timeline`
- 内容: 400mg + 200mgの高濃度摂取での15分間隔タイムライン

## 使用方法

### curlでのテスト例

```bash
# 段階的摂取シミュレーション
curl -X POST http://localhost:3000/api/v1/simulation/gradual_intake \
  -H "Content-Type: application/json" \
  -d @test_samples/gradual_intake.json

# 詳細濃度分析
curl -X POST http://localhost:3000/api/v1/simulation/detailed_analysis \
  -H "Content-Type: application/json" \
  -d @test_samples/detailed_analysis.json

# 濃度タイムライン
curl -X POST http://localhost:3000/api/v1/simulation/concentration_timeline \
  -H "Content-Type: application/json" \
  -d @test_samples/concentration_timeline.json

# 摂取イベント生成
curl -X POST http://localhost:3000/api/v1/simulation/create_intake_events \
  -H "Content-Type: application/json" \
  -d @test_samples/create_intake_events.json

# 高濃度摂取タイムライン
curl -X POST http://localhost:3000/api/v1/simulation/concentration_timeline \
  -H "Content-Type: application/json" \
  -d @test_samples/high_dose_timeline.json
```

## 時刻データについて

サンプルファイル内の `time_unix` は Unix タイムスタンプ（1724400000 = 2024-08-23 10:00:00 JST）を使用しています。
実際のテストでは、現在時刻に合わせて調整してください。

```javascript
// 現在時刻のUnixタイムスタンプを取得
Math.floor(Date.now() / 1000)

// 3時間前のUnixタイムスタンプ
Math.floor((Date.now() - 3 * 60 * 60 * 1000) / 1000)
```
