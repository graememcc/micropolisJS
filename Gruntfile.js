module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'css', src: '**/*', dest: 'dist/css'},
          {expand: true, cwd: 'images', src: '**/*', dest: 'dist/images'},
          {expand: true, cwd: 'sprites', src: '**/*', dest: 'dist/sprites'},
          {expand: true, cwd: 'thirdparty', src: '**/*', dest: 'dist/thirdparty'},
          {src: ['js/polyfills.js'], dest: 'dist/'},
          {src: ['COPYING'], dest: 'dist/'},
          {src: ['LICENSE'], dest: 'dist/'},
          {src: ['about.html'], dest: 'dist/'},
          {src: ['index.html'], dest: 'dist/'}
        ]
      }
    },

    connect: {
      developmentServer: {
        options: {
          base: 'dist',
          port: 8000,
          hostname: 'localhost',
          livereload: 35729
        }
      }
    },

    jshint: {
      options: {
        newcap: false
      },
      src: ['js/**/*.js']
    },

    revision: {
      options: {
        property: 'meta.revision',
        ref: 'HEAD',
        short: true
      }
    },

    replace: {
      buildId: {
        src: ['dist/*.html'],
        overwrite: true,
        replacements: [{
          from: /BUILDID/,
          to: "<%= meta.revision %>"
        }]
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'js/',
          name: 'Main',
          out: 'dist/js/Main.js',
          useStrict: true
        }
      }
    },

    watch: {
      options: {
        livereload: '<%= connect.developmentServer.options.livereload %>'
      },
      files: ['index.html', 'about.html', 'css/*', 'sprites/*', 'thirdparty/*', 'images/*', 'js/*', 'COPYING', 'LICENSE'],
      tasks: ['build']
    }
  });


  grunt.registerTask('build', ['jshint', 'requirejs', 'copy', 'revision', 'replace']);
  grunt.registerTask('default', ['build', 'connect:developmentServer', 'watch']);
};
