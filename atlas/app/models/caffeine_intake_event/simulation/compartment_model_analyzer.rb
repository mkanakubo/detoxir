# frozen_string_literal: true

class CaffeineIntakeEvent
  module Simulation
    class CompartmentModelAnalyzer
      # @param user [User] ユーザーのモデルインスタンス
      def initialize(user)
        @user = user
        @adjusted_half_life = calculate_adjusted_half_life
        @k = Math.log(2) / @adjusted_half_life
        @ka = 0.05 # 吸収速度定数
        @f = 1.0   # バイオアベイラビリティ
      end

      # 指定した時間後のカフェイン濃度を計算
      # @param current_time [Time] 濃度を計算する現在時刻
      # @param intake_history [Array<Hash>] 摂取履歴
      # @return [Float] カフェイン濃度 (mg/kg)
      def calculate_concentration(current_time, intake_history)
        total_concentration = 0.0
        intake_history.each do |event|
          intake_time = Time.at(event[:time_unix])
          if current_time >= intake_time
            elapsed_time = (current_time - intake_time) / 60.0 # 秒を分に変換

            # 二重指数関数モデルに基づく濃度計算
            concentration_at_t = ((@f * @ka * event[:caffeine_mg]) / (@user.weight_kg * (@ka - @k))) *
                                (Math.exp(-@k * elapsed_time) - Math.exp(-@ka * elapsed_time))
            total_concentration += concentration_at_t
          end
        end
        total_concentration
      end

      # カフェイン濃度の重要なポイントを分析する
      # @param intake_history [Array<Hash>] カフェイン摂取履歴
      # @param analysis_hours [Integer] 分析する時間範囲（時間）
      # @param base_time [Time] 基準時刻（デフォルトは摂取イベントの最新時刻）
      # @return [Hash] 分析結果
      def analyze(intake_history, analysis_hours: 24, base_time: nil)
        now = base_time || Time.at(intake_history.map { |e| e[:time_unix] }.max)
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
          concentration = calculate_concentration(current_time, intake_history)

          # 最大濃度の更新
          if concentration > max_concentration[:value]
            max_concentration = {
              value: concentration,
              time_hours: hours_later,
              date_time: current_time
            }
          end

          # 2mg/kg閾値の分析
          # ... (元のコードのロジックをそのまま移植)
          if concentration >= 2.0
            unless was_above_2mgkg
              current_period_start_2mgkg = current_time
              was_above_2mgkg = true
            end
          else
            if was_above_2mgkg && current_period_start_2mgkg
              above_2mgkg_periods.push({ start_time: current_period_start_2mgkg, end_time: current_time })
              was_above_2mgkg = false
              current_period_start_2mgkg = nil
            end
          end

          # 3.5mg/kg警戒域の分析
          # ... (元のコードのロジックをそのまま移植)
          if concentration >= 3.5
            unless was_above_3_5mgkg
              current_period_start_3_5mgkg = current_time
              was_above_3_5mgkg = true
            end
          else
            if was_above_3_5mgkg && current_period_start_3_5mgkg
              above_3_5mgkg_periods.push({ start_time: current_period_start_3_5mgkg, end_time: current_time })
              was_above_3_5mgkg = false
              current_period_start_3_5mgkg = nil
            end
          end

          # 1mg/kg閾値の分析（初回のみ）
          if concentration < 1.0 && below_1mgkg_time.nil? && hours_later > 0.5
            below_1mgkg_time = current_time
          end
        end

        # 分析終了時に状態が継続している場合の処理
        if was_above_2mgkg && current_period_start_2mgkg
          above_2mgkg_periods.push({ start_time: current_period_start_2mgkg, end_time: nil })
        end
        if was_above_3_5mgkg && current_period_start_3_5mgkg
          above_3_5mgkg_periods.push({ start_time: current_period_start_3_5mgkg, end_time: nil })
        end

        {
          max_concentration: max_concentration,
          above_2mgkg_periods: above_2mgkg_periods,
          above_3_5mgkg_periods: above_3_5mgkg_periods,
          below_1mgkg: { time: below_1mgkg_time },
          adjusted_half_life: @adjusted_half_life
        }
      end

      # カフェイン摂取を分割し段階的な摂取イベントを生成する
      def self.create_gradual_intake_events(start_time_unix, total_caffeine_mg, interval_minutes: 3, number_of_events: 10)
        events = []
        caffeine_per_event = total_caffeine_mg / number_of_events
        number_of_events.times do |i|
          event_time = start_time_unix + i * interval_minutes * 60
          events.push({ time_unix: event_time, caffeine_mg: caffeine_per_event })
        end
        events
      end

      private

      # ユーザーの年齢に基づいて調整された半減期を計算
      def calculate_adjusted_half_life
        case @user.age
        when 0..20 then 240.0
        when 21..40 then 300.0
        when 41..60 then 360.0
        when 61..75 then 420.0
        else 480.0
        end
      end
    end
  end
end
