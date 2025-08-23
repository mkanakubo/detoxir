json.analysis do |json|
  json.drink_number @drink_number
  json.analysis_hours @analysis_hours
  json.adjusted_half_life_minutes @adjusted_half_life.round(1)
  json.adjusted_half_life_hours (@adjusted_half_life / 60).round(1)

  json.user do |user_json|
    user_json.weight_kg @user.weight_kg
    user_json.age @user.age
    user_json.name @user.name
  end

  json.max_concentration do |max_json|
    max_json.value @analysis[:max_concentration][:value].round(3)
    max_json.time_hours @analysis[:max_concentration][:time_hours].round(2)
    max_json.date_time @analysis[:max_concentration][:date_time].strftime('%Y-%m-%d %H:%M:%S')
  end

  json.thresholds do |thresholds_json|
    # 2mg/kg閾値
    thresholds_json.above_2mgkg do |above_2_json|
      if @analysis[:above_2mgkg_periods].empty?
        above_2_json.status "未到達"
        above_2_json.periods []
      else
        above_2_json.status "到達"
        above_2_json.period_count @analysis[:above_2mgkg_periods].length
        above_2_json.periods @analysis[:above_2mgkg_periods] do |period|
          json.start_time period[:start_time].strftime('%Y-%m-%d %H:%M:%S')
          if period[:end_time]
            json.end_time period[:end_time].strftime('%Y-%m-%d %H:%M:%S')
            duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
            json.duration_hours (duration_minutes / 60)
            json.duration_minutes (duration_minutes % 60)
            json.ongoing false
          else
            json.end_time nil
            json.ongoing true
            json.note "分析期間中は継続"
          end
        end
      end
    end

    # 3.5mg/kg警戒域
    thresholds_json.above_3_5mgkg do |above_3_5_json|
      if @analysis[:above_3_5mgkg_periods].empty?
        above_3_5_json.status "未到達"
        above_3_5_json.warning false
        above_3_5_json.periods []
      else
        above_3_5_json.status "⚠️ 警戒域到達"
        above_3_5_json.warning true
        above_3_5_json.period_count @analysis[:above_3_5mgkg_periods].length
        above_3_5_json.risk_note "3.5mg/kg以上は副作用リスクが高い領域です"
        above_3_5_json.periods @analysis[:above_3_5mgkg_periods] do |period|
          json.start_time period[:start_time].strftime('%Y-%m-%d %H:%M:%S')
          if period[:end_time]
            json.end_time period[:end_time].strftime('%Y-%m-%d %H:%M:%S')
            duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
            json.duration_hours (duration_minutes / 60)
            json.duration_minutes (duration_minutes % 60)
            json.ongoing false
          else
            json.end_time nil
            json.ongoing true
            json.note "分析期間中は継続"
          end
        end
      end
    end

    # 1mg/kg閾値
    thresholds_json.below_1mgkg do |below_1_json|
      if @analysis[:below_1mgkg][:time]
        below_1_json.status "到達"
        below_1_json.time @analysis[:below_1mgkg][:time].strftime('%Y-%m-%d %H:%M:%S')
      else
        below_1_json.status "未到達"
        below_1_json.note "分析期間中は1mg/kg以上を維持"
      end
    end
  end
end
