class UsersController < ApplicationController

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    if @user.save
      session[:user_id] = @user.id
      redirect_to hikes_path, notice: "Welcome to the trails, #{@user.name}!"
    else
      render :new
    end
  end

  def show
    @user = User.find(params[:id])
  end

  protected

  def user_params
    params.require(:user).permit(:email, :name, :password, :password_confirmation)
  end

end