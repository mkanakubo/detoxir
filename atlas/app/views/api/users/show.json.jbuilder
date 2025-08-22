json.user do |json|
  json.id @user.id
  json.auth0_id @user.auth0_id
  json.name @user.name
  json.weight_kg @user.weight_kg
  json.age @user.age
  json.created_at @user.created_at
  json.updated_at @user.updated_at
end
