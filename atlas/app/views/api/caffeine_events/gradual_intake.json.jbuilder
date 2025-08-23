json.gradual_intake do |json|
  json.start_time @start_time.strftime('%Y-%m-%d %H:%M:%S')
  json.start_time_unix @start_time.to_i
  json.total_caffeine_mg @total_caffeine_mg
  json.events @events do |event|
    json.time_unix event[:time_unix]
    json.caffeine_mg event[:caffeine_mg]
    json.time_formatted Time.at(event[:time_unix]).strftime('%Y-%m-%d %H:%M:%S')
  end
  json.summary do |summary|
    json.total_events @events.length
    json.interval_minutes 3
    json.duration_minutes (@events.length - 1) * 3
    json.completion_time Time.at(@events.last[:time_unix]).strftime('%Y-%m-%d %H:%M:%S')
  end
end
