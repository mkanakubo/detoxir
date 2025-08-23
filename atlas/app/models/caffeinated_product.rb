class CaffeinatedProduct < ApplicationRecord
  validates :jan_code, presence: true, uniqueness: true, length: { maximum: 13 }
  validates :name, presence: true
  validates :caffeine_amount_mg, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
