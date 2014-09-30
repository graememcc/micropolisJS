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
          {src: ['about.html'], dest: 'dist/'},
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
    },

    watch: {
      files: ['index.html', 'about.html', 'css/*', 'sprites/*', 'thirdparty/*', 'images/*', 'js/*', 'COPYING', 'LICENSE'],
      tasks: ['copy', 'requirejs']
    }
  });


  tasks = ['copy', 'requirejs', 'watch'];
  tasks.forEach(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });


  grunt.registerTask('init', ['requirejs', 'copy']);
  grunt.registerTask('build', ['init']);
  grunt.registerTask('default', ['watch']);
};
