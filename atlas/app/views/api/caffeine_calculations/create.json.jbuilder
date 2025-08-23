json.calculation do |json|
  json.user do |user_json|
    user_json.weight_kg @user.weight_kg
    user_json.age @user.age
    user_json.name @user.name
  end

  json.intake_events @intake_events do |event|
    json.time_unix event[:time_unix]
    json.caffeine_mg event[:caffeine_mg]
    json.time_formatted Time.at(event[:time_unix]).strftime('%Y-%m-%d %H:%M:%S')
  end

  json.analysis do |analysis_json|
    # 最大濃度
    analysis_json.max_concentration do |max_json|
      max_json.value @analysis[:max_concentration][:value].round(3)
      max_json.time_hours @analysis[:max_concentration][:time_hours].round(2)
      max_json.date_time @analysis[:max_concentration][:date_time].strftime('%Y-%m-%d %H:%M:%S')
    end

    # 2mg/kg閾値期間
    analysis_json.above_2mgkg_periods @analysis[:above_2mgkg_periods] do |period|
      json.start_time period[:start_time].strftime('%Y-%m-%d %H:%M:%S')
      if period[:end_time]
        json.end_time period[:end_time].strftime('%Y-%m-%d %H:%M:%S')
        duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
        json.duration_hours (duration_minutes / 60)
        json.duration_minutes (duration_minutes % 60)
      else
        json.end_time nil
        json.still_ongoing true
      end
    end

    # 3.5mg/kg警戒域期間
    analysis_json.above_3_5mgkg_periods @analysis[:above_3_5mgkg_periods] do |period|
      json.start_time period[:start_time].strftime('%Y-%m-%d %H:%M:%S')
      if period[:end_time]
        json.end_time period[:end_time].strftime('%Y-%m-%d %H:%M:%S')
        duration_minutes = ((period[:end_time] - period[:start_time]) / 60).round
        json.duration_hours (duration_minutes / 60)
        json.duration_minutes (duration_minutes % 60)
      else
        json.end_time nil
        json.still_ongoing true
      end
    end

    # 1mg/kg閾値
    analysis_json.below_1mgkg do |below_json|
      if @analysis[:below_1mgkg][:time]
        below_json.time @analysis[:below_1mgkg][:time].strftime('%Y-%m-%d %H:%M:%S')
      else
        below_json.time nil
        below_json.note "分析期間中は1mg/kg以上を維持"
      end
    end
  end
end
