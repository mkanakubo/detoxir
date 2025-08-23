# frozen_string_literal: true

class Api::V1::CaffeinatedProductsController < ApplicationController
  before_action :set_caffeinated_product, only: [:show, :update, :destroy]

  def index
    @caffeinated_products = CaffeinatedProduct.all
    render json: {
      status: "success",
      products: @caffeinated_products,
      count: @caffeinated_products.count
    }
  end

  def show
    render json: {
      status: "success",
      product: @caffeinated_product,
      caffeine_amount: @caffeinated_product.caffeine_amount_mg
    }
  end

  # JANコードから商品を検索（見つからない場合は自動登録）
  def find_by_jan_code
    jan_code = params[:jan_code]
    
    if jan_code.blank?
      render json: { error: 'JANコードが指定されていません' }, status: :bad_request
      return
    end

    # 既存の商品を検索
    @caffeinated_product = CaffeinatedProduct.find_by(jan_code: jan_code)
    
    if @caffeinated_product
      # 既存商品が見つかった場合
      render json: {
        status: "success",
        message: "Product found",
        product: @caffeinated_product,
        caffeine_amount: @caffeinated_product.caffeine_amount_mg
      }
    else
      # 見つからない場合は自動登録を試行
      auto_registrar = ProductAutoRegistrar.new
      registration_result = auto_registrar.register_from_jan_code(jan_code)
      
      if registration_result[:success]
        @caffeinated_product = registration_result[:product]
        render json: {
          caffeinated_product: {
            id: @caffeinated_product.id,
            jan_code: @caffeinated_product.jan_code,
            name: @caffeinated_product.name,
            caffeine_amount_mg: @caffeinated_product.caffeine_amount_mg,
            image: @caffeinated_product.image,
            created_at: @caffeinated_product.created_at,
            updated_at: @caffeinated_product.updated_at
          },
          auto_registered: true,
          data_source: 'jancode_xyz',
          caffeine_info: registration_result[:caffeine_info],
          message: registration_result[:caffeine_info][:is_estimated] ? 
                   '商品を自動登録しました。カフェイン量は推定値です。' : 
                   '商品を自動登録しました。カフェイン量は商品情報から抽出しました。'
        }, status: :created
      else
        render json: {
          error: registration_result[:error],
          jan_code: jan_code,
          details: registration_result
        }, status: :not_found
      end
    end
  end

  def create
    @caffeinated_product = CaffeinatedProduct.new(caffeinated_product_params)

    if @caffeinated_product.save
      render json: {
        status: "success",
        product: @caffeinated_product,
        caffeine_amount: @caffeinated_product.caffeine_amount_mg
      }, status: :created
    else
      render json: { errors: @caffeinated_product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @caffeinated_product.update(caffeinated_product_params)
      render json: {
        status: "success",
        product: @caffeinated_product,
        caffeine_amount: @caffeinated_product.caffeine_amount_mg
      }, status: :created
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
