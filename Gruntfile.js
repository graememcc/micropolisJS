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

    jshint: {
      options: {
        newcap: false
      },
      src: ['js/**/*.js']
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
      files: ['index.html', 'about.html', 'css/*', 'sprites/*', 'thirdparty/*', 'images/*', 'js/*', 'COPYING', 'LICENSE'],
      tasks: ['copy', 'requirejs']
    }
  });


  grunt.registerTask('init', ['jshint', 'requirejs', 'copy']);
  grunt.registerTask('build', ['init']);
  grunt.registerTask('default', ['watch']);
};
