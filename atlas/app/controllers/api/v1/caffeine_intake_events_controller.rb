# frozen_string_literal: true

class Api::V1::CaffeineIntakeEventsController < ApplicationController
  def show
  end

  def create
    @caffeine_intake_event = CaffeineIntakeEvent.new(caffeine_intake_event_params)
    if @caffeine_intake_event.save
      render :show, status: :created
    else
      render json: { errors: @caffeine_intake_event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def caffeine_intake_event_params
    params.require(:caffeine_intake_event).permit(:user_id, :amount_mg, :consumed_at)
  end
end
