require 'compass/import-once/activate'

# Require any additional compass plugins here.
require "susy"
require "modular-scale"

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "css"
sass_dir = "sass"
images_dir = "img"
javascripts_dir = "js"

# You can select your preferred output style here
environment = :production
output_style = (environment == :production) ? :compressed : :expanded

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true
