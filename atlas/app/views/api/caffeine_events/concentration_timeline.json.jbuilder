json.concentration_timeline do |json|
  json.user do |user_json|
    user_json.weight_kg @user.weight_kg
    user_json.age @user.age
    user_json.name @user.name
  end

  json.parameters do |params_json|
    params_json.hours_range @hours_range
    params_json.interval_hours @interval
    params_json.total_points @timeline.length
  end

  json.timeline @timeline do |point|
    json.hours point[:hours]
    json.concentration_mg_kg point[:concentration_mg_kg]
    json.time point[:time]
    
    # 閾値情報を追加
    concentration = point[:concentration_mg_kg]
    json.threshold_status do |status|
      status.above_3_5mg true if concentration >= 3.5
      status.above_2mg true if concentration >= 2.0
      status.above_1mg true if concentration >= 1.0
      status.level case
                   when concentration >= 3.5 then "警戒域"
                   when concentration >= 2.0 then "高濃度"
                   when concentration >= 1.0 then "中濃度"
                   else "低濃度"
                   end
    end
  end

  json.intake_events @intake_history do |event|
    json.time_unix event[:time_unix]
    json.caffeine_mg event[:caffeine_mg]
    json.time_formatted Time.at(event[:time_unix]).strftime('%Y-%m-%d %H:%M:%S')
  end
end
