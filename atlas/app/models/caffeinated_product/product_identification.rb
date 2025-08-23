# frozen_string_literal: true

class CaffeinatedProduct
  class ProductIdentification
    def identify!(jan_code:)
      @product = CaffeinatedProduct.find_by(jan_code: jan_code)
      if @product.nil?
      end
    rescue StandardError => e
      raise e
    end
  end
end
