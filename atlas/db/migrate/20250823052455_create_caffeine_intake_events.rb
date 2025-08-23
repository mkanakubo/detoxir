class CreateCaffeineIntakeEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :caffeine_intake_events do |t|
      t.integer :user_id
      t.integer :caffeinated_product_id
      t.integer :caffeine_mg
      t.json :compartment_model_transition

      t.timestamps
    end
  end
end
