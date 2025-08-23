json.status data[:status]

json.parameters do
  json.start_time data[:parameters][:start_time]
  json.total_caffeine_mg data[:parameters][:total_caffeine_mg]
  json.interval_minutes data[:parameters][:interval_minutes]
  json.number_of_events data[:parameters][:number_of_events]
end

json.events data[:events] do |event|
  json.time_unix event[:time_unix]
  json.time_iso event[:time_iso]
  json.caffeine_mg event[:caffeine_mg]
end
