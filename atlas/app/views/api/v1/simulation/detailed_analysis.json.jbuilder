json.status data[:status]

json.user do
  json.id data[:user][:id]
  json.name data[:user][:name]
  json.weight_kg data[:user][:weight_kg]
  json.age data[:user][:age]
end

json.analysis_parameters do
  json.analysis_hours data[:analysis_parameters][:analysis_hours]
  json.base_time data[:analysis_parameters][:base_time]
  json.intake_events_count data[:analysis_parameters][:intake_events_count]
end

json.intake_history data[:intake_history] do |event|
  json.time_unix event[:time_unix]
  json.time_iso event[:time_iso]
  json.caffeine_mg event[:caffeine_mg]
end

json.analysis do
  json.max_concentration do
    json.value data[:analysis][:max_concentration][:value]
    json.time_hours data[:analysis][:max_concentration][:time_hours]
    json.date_time data[:analysis][:max_concentration][:date_time]
  end
  
  json.above_2mgkg_periods data[:analysis][:above_2mgkg_periods] do |period|
    json.start_time period[:start_time]
    json.end_time period[:end_time]
  end
  
  json.above_3_5mgkg_periods data[:analysis][:above_3_5mgkg_periods] do |period|
    json.start_time period[:start_time]
    json.end_time period[:end_time]
  end
  
  json.below_1mgkg do
    json.time data[:analysis][:below_1mgkg][:time]
  end
  
  json.adjusted_half_life data[:analysis][:adjusted_half_life]
end
