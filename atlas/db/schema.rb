# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_08_23_052455) do
  create_table "caffeinated_products", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "jan_code", limit: 13
    t.string "name"
    t.integer "caffeine_amount_mg"
    t.string "image", limit: 512
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jan_code"], name: "index_caffeinated_products_on_jan_code", unique: true
  end

  create_table "caffeine_intake_events", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "user_id"
    t.integer "caffeinated_product_id"
    t.integer "caffeine_mg"
    t.json "compartment_model_transition"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "auth0_id"
    t.string "name"
    t.float "weight_kg"
    t.integer "age"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["auth0_id"], name: "index_users_on_auth0_id", unique: true
  end
end
