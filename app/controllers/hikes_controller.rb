class HikesController < ApplicationController

  def index
    @hikes = Hike.select(:id,
      :name,
      :distance_in_km,
      :time_in_hours,
      :difficulty,
    )
    respond_to do |format|
      format.html
      format.json {render json: @hikes}
    end
  end


  def nearby

    bounds = {
      max_lat: params[:position]["max_lat"].to_f,
      min_lat: params[:position]["min_lat"].to_f,
      max_lng: params[:position]["max_lng"].to_f,
      min_lng: params[:position]["min_lng"].to_f
    }

    @hikes = Hike.select('
      "hikes".name, 
      "hikes".id, 
      "hikes".distance_in_km, 
      "hikes".time_in_hours, 
      "hikes".difficulty, 
      "hikes".start_lat, 
      "hikes".start_lng, 
      AVG("reviews".rating) AS avg_rating')
    .joins('LEFT OUTER JOIN reviews ON hikes.id = reviews.hike_id')
    .group(' "hikes".name, "hikes".id')
    .having('start_lat >= ? AND start_lat <= ?', bounds[:min_lat], bounds[:max_lat])
    .having('start_lng >= ? AND start_lng <= ?', bounds[:min_lng], bounds[:max_lng])
    
    @hikes = @hikes.difficulty(params[:difficulty]) if params[:difficulty] && params[:difficulty] != ''

    if params[:duration]
      min,max = params[:duration].split('-')
      @hikes = @hikes.duration(min,max)
    end

    @hikes = @hikes.search_name(params[:name]) if params[:name]

    if current_user
      @hikes_completed = current_user.completed_hikes.pluck(:hike_id)
    else
      @hikes_completed = []
    end

    @response = {
      hikes: @hikes,
      completed: @hikes_completed
    }

    respond_to do |format|
      format.json { render json: @response }
    end
  end

  def show
  	@hike = Hike.find(params[:id])
    @review = Review.new
    @hike_json = @hike.to_json.html_safe
    @hike_waypoints = @hike.simplified_waypoints(@hike.waypoints).to_json.html_safe
    @hike_reviews_json = @hike.reviews.to_json.html_safe
    @average_rating_json = @hike.average_rating.to_json.html_safe
  end

  def edit
  	@hike = Hike.find(params[:id])
  end

  def create
  	@hike = Hike.new(hike_params)

		if @hike.save
		  redirect_to hikes_path
		else
		  render :new
		end
  end

	def destroy
	  @hike = Hike.find(params[:id])
	  @hike.destroy
	  redirect_to hikes_path
	end

  def add_hike
    if current_user
      @hike = Hike.find(params[:id])
      current_user.hikes << @hike
    end
  end

	protected

  def hike_params
    params.require(:hike).permit(
      :name, :distance_in_km, :time_in_hours, :difficulty, :description
    )
  end
end
