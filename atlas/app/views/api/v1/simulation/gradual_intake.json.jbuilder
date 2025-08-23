json.status data[:status]

json.user do
  json.id data[:user][:id]
  json.name data[:user][:name] 
  json.weight_kg data[:user][:weight_kg]
  json.age data[:user][:age]
end

json.simulation_parameters do
  json.total_caffeine_mg data[:simulation_parameters][:total_caffeine_mg]
  json.interval_minutes data[:simulation_parameters][:interval_minutes]
  json.number_of_events data[:simulation_parameters][:number_of_events]
  json.analysis_hours data[:simulation_parameters][:analysis_hours]
  json.start_time data[:simulation_parameters][:start_time]
end

json.gradual_intake do
  json.events data[:gradual_intake][:events] do |event|
    json.time_unix event[:time_unix]
    json.time_iso event[:time_iso]
    json.caffeine_mg event[:caffeine_mg]
  end
  
  json.analysis do
    json.max_concentration do
      json.value data[:gradual_intake][:analysis][:max_concentration][:value]
      json.time_hours data[:gradual_intake][:analysis][:max_concentration][:time_hours]
      json.date_time data[:gradual_intake][:analysis][:max_concentration][:date_time]
    end
    
    json.above_2mgkg_periods data[:gradual_intake][:analysis][:above_2mgkg_periods] do |period|
      json.start_time period[:start_time]
      json.end_time period[:end_time]
    end
    
    json.above_3_5mgkg_periods data[:gradual_intake][:analysis][:above_3_5mgkg_periods] do |period|
      json.start_time period[:start_time]
      json.end_time period[:end_time]
    end
    
    json.below_1mgkg do
      json.time data[:gradual_intake][:analysis][:below_1mgkg][:time]
    end
    
    json.adjusted_half_life data[:gradual_intake][:analysis][:adjusted_half_life]
  end
end

json.single_intake do
  json.events data[:single_intake][:events] do |event|
    json.time_unix event[:time_unix]
    json.time_iso event[:time_iso]
    json.caffeine_mg event[:caffeine_mg]
  end
  
  json.analysis do
    json.max_concentration do
      json.value data[:single_intake][:analysis][:max_concentration][:value]
      json.time_hours data[:single_intake][:analysis][:max_concentration][:time_hours]
      json.date_time data[:single_intake][:analysis][:max_concentration][:date_time]
    end
    
    json.above_2mgkg_periods data[:single_intake][:analysis][:above_2mgkg_periods] do |period|
      json.start_time period[:start_time]
      json.end_time period[:end_time]
    end
    
    json.above_3_5mgkg_periods data[:single_intake][:analysis][:above_3_5mgkg_periods] do |period|
      json.start_time period[:start_time]
      json.end_time period[:end_time]
    end
    
    json.below_1mgkg do
      json.time data[:single_intake][:analysis][:below_1mgkg][:time]
    end
    
    json.adjusted_half_life data[:single_intake][:analysis][:adjusted_half_life]
  end
end

json.comparison do
  json.max_concentration_reduction data[:comparison][:max_concentration_reduction]
  json.peak_delay_hours data[:comparison][:peak_delay_hours]
end
