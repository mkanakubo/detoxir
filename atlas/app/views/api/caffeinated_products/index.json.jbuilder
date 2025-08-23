json.caffeinated_products @caffeinated_products do |product|
  json.id product.id
  json.jan_code product.jan_code
  json.name product.name
  json.caffeine_amount_mg product.caffeine_amount_mg
  json.image product.image
  json.created_at product.created_at
  json.updated_at product.updated_at
end
