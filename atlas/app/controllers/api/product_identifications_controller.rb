# frozen_string_literal: true

class Api::ProductIdentificationsController < Api::ApplicationController
  def index
    @product_identifications = "Product identifications list"
    # 将来的にはここでデータベースからデータを取得
  end

  def show
    @product_identification = "Product identification for ID: #{params[:id]}"
    # 将来的にはここでデータベースから特定のデータを取得
  end
end
