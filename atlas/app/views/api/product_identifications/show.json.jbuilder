# frozen_string_literal: true

json.message @product_identification
json.data do
  json.id params[:id]
  json.status "found"
end
json.timestamp Time.current.iso8601
