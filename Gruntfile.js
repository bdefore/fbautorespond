
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  const testFiles = ['test/*.js'];
  const sourceFiles = ['fbautorespond.js', 'lib/**/*.js'];

  grunt.initConfig({
    eslint: {
      target: sourceFiles.concat(testFiles)
    },

    simplemocha: {
      all: {
        src: testFiles
      }
    },

    watch: {
      scripts: {
        files: sourceFiles.concat(testFiles),
        tasks: ['eslint', 'simplemocha'],
        options: {
          spawn: true,
        },
      },
    },
  });

  grunt.registerTask('default', ['eslint', 'simplemocha']);
}
