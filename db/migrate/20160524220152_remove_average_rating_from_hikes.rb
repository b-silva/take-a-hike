class RemoveAverageRatingFromHikes < ActiveRecord::Migration
  def change
  	remove_column :hikes, :average_rating, :integer
  end
end
