class User < ApplicationRecord
  validates :auth0_id, presence: true, uniqueness: true

  has_many :caffeine_intake_events
end
