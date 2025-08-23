# frozen_string_literal: true

class CaffeineEstimator
  # カフェイン含有商品のキーワードとカフェイン量のマッピング
  CAFFEINE_PATTERNS = {
    # エナジードリンク
    /レッドブル|red.*bull/i => 80.0,
    /モンスター|monster/i => 142.0,
    /ロックスター|rockstar/i => 160.0,
    /バーン|burn/i => 80.0,
    /ZONe/i => 75.0,
    /エナジー|energy/i => 50.0,
    
    # コーヒー系
    /エスプレッソ|espresso/i => 63.0,
    /ブラックコーヒー|black.*coffee/i => 60.0,
    /缶コーヒー|coffee/i => 50.0,
    /カフェオレ|cafe.*latte/i => 40.0,
    /マキアート|macchiato/i => 75.0,
    /カプチーノ|cappuccino/i => 75.0,
    /フラペチーノ|frappuccino/i => 95.0,
    /ドリップコーヒー|drip.*coffee/i => 135.0,
    
    # 紅茶・茶系
    /紅茶|black.*tea/i => 47.0,
    /緑茶|green.*tea/i => 28.0,
    /ウーロン茶|oolong.*tea/i => 22.0,
    /マテ茶|mate.*tea/i => 85.0,
    
    # コーラ系
    /コカ・コーラ|coca.*cola/i => 34.0,
    /ペプシ|pepsi/i => 37.0,
    /コーラ|cola/i => 30.0,
    
    # チョコレート系
    /ダークチョコ|dark.*chocolate/i => 12.0,
    /ミルクチョコ|milk.*chocolate/i => 6.0,
    /チョコレート|chocolate/i => 9.0,
    
    # その他
    /ガラナ|guarana/i => 30.0,
    /眠眠打破|megaphone/i => 50.0,
    /リアルゴールド|real.*gold/i => 16.0
  }.freeze

  # カテゴリー別デフォルトカフェイン量
  CATEGORY_DEFAULTS = {
    '飲料' => {
      /コーヒー|coffee/i => 50.0,
      /tea|茶/i => 30.0,
      /cola|コーラ/i => 30.0,
      /energy|エナジー/i => 80.0
    },
    '菓子' => {
      /チョコ|chocolate/i => 8.0,
      /ココア|cocoa/i => 5.0
    }
  }.freeze

  def self.estimate_caffeine_amount(product_info)
    name = product_info[:name] || ''
    category = product_info[:category] || ''
    
    # 1. 商品名からの直接マッチング
    CAFFEINE_PATTERNS.each do |pattern, amount|
      return amount if name.match?(pattern)
    end
    
    # 2. カテゴリー別の推定
    if CATEGORY_DEFAULTS[category]
      CATEGORY_DEFAULTS[category].each do |pattern, amount|
        return amount if name.match?(pattern)
      end
    end
    
    # 3. 容量ベースの推定（ml表記がある場合）
    if (volume = extract_volume(name))
      return estimate_by_volume(name, volume)
    end
    
    # 4. カフェインを含む可能性が高いキーワードが含まれている場合のデフォルト値
    if likely_contains_caffeine?(name, category)
      return 30.0 # デフォルト値
    end
    
    # 5. カフェインが含まれていない可能性が高い
    0.0
  end

  def self.extract_volume(name)
    # "250ml", "500ML", "1.5L" などから容量を抽出
    match = name.match(/(\d+(?:\.\d+)?)\s*(ml|ML|l|L)/i)
    return nil unless match
    
    volume = match[1].to_f
    unit = match[2].downcase
    
    # リットルをmlに変換
    volume *= 1000 if unit == 'l'
    volume
  end

  def self.estimate_by_volume(name, volume_ml)
    case volume_ml
    when 0..150
      # 小容量（エスプレッソ、小さな缶コーヒーなど）
      return 60.0 if name.match?(/コーヒー|coffee/i)
      return 30.0 if name.match?(/茶|tea/i)
      20.0
    when 151..300
      # 中容量（一般的な缶飲料）
      return 50.0 if name.match?(/コーヒー|coffee/i)
      return 80.0 if name.match?(/エナジー|energy/i)
      return 30.0 if name.match?(/コーラ|cola/i)
      25.0
    when 301..500
      # 大容量
      return 80.0 if name.match?(/コーヒー|coffee/i)
      return 120.0 if name.match?(/エナジー|energy/i)
      return 40.0 if name.match?(/コーラ|cola/i)
      35.0
    else
      # 超大容量
      return 150.0 if name.match?(/コーヒー|coffee/i)
      return 200.0 if name.match?(/エナジー|energy/i)
      50.0
    end
  end

  def self.likely_contains_caffeine?(name, category)
    caffeine_keywords = [
      /コーヒー|coffee/i,
      /茶|tea/i,
      /コーラ|cola/i,
      /エナジー|energy/i,
      /チョコ|chocolate/i,
      /ココア|cocoa/i,
      /カフェイン|caffeine/i,
      /眠気|sleep/i,
      /覚醒|awake/i
    ]
    
    caffeine_keywords.any? { |pattern| name.match?(pattern) } ||
    category.match?(/飲料|菓子|coffee|tea|chocolate/i)
  end

  # 推定の信頼度を返す（0.0〜1.0）
  def self.confidence_score(product_info)
    name = product_info[:name] || ''
    
    # 直接マッチした場合は高い信頼度
    CAFFEINE_PATTERNS.each do |pattern, _|
      return 0.9 if name.match?(pattern)
    end
    
    # 容量情報がある場合は中程度の信頼度
    return 0.7 if extract_volume(name)
    
    # カフェイン関連キーワードがある場合は低い信頼度
    return 0.4 if likely_contains_caffeine?(name, product_info[:category])
    
    # それ以外は最低信頼度
    0.1
  end
end
