json.caffeinated_product do |json|
  json.id @caffeinated_product.id
  json.jan_code @caffeinated_product.jan_code
  json.name @caffeinated_product.name
  json.caffeine_amount_mg @caffeinated_product.caffeine_amount_mg
  json.image @caffeinated_product.image
  json.created_at @caffeinated_product.created_at
  json.updated_at @caffeinated_product.updated_at
end
