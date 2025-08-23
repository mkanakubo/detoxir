# frozen_string_literal: true

class Api::IdentificationResourcesController < Api::ApplicationController
  def create
    user = {
      weight_kg: params[:weight_kg],
      age_years: params[:age_years],
      gene_type: params[:gene_type],
      is_smoker: params[:is_smoker],
      is_on_meds: params[:is_on_meds]
    }

    # カフェイン摂取履歴を取得
    intake_history = params[:intake_history] || []

    # CaffeineCalculatorを使用してカフェイン濃度を計算
    calculator = CaffeineCalculator.new
    concentration = calculator.calculate_concentration(Time.now, intake_history, user)

    render json: { concentration: concentration }
  end
end
