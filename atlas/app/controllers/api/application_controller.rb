# frozen_string_literal: true

class Api::ApplicationController < ApplicationController
  before_action :set_default_format
  protect_from_forgery with: :null_session

  private

  def set_default_format
    request.format = :json unless params[:format]
  end
end
