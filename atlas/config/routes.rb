Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :product_identifications, only: [ :index, :show ]
      resources :users, except: [:show] do
        collection do
          get 'show', to: 'users#show'
        end
      end
      resources :caffeinated_products do
        collection do
          get 'find_by_jan_code/:jan_code', to: 'caffeinated_products#find_by_jan_code'
        end
      end
      resources :caffeine_calculations, only: [:create]

      # カフェイン計算関連のエンドポイント
      namespace :caffeine_intake_events do
        post :create
        post :analysis
        post :concentration_timeline
      end

      # シミュレーション関連のエンドポイント
      namespace :simulation do
        post :gradual_intake
        post :detailed_analysis
        post :concentration_timeline
        post :create_intake_events
      end
    end
  end

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
