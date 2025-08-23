# frozen_string_literal: true

class Api::V1::UsersController < ApplicationController
  before_action :set_user, only: [ :update, :destroy ]

  def index
    @users = User.all
  end

  def show
    @user = User.find_by(auth0_id: params[:auth0_id])
    unless @user
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render :show, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      render :show
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:auth0_id, :name, :weight_kg, :age)
  end
end
