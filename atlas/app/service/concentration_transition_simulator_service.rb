# frozen_string_literal: true

class ConcentrationTransitionSimulatorService
  def self.call(user, intake_event_history, base_time = Time.now)
    new(user, intake_event_history, base_time).call
  end

  def initialize(user, intake_event_history, base_time = Time.now)
    @user = user
    @intake_event_history = intake_event_history
    @base_time = base_time
  end

  def call
    analysis = analyze_caffeine_concentration(@intake_event_history, @user, @base_time)
    analysis
  end

  private

  # NOTE: 年齢から基礎代謝に基づく半減期を計算するロジック
  def get_adjusted_half_life(user)
    case user.age
    when 0..20 then 240.0
    when 21..40 then 300.0
    when 41..60 then 360.0
    when 61..75 then 420.0
    else 480.0
    end
  end

  # カフェイン濃度を計算
  def calculate_concentration(current_time, intake_event_history, user)
    adjusted_half_life = get_adjusted_half_life(user)
    k = Math.log(2) / adjusted_half_life # NOTE: 除数は調整済み半減期
    ka = 0.05 # NOTE: 吸収速度定数
    f = 1.0 # NOTE: バイオアベイラビリティ

    total_concentration = 0.0
    intake_event_history.each do |event|
      intake_time = Time.at(event[:time_unix])
      if current_time >= intake_time
        elapsed_time = (current_time - intake_time) / 60.0
        concentration_at_t = ((f * ka * event[:caffeine_mg]) / (user.weight_kg * (ka - k))) *
                             (Math.exp(-k * elapsed_time) - Math.exp(-ka * elapsed_time))
        total_concentration += concentration_at_t
      end
    end

    total_concentration
  end

  # 指定した時間後のカフェイン濃度を計算
  def calculate_concentration_after_hours(hours_later, intake_event_history, user, base_time = @base_time)
    target_time = base_time + hours_later * 60 * 60
    calculate_concentration(target_time, intake_event_history, user)
  end

  # カフェイン濃度の重要なポイントを分析する
  def analyze_caffeine_concentration(intake_event_history, user, base_time = @base_time, analysis_hours = 24)
    # 既存のロジック
    now = base_time
    interval_minutes = 1
    max_concentration = { value: 0, time_hours: 0, date_time: now }
    above_2mgkg_periods = []
    above_3_5mgkg_periods = []
    below_1mgkg_time = nil

    # ...（既存の analyze_caffeine_concentration のロジックをここに移植）...
    was_above_2mgkg = false
    current_period_start_2mgkg = nil
    was_above_3_5mgkg = false
    current_period_start_3_5mgkg = nil

    (0..(analysis_hours * 60)).step(interval_minutes) do |minutes|
      hours_later = minutes.to_f / 60
      current_time = now + minutes * 60
      concentration = calculate_concentration_after_hours(hours_later, intake_event_history, user, base_time)

      if concentration > max_concentration[:value]
        max_concentration = {
          value: concentration,
          time_hours: hours_later,
          date_time: current_time
        }
      end

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

      if concentration < 1.0 && below_1mgkg_time.nil? && hours_later > 0.5
        below_1mgkg_time = current_time
      end
    end

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
      below_1mgkg: { time: below_1mgkg_time }
    }
  end

  # 摂取イベントを生成するヘルパーメソッド
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
end
