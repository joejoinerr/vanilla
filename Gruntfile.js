module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({

    // Read packages
    pkg: grunt.file.readJSON("package.json"),

    // LibSass preprocessing
    sass: {
      options: {
        sourceMap: true
      },
      dev: {
        files: {
          "css/main.css": "sass/main.scss"
        },
        options: {
          outputStyle: "expanded"
        }
      },
      dist: {
        files: {
          "css/main.css": "sass/main.scss"
        },
        options: {
          outputStyle: "compressed"
        }
      }
    },

    // CSS linting
    csslint: {
      lint: {
        options: {
          "import": 2,
          "box-model": false,
          "box-sizing": false,
          "unique-headings": false,
          "universal-selector": false
        },
        src: ["css/main.css"]
      }
    },

    // Javascript minification
    uglify: {
      options: {
        mangle: false
      },
      files: {
        "js/dist.min.js": ["js/main.js", "js/plugins.js"]
      }
    },

    // Start server
    connect: {
      server: {
        options: {
          livereload: true
        }
      }
    },

    // Watch and reload compiled stylesheets
    watch: {
      sass: {
        files: "sass/**/*.scss",
        tasks: ["sass:dev"],
      },
      livereload: {
        options: {
          livereload: true,
        },
        files: ["*.html", "css/**/*.css"]
      }
    }

  });

  // Load plugins
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-contrib-csslint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-connect");

  // Run tasks
  grunt.registerTask("default", ["sass:dev", "connect", "watch"]);
  grunt.registerTask("build", ["sass:dist", "uglify"]);
  grunt.registerTask("lint", ["sass:dist", "csslint"]);

};
