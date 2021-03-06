# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

Rails.application.config.assets.precompile += %w( hikes/index.js )
Rails.application.config.assets.precompile += %w( hikes/show.js )
Rails.application.config.assets.precompile += %w( hikes/hikes_search.js )
Rails.application.config.assets.precompile += %w( jquery.tablesorter.js )
Rails.application.config.assets.precompile += %w( hikes/weather.js )
# Rails.application.config.assets.precompile += %w( dataTables.bootstrap.js )
Rails.application.config.assets.precompile += %w( jquery.dataTables.min.js )
Rails.application.config.assets.precompile += %w( jquery.barrating.min.js )
Rails.application.config.assets.precompile += %w( typeahead.bundle.min.js )
Rails.application.config.assets.precompile += %w( reviews/reviews.js )
Rails.application.config.assets.precompile += %w( welcome/index.js )
Rails.application.config.assets.precompile += %w( user_profile.js )
Rails.application.config.assets.precompile += %w( handlebars.js )
Rails.application.config.assets.precompile += %w( hikes/show_ajax.js )
