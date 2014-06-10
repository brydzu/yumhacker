class Api::ListingsController < ApplicationController
  before_filter :authenticate_user!, :only => [:create]
  before_filter :authorize, :only => [:create]

  def index
    page = params[:page] || 1
    per = params[:per] || 10
    @listings = List.find(params[:list_id]).listings.order('created_at ASC').page(page).per(per)
  end
  
  def create
    establishment_id = params[:establishment_id]
    @listing = @list.listings.new(establishment_id: establishment_id, user_id: current_user.id)

    current_user.endorse!(establishment_id) unless current_user.endorsing?(establishment_id) || @list.type == 'WishList'
   
    begin 
      @list.save

      if params[:comment] && !params[:comment].blank?
        @listing.comments.new(body: params[:comment], user_id: current_user.id) 
        @listing.save 
      end
    rescue
      render nothing: true, status: 409
    end
  end

  def destroy
    @listing = Listing.find(params[:id])
    establishment = @listing.establishment

    if current_user.list_ids.include?(@listing.list_id)
      if current_user.listings.where({ establishment_id: establishment.id }).count == 1
        current_user.unendorse!(@listing.establishment) if current_user.endorsing?(@listing.establishment)      
      end

      @listing.destroy 
    end

    render nothing: true, status: 200
  end

  def update
    photo_id = params[:photo_id]
    listing = Listing.find(params[:id])
    imageable = listing.imageables.first

    imageable ||= listing.imageables.new
    imageable.photo_id = photo_id

    if imageable.save
      render nothing: true, status: 201
    else
      render nothing: true, status: 500
    end
  end

  private

    def authorize
      if params[:list_id]
        @list = List.find(params[:list_id])
      elsif params[:wish_list]
        @list = current_user.lists.where(wish_list: true).first
      end
      render nothing: true, status: 401 and return unless @list.user == current_user || current_user.admin?
    end
end
