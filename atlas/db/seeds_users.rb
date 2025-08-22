# テスト用ユーザーデータの作成
User.create!(
  auth0_id: "auth0|test_user_1",
  name: "Test User 1",
  weight_kg: 70.5,
  age: 30
)

User.create!(
  auth0_id: "auth0|test_user_2",
  name: "Test User 2",
  weight_kg: 65.0,
  age: 25
)

puts "Created #{User.count} users"
User.all.each do |user|
  puts "- #{user.name} (#{user.auth0_id})"
end
