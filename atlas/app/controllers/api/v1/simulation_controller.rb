# frozen_string_literal: true

class Api::V1::SimulationController < ApplicationController
  # 段階的摂取シミュレーション（分割摂取効果の分析）
  # POST /api/v1/simulation/gradual_intake
  def gradual_intake
    user_id = params[:user_id]
    user = User.find(user_id)

    start_time_unix = params[:start_time]&.to_i || Time.current.to_i
    total_caffeine_mg = params[:total_caffeine_mg]&.to_f || 100.0
    interval_minutes = params[:interval_minutes]&.to_i || 3
    number_of_events = params[:number_of_events]&.to_i || 10
    analysis_hours = params[:analysis_hours]&.to_i || 24

    # 段階的摂取イベントを生成
    gradual_events = CaffeineIntakeEvent::Simulation::CompartmentModelAnalyzer
      .create_gradual_intake_events(
        start_time_unix,
        total_caffeine_mg,
        interval_minutes: interval_minutes,
        number_of_events: number_of_events
      )

    # 一気摂取イベント（比較用）
    single_event = [{ time_unix: start_time_unix, caffeine_mg: total_caffeine_mg }]

    # アナライザーのインスタンス作成
    analyzer = CaffeineIntakeEvent::Simulation::CompartmentModelAnalyzer.new(user)

    # それぞれの分析を実行
    gradual_analysis = analyzer.analyze(gradual_events, analysis_hours: analysis_hours, base_time: Time.at(start_time_unix))
    single_analysis = analyzer.analyze(single_event, analysis_hours: analysis_hours, base_time: Time.at(start_time_unix))

    render json: {
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        weight_kg: user.weight_kg,
        age: user.age
      },
      simulation_parameters: {
        total_caffeine_mg: total_caffeine_mg,
        interval_minutes: interval_minutes,
        number_of_events: number_of_events,
        analysis_hours: analysis_hours,
        start_time: Time.at(start_time_unix).iso8601
      },
      gradual_intake: {
        events: gradual_events.map { |e| e.merge(time_iso: Time.at(e[:time_unix]).iso8601) },
        analysis: gradual_analysis
      },
      single_intake: {
        events: single_event.map { |e| e.merge(time_iso: Time.at(e[:time_unix]).iso8601) },
        analysis: single_analysis
      },
      comparison: {
        max_concentration_reduction: single_analysis[:max_concentration][:value] - gradual_analysis[:max_concentration][:value],
        peak_delay_hours: gradual_analysis[:max_concentration][:time_hours] - single_analysis[:max_concentration][:time_hours]
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  # 詳細濃度分析
  # POST /api/v1/simulation/detailed_analysis
  def detailed_analysis
    user_id = params[:user_id]
    user = User.find(user_id)

    intake_history = params[:intake_history] || []
    analysis_hours = params[:analysis_hours]&.to_i || 24
    base_time = params[:base_time] ? Time.at(params[:base_time].to_i) : nil

    # 摂取履歴の形式を統一
    normalized_history = intake_history.map do |event|
      {
        time_unix: event[:time_unix] || event['time_unix'],
        caffeine_mg: event[:caffeine_mg] || event['caffeine_mg']
      }
    end

    analyzer = CaffeineIntakeEvent::Simulation::CompartmentModelAnalyzer.new(user)
    analysis = analyzer.analyze(normalized_history, analysis_hours: analysis_hours, base_time: base_time)

    render json: {
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        weight_kg: user.weight_kg,
        age: user.age
      },
      analysis_parameters: {
        analysis_hours: analysis_hours,
        base_time: base_time&.iso8601,
        intake_events_count: normalized_history.length
      },
      intake_history: normalized_history.map { |e| e.merge(time_iso: Time.at(e[:time_unix]).iso8601) },
      analysis: analysis
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  # 濃度タイムライン生成
  # POST /api/v1/simulation/concentration_timeline
  def concentration_timeline
    user_id = params[:user_id]
    user = User.find(user_id)

    intake_history = params[:intake_history] || []
    analysis_hours = params[:analysis_hours]&.to_i || 24
    interval_minutes = params[:interval_minutes]&.to_i || 15
    base_time = params[:base_time] ? Time.at(params[:base_time].to_i) : nil

    # 摂取履歴の形式を統一
    normalized_history = intake_history.map do |event|
      {
        time_unix: event[:time_unix] || event['time_unix'],
        caffeine_mg: event[:caffeine_mg] || event['caffeine_mg']
      }
    end

    # 基準時刻の設定
    start_time = base_time || Time.at(normalized_history.map { |e| e[:time_unix] }.min)

    analyzer = CaffeineIntakeEvent::Simulation::CompartmentModelAnalyzer.new(user)
    timeline = []

    (0..(analysis_hours * 60)).step(interval_minutes) do |minutes|
      current_time = start_time + minutes * 60
      concentration = analyzer.calculate_concentration(current_time, normalized_history)

      timeline << {
        time_unix: current_time.to_i,
        time_iso: current_time.iso8601,
        hours_elapsed: minutes.to_f / 60,
        concentration_mg_per_kg: concentration.round(4),
        concentration_level: concentration_level(concentration)
      }
    end

    render json: {
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        weight_kg: user.weight_kg,
        age: user.age
      },
      timeline_parameters: {
        analysis_hours: analysis_hours,
        interval_minutes: interval_minutes,
        start_time: start_time.iso8601,
        data_points: timeline.length
      },
      intake_history: normalized_history.map { |e| e.merge(time_iso: Time.at(e[:time_unix]).iso8601) },
      timeline: timeline
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  # カフェイン摂取イベント生成ヘルパー
  # POST /api/v1/simulation/create_intake_events
  def create_intake_events
    start_time_unix = params[:start_time]&.to_i || Time.current.to_i
    total_caffeine_mg = params[:total_caffeine_mg]&.to_f || 100.0
    interval_minutes = params[:interval_minutes]&.to_i || 3
    number_of_events = params[:number_of_events]&.to_i || 10

    events = CaffeineIntakeEvent::Simulation::CompartmentModelAnalyzer
      .create_gradual_intake_events(
        start_time_unix,
        total_caffeine_mg,
        interval_minutes: interval_minutes,
        number_of_events: number_of_events
      )

    render json: {
      status: 'success',
      parameters: {
        start_time: Time.at(start_time_unix).iso8601,
        total_caffeine_mg: total_caffeine_mg,
        interval_minutes: interval_minutes,
        number_of_events: number_of_events
      },
      events: events.map { |e| e.merge(time_iso: Time.at(e[:time_unix]).iso8601) }
    }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  private

  # 濃度レベルの分類
  def concentration_level(concentration)
    case concentration
    when 0...1.0
      'low'
    when 1.0...2.0
      'moderate'
    when 2.0...3.5
      'high'
    when 3.5..Float::INFINITY
      'dangerous'
    else
      'none'
    end
  end
end
