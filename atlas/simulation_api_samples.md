# シミュレーションAPI検証サンプル

## 1. 段階的摂取シミュレーション
### POST /api/v1/simulation/gradual_intake

```json
{
  "user_id": 1,
  "start_time": 1724400000,
  "total_caffeine_mg": 200.0,
  "interval_minutes": 5,
  "number_of_events": 8,
  "analysis_hours": 12
}
```

**説明**: コーヒー200mgを5分間隔で8回に分けて摂取した場合と一気摂取の比較分析

---

## 2. 詳細濃度分析
### POST /api/v1/simulation/detailed_analysis

```json
{
  "user_id": 1,
  "intake_history": [
    {
      "time_unix": 1724400000,
      "caffeine_mg": 95.0
    },
    {
      "time_unix": 1724410800,
      "caffeine_mg": 80.0
    },
    {
      "time_unix": 1724425200,
      "caffeine_mg": 120.0
    }
  ],
  "analysis_hours": 18,
  "base_time": 1724400000
}
```

**説明**: 朝、昼、夕方の3回のカフェイン摂取履歴に基づく詳細分析

---

## 3. 濃度タイムライン生成
### POST /api/v1/simulation/concentration_timeline

```json
{
  "user_id": 1,
  "intake_history": [
    {
      "time_unix": 1724400000,
      "caffeine_mg": 150.0
    },
    {
      "time_unix": 1724414400,
      "caffeine_mg": 95.0
    }
  ],
  "analysis_hours": 16,
  "interval_minutes": 30,
  "base_time": 1724400000
}
```

**説明**: 朝と午後の2回摂取での30分間隔の詳細タイムライン

---

## 4. 摂取イベント生成ヘルパー
### POST /api/v1/simulation/create_intake_events

```json
{
  "start_time": 1724400000,
  "total_caffeine_mg": 300.0,
  "interval_minutes": 10,
  "number_of_events": 6
}
```

**説明**: エナジードリンク300mgを10分間隔で6回に分割した摂取イベントを生成

---

## 実際のテスト用サンプル（現在時刻基準）

### 段階的摂取シミュレーション（現在時刻から開始）
```json
{
  "user_id": 1,
  "total_caffeine_mg": 160.0,
  "interval_minutes": 3,
  "number_of_events": 10,
  "analysis_hours": 24
}
```

### 複数回摂取の詳細分析（過去24時間）
```json
{
  "user_id": 1,
  "intake_history": [
    {
      "time_unix": 1724313600,
      "caffeine_mg": 95.0
    },
    {
      "time_unix": 1724324400,
      "caffeine_mg": 80.0
    },
    {
      "time_unix": 1724335200,
      "caffeine_mg": 120.0
    },
    {
      "time_unix": 1724349600,
      "caffeine_mg": 95.0
    }
  ],
  "analysis_hours": 24
}
```

### 高濃度摂取タイムライン（危険域分析用）
```json
{
  "user_id": 1,
  "intake_history": [
    {
      "time_unix": 1724400000,
      "caffeine_mg": 400.0
    },
    {
      "time_unix": 1724403600,
      "caffeine_mg": 200.0
    }
  ],
  "analysis_hours": 12,
  "interval_minutes": 15
}
```

---

## 想定されるレスポンス例

### 段階的摂取シミュレーションのレスポンス構造
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "田中太郎",
    "weight_kg": 70.0,
    "age": 30
  },
  "simulation_parameters": {
    "total_caffeine_mg": 200.0,
    "interval_minutes": 5,
    "number_of_events": 8,
    "analysis_hours": 12,
    "start_time": "2024-08-23T10:00:00+09:00"
  },
  "gradual_intake": {
    "events": [...],
    "analysis": {
      "max_concentration": {
        "value": 2.1,
        "time_hours": 1.5,
        "date_time": "2024-08-23T11:30:00+09:00"
      },
      "above_2mgkg_periods": [...],
      "above_3_5mgkg_periods": [],
      "below_1mgkg": {
        "time": "2024-08-23T18:45:00+09:00"
      }
    }
  },
  "single_intake": {
    "analysis": {
      "max_concentration": {
        "value": 2.8,
        "time_hours": 0.75,
        "date_time": "2024-08-23T10:45:00+09:00"
      }
    }
  },
  "comparison": {
    "max_concentration_reduction": 0.7,
    "peak_delay_hours": 0.75
  }
}
```

### 濃度タイムラインのレスポンス構造
```json
{
  "status": "success",
  "timeline": [
    {
      "time_unix": 1724400000,
      "time_iso": "2024-08-23T10:00:00+09:00",
      "hours_elapsed": 0.0,
      "concentration_mg_per_kg": 0.0,
      "concentration_level": "none"
    },
    {
      "time_unix": 1724401800,
      "time_iso": "2024-08-23T10:30:00+09:00",
      "hours_elapsed": 0.5,
      "concentration_mg_per_kg": 1.85,
      "concentration_level": "moderate"
    },
    {
      "time_unix": 1724403600,
      "time_iso": "2024-08-23T11:00:00+09:00",
      "hours_elapsed": 1.0,
      "concentration_mg_per_kg": 2.32,
      "concentration_level": "high"
    }
  ]
}
```

---

## curlコマンドでのテスト例

```bash
# 段階的摂取シミュレーション
curl -X POST http://localhost:3000/api/v1/simulation/gradual_intake \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "total_caffeine_mg": 200.0,
    "interval_minutes": 5,
    "number_of_events": 8,
    "analysis_hours": 12
  }'

# 詳細濃度分析
curl -X POST http://localhost:3000/api/v1/simulation/detailed_analysis \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "intake_history": [
      {"time_unix": 1724400000, "caffeine_mg": 95.0},
      {"time_unix": 1724410800, "caffeine_mg": 80.0}
    ],
    "analysis_hours": 18
  }'

# 濃度タイムライン
curl -X POST http://localhost:3000/api/v1/simulation/concentration_timeline \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "intake_history": [
      {"time_unix": 1724400000, "caffeine_mg": 150.0}
    ],
    "analysis_hours": 16,
    "interval_minutes": 30
  }'
```
