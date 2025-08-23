json.status data[:status]

json.user do
  json.id data[:user][:id]
  json.name data[:user][:name]
  json.weight_kg data[:user][:weight_kg]
  json.age data[:user][:age]
end

json.timeline_parameters do
  json.analysis_hours data[:timeline_parameters][:analysis_hours]
  json.interval_minutes data[:timeline_parameters][:interval_minutes]
  json.start_time data[:timeline_parameters][:start_time]
  json.data_points data[:timeline_parameters][:data_points]
end

json.intake_history data[:intake_history] do |event|
  json.time_unix event[:time_unix]
  json.time_iso event[:time_iso]
  json.caffeine_mg event[:caffeine_mg]
end

json.timeline data[:timeline] do |point|
  json.time_unix point[:time_unix]
  json.time_iso point[:time_iso]
  json.hours_elapsed point[:hours_elapsed]
  json.concentration_mg_per_kg point[:concentration_mg_per_kg]
  json.concentration_level point[:concentration_level]
end
