# frozen_string_literal: true

class CaffeineCalculator
  # ユーザーのパラメータに基づいて調整された半減期（分）を計算
  # @param user [Hash] ユーザー情報
  # @return [Float] 調整済み半減期（分）
  def get_adjusted_half_life(user)
    base_half_life = case user[:age_years]
                     when 0..20 then 240.0
                     when 21..40 then 300.0
                     when 41..60 then 360.0
                     when 61..75 then 420.0
                     else 480.0
                     end

    gene_factor = case user[:gene_type]
                  when 'fast' then 0.7
                  when 'slow' then 1.5
                  else 1.0
                  end

    smoker_factor = user[:is_smoker] ? 0.6 : 1.0
    medication_factor = user[:is_on_meds] ? 1.5 : 1.0

    base_half_life * gene_factor * smoker_factor * medication_factor
  end

  # カフェイン濃度を計算
  # @param current_time [Time] 現在時刻
  # @param intake_history [Array<Hash>] 摂取履歴
  # @param user [Hash] ユーザー情報
  # @return [Float] カフェイン濃度 (mg/kg)
  def calculate_concentration(current_time, intake_history, user)
    adjusted_half_life = get_adjusted_half_life(user)
    k = Math.log(2) / adjusted_half_life
    ka = 0.05 # 吸収速度定数
    f = 1.0   # バイオアベイラビリティ

    total_concentration = 0.0
    intake_history.each do |event|
      intake_time = Time.at(event[:time_unix])
      if current_time >= intake_time
        elapsed_time = (current_time - intake_time) / 60.0 # 秒を分に変換

        # 二重指数関数モデル
        concentration_at_t = ((f * ka * event[:caffeine_mg]) / (user[:weight_kg] * (ka - k))) *
                             (Math.exp(-k * elapsed_time) - Math.exp(-ka * elapsed_time))

        total_concentration += concentration_at_t
      end
    end

    total_concentration
  end

  # 指定した時間後のカフェイン濃度を計算する関数
  # @param hours_later [Float] 何時間後かを指定（小数も可能）
  # @param intake_history [Array<Hash>] カフェイン摂取履歴
  # @param user [Hash] ユーザー情報
  # @return [Float] カフェイン濃度 (mg/kg)
  def calculate_concentration_after_hours(hours_later, intake_history, user)
    now = Time.now
    target_time = now + hours_later * 60 * 60
    calculate_concentration(target_time, intake_history, user)
  end

  # カフェイン摂取を30分間で10回に分割して段階的な摂取イベントを生成
  # @param start_time_unix [Integer] 摂取開始時刻（Unix時刻秒）
  # @param total_caffeine_mg [Float] 総カフェイン量（mg）
  # @return [Array<Hash>] 3分間隔で10回の摂取イベント配列
  def create_gradual_intake_events(start_time_unix, total_caffeine_mg)
    events = []
    interval_minutes = 3
    number_of_events = 10
    caffeine_per_event = total_caffeine_mg / number_of_events

    number_of_events.times do |i|
      event_time = start_time_unix + i * interval_minutes * 60
      events.push({
        time_unix: event_time,
        caffeine_mg: caffeine_per_event
      })
    end
    events
  end

  # カフェイン濃度の重要なポイントを分析する関数
  # @param intake_history [Array<Hash>] カフェイン摂取履歴
  # @param user [Hash] ユーザー情報
  # @param analysis_hours [Integer] 分析する時間範囲（時間）
  # @return [Hash] 分析結果
  def analyze_caffeine_concentration(intake_history, user, analysis_hours = 24)
    now = Time.now
    interval_minutes = 1 # 1分間隔で詳細分析
    max_concentration = { value: 0, time_hours: 0, date_time: now }
    above_2mgkg_periods = []
    above_3_5mgkg_periods = []
    below_1mgkg_time = nil

    was_above_2mgkg = false
    current_period_start_2mgkg = nil

    was_above_3_5mgkg = false
    current_period_start_3_5mgkg = nil

    (0..(analysis_hours * 60)).step(interval_minutes) do |minutes|
      hours_later = minutes.to_f / 60
      current_time = now + minutes * 60
      concentration = calculate_concentration_after_hours(hours_later, intake_history, user)

      # 最大濃度の更新
      if concentration > max_concentration[:value]
        max_concentration = {
          value: concentration,
          time_hours: hours_later,
          date_time: current_time
        }
      end

      # 2mg/kg閾値の分析
      if concentration >= 2.0
        unless was_above_2mgkg
          current_period_start_2mgkg = current_time
          was_above_2mgkg = true
        end
      else
        if was_above_2mgkg && current_period_start_2mgkg
          above_2mgkg_periods.push({
            start_time: current_period_start_2mgkg,
            end_time: current_time
          })
          was_above_2mgkg = false
          current_period_start_2mgkg = nil
        end
      end

      # 3.5mg/kg警戒域の分析
      if concentration >= 3.5
        unless was_above_3_5mgkg
          current_period_start_3_5mgkg = current_time
          was_above_3_5mgkg = true
        end
      else
        if was_above_3_5mgkg && current_period_start_3_5mgkg
          above_3_5mgkg_periods.push({
            start_time: current_period_start_3_5mgkg,
            end_time: current_time
          })
          was_above_3_5mgkg = false
          current_period_start_3_5mgkg = nil
        end
      end

      # 1mg/kg閾値の分析（初回のみ）
      if concentration < 1.0 && below_1mgkg_time.nil? && hours_later > 0.5
        below_1mgkg_time = current_time
      end
    end

    # 分析終了時に2mg/kg以上の状態が続いている場合
    if was_above_2mgkg && current_period_start_2mgkg
      above_2mgkg_periods.push({ start_time: current_period_start_2mgkg, end_time: nil })
    end

    # 分析終了時に3.5mg/kg以上の状態が続いている場合
    if was_above_3_5mgkg && current_period_start_3_5mgkg
      above_3_5mgkg_periods.push({ start_time: current_period_start_3_5mgkg, end_time: nil })
    end

    {
      max_concentration: max_concentration,
      above_2mgkg_periods: above_2mgkg_periods,
      above_3_5mgkg_periods: above_3_5mgkg_periods,
      below_1mgkg: { time: below_1mgkg_time }
    }
  end

  # カフェイン濃度分析結果を出力する関数
  # @param intake_history [Array<Hash>] カフェイン摂取履歴
  # @param user [Hash] ユーザー情報
  # @param drink_number [Integer] 何杯目か
  def print_caffeine_analysis(intake_history, user, drink_number)
    adjusted_half_life = get_adjusted_half_life(user)
    analysis = analyze_caffeine_concentration(intake_history, user, 15)

    puts "\n=== #{drink_number}杯目摂取完了後の分析 ==="
    puts "調整済み半減期: #{adjusted_half_life.round(1)}分 (#{(adjusted_half_life / 60).round(1)}時間)"

    puts "\n【最大濃度】"
    puts "濃度: #{analysis[:max_concentration][:value].round(3)} mg/kg"
    puts "時間: #{analysis[:max_concentration][:time_hours].round(2)}時間後"
    puts "日時: #{analysis[:max_concentration][:date_time].strftime('%Y/%m/%d %H:%M:%S')}"

    puts "\n【2mg/kg閾値】"
    if analysis[:above_2mgkg_periods].empty?
      puts "2mg/kgを超えることはありませんでした"
    else
      puts "2mg/kg超過期間数: #{analysis[:above_2mgkg_periods].length}回"
      analysis[:above_2mgkg_periods].each.with_index(1) do |period, index|
        puts "\n期間#{index}:"
        puts "  開始: #{period[:start_time].strftime('%Y/%m/%d %H:%M:%S')}"
        if period[:end_time]
          puts "  終了: #{period[:end_time].strftime('%Y/%m/%d %H:%M:%S')}"
          duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
          puts "  持続時間: #{duration_minutes / 60}時間#{duration_minutes % 60}分"
        else
          puts "  終了: 分析期間中は継続"
        end
      end
    end

    puts "\n【3.5mg/kg警戒域】⚠️"
    if analysis[:above_3_5mgkg_periods].empty?
      puts "警戒域（3.5mg/kg）に達することはありませんでした"
    else
      puts "⚠️ 警戒域超過期間数: #{analysis[:above_3_5mgkg_periods].length}回"
      analysis[:above_3_5mgkg_periods].each.with_index(1) do |period, index|
        puts "\n⚠️ 警戒期間#{index}:"
        puts "  開始: #{period[:start_time].strftime('%Y/%m/%d %H:%M:%S')}"
        if period[:end_time]
          puts "  終了: #{period[:end_time].strftime('%Y/%m/%d %H:%M:%S')}"
          duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
          puts "  持続時間: #{duration_minutes / 60}時間#{duration_minutes % 60}分"
        else
          puts "  終了: 分析期間中は継続"
        end
      end
      puts "\n🚨 注意: 3.5mg/kg以上は副作用リスクが高い領域です"
    end

    puts "\n【1mg/kg閾値】"
    if analysis[:below_1mgkg][:time]
      puts "1mg/kg未満になる: #{analysis[:below_1mgkg][:time].strftime('%Y/%m/%d %H:%M:%S')}"
    else
      puts "分析期間中は1mg/kg以上を維持"
    end
  end
end

# === 使用例 ===
calculator = CaffeineCalculator.new

user = {
  weight_kg: 52.0,
  age_years: 21,
  gene_type: 'normal',
  is_smoker: false,
  is_on_meds: false
}

now = Time.now

# 段階的な摂取イベントを生成（30分間で10回に分割）
first_drink_events = calculator.create_gradual_intake_events(
  now.to_i,
  142.0 # 142mgのカフェインを30分で分割摂取
)

puts '🔍 1杯目の摂取イベント開始...'
puts "摂取開始時刻: #{now.strftime('%Y/%m/%d %H:%M:%S')}"
puts "摂取完了時刻: #{(now + 27 * 60).strftime('%Y/%m/%d %H:%M:%S')}"

# 1杯目摂取完了後の分析
calculator.print_caffeine_analysis(first_drink_events, user, 1)

# 5時間後に2回目の摂取イベントを生成
second_drink_events = calculator.create_gradual_intake_events(
  now.to_i + 300 * 60, # 5時間後に2回目の摂取開始
  142.0 # 142mgのカフェインを30分で分割摂取
)

puts "\n🔍 2杯目の摂取イベント開始..."
puts "摂取開始時刻: #{(now + 300 * 60).strftime('%Y/%m/%d %H:%M:%S')}"
puts "摂取完了時刻: #{(now + (300 + 27) * 60).strftime('%Y/%m/%d %H:%M:%S')}"

# 全ての摂取イベントを結合
all_intake_history = first_drink_events + second_drink_events

# 2杯目摂取完了後の分析（累積効果）
calculator.print_caffeine_analysis(all_intake_history, user, 2)

# 15分刻みで様々な時間後の濃度を計算
time_points = []
(0..12).step(0.5) { |hour| time_points.push(hour) }

puts "\n📊 カフェイン濃度の時間推移（15分刻み）:"
time_points.each do |hours|
  concentration = calculator.calculate_concentration_after_hours(
    hours,
    all_intake_history,
    user
  )
  puts "#{hours}時間後: #{concentration.round(3)} mg/kg"
end

# 特定の時間を指定して計算
puts "\n📈 特定時間の濃度計算:"
specific_hours = [1.5, 3.5, 6.5, 10.5, 12.5, 15.5, 18] # 1.5時間後、3.5時間後、10.5時間後など
specific_hours.each do |hours|
  concentration = calculator.calculate_concentration_after_hours(
    hours,
    all_intake_history,
    user
  )
  puts "#{hours}時間後: #{concentration.round(2)} mg/kg"
end
