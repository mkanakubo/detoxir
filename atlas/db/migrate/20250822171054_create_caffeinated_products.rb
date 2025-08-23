class CreateCaffeinatedProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :caffeinated_products do |t|
      t.string :jan_code, limit: 13
      t.string :name
      t.integer :caffeine_amount_mg
      t.string :image, limit: 512

      t.timestamps
    end
    add_index :caffeinated_products, :jan_code, unique: true
  end
end
