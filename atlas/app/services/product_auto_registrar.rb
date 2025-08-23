# frozen_string_literal: true

class ProductAutoRegistrar
  def initialize
    @jan_api_client = JanCodeApiClient.new
  end

  # JANコードから商品を自動登録
  def register_from_jan_code(jan_code)
    # 1. 複数のAPIから商品情報を取得
    product_info = @jan_api_client.fetch_product_info(jan_code)
    
    unless product_info
      Rails.logger.warn "Could not fetch product info for JAN code: #{jan_code}"
      return {
        success: false,
        error: 'JAN Code APIから商品情報を取得できませんでした',
        jan_code: jan_code,
        suggestion: '手動で商品情報を登録してください'
      }
    end

    # 2. カフェイン量の取得/推定
    caffeine_amount = product_info[:caffeine_amount_mg] || 0.0
    is_estimated = product_info[:is_estimated] || false

    # 3. 商品をDBに登録
    caffeinated_product = CaffeinatedProduct.new(
      jan_code: product_info[:jan_code],
      name: product_info[:name],
      caffeine_amount_mg: caffeine_amount,
      image: product_info[:image_url]
    )

    if caffeinated_product.save
      Rails.logger.info "Auto-registered product: #{product_info[:name]} (JAN: #{jan_code}, Caffeine: #{caffeine_amount}mg, Source: JAN Code API)"
      
      {
        success: true,
        product: caffeinated_product,
        auto_registered: true,
        data_source: 'jancode_xyz',
        caffeine_info: {
          amount_mg: caffeine_amount,
          is_estimated: is_estimated,
          extraction_method: is_estimated ? 'pattern_estimation' : 'extracted_from_api'
        },
        api_source: product_info.except(:caffeine_amount_mg, :is_estimated, :data_source)
      }
    else
      Rails.logger.error "Failed to save auto-registered product: #{caffeinated_product.errors.full_messages}"
      
      {
        success: false,
        error: '商品の登録に失敗しました',
        validation_errors: caffeinated_product.errors.full_messages,
        product_info: product_info
      }
    end
  rescue StandardError => e
    Rails.logger.error "Error in auto-registration: #{e.message}"
    
    {
      success: false,
      error: "自動登録中にエラーが発生しました: #{e.message}",
      jan_code: jan_code
    }
  end

  private

  # データ取得方法の判定（ログ用）
  def determine_data_source_details(product_info)
    source = product_info[:data_source]
    
    case source
    when 'rakuten_ichiba'
      '楽天市場API'
    when 'yahoo_shopping'
      'Yahoo!ショッピングAPI'
    when 'jancode_xyz'
      'JAN Code API（推定値含む）'
    else
      'Unknown'
    end
  end
end
