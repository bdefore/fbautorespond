
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    eslint: {
      target: ['fbautorespond.js']
    },

    watch: {
      scripts: {
        files: ['fbautorespond.js'],
        tasks: ['eslint'],
        options: {
          spawn: false,
        },
      },
    },
  });

  grunt.registerTask('default', ['eslint']);
}
