module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'css', src: '**/*', dest: 'dist/css'},
          {expand: true, cwd: 'images', src: '**/*', dest: 'dist/images'},
          {expand: true, cwd: 'sprites', src: '**/*', dest: 'dist/sprites'},
          {expand: true, cwd: 'thirdparty', src: '**/*', dest: 'dist/thirdparty'},
          {src: ['COPYING'], dest: 'dist/'},
          {src: ['LICENSE'], dest: 'dist/'},
          {src: ['index.html'], dest: 'dist/'}
        ]
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'js/',
          name: 'Main',
          out: 'dist/js/Main.js'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['requirejs', 'copy']);
};
