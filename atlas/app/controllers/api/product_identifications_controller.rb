# frozen_string_literal: true

class Api::ProductIdentificationsController < ActionController::API
  before_action :set_default_format

  def index
    @product_identifications = "Product identifications list"
    # 将来的にはここでデータベースからデータを取得
    # @product_identifications = ProductIdentification.all
  end

  def show
    @product_identification = "Product identification for ID: #{params[:id]}"
    # 将来的にはここでデータベースから特定のデータを取得
    # @product_identification = ProductIdentification.find(params[:id])
  end

  private

  def set_default_format
    request.format = :json unless params[:format]
  end
end
