class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :auth0_id
      t.string :name
      t.float :weight_kg
      t.integer :age

      t.timestamps
    end
    add_index :users, :auth0_id, unique: true
  end
end
