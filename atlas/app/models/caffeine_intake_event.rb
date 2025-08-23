class CaffeineIntakeEvent < ApplicationRecord
  belongs_to :user
  belongs_to :caffeinated_product
end
