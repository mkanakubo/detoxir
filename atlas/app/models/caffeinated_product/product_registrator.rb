# frozen_string_literal: true

class CaffeinatedProduct
  class ProductRegistrator
    def register!(product_params:)
      @product = CaffeinatedProduct.new(product_params)
      if @product.save
        { status: "success", product: @product }
      else
        { status: "error", message: @product.errors.full_messages.join(", ") }
      end
    rescue StandardError => e
      { status: "error", message: e.message }
    end
  end
end
