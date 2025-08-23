# frozen_string_literal: true

class Api::CaffeinatedProductsController < Api::ApplicationController
  before_action :set_caffeinated_product, only: [:show, :update, :destroy]

  def index
    @caffeinated_products = CaffeinatedProduct.all
  end

  def show
  end

  def create
    @caffeinated_product = CaffeinatedProduct.new(caffeinated_product_params)

    if @caffeinated_product.save
    else
      render json: { errors: @caffeinated_product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @caffeinated_product.update(caffeinated_product_params)
    else
      render json: { errors: @caffeinated_product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @caffeinated_product.destroy
    head :no_content
  end

  private

  def set_caffeinated_product
    @caffeinated_product = CaffeinatedProduct.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Caffeinated product not found' }, status: :not_found
  end

  def caffeinated_product_params
    params.require(:caffeinated_product).permit(:jan_code, :name, :caffeine_amount_mg, :image)
  end
end
