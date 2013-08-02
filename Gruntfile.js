/*
 * iceCoffee UI
 * https://github.com/CaffeinatedJS/CaffeinatedJS
 *
 * Copyright (c) 2013 "yisiqi" Siqi Yi
 * Licensed under the MIT license.
 * https://github.com/CaffeinatedJS/CaffeinatedJS/blob/master/LICENSE-MIT
 */

'use strict';

var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
	return connect.static(path.resolve(point));
};

module.exports = function(grunt) {

	grunt.initConfig({
		  
		  pkg		: grunt.file.readJSON('package.json')

		, livereload: {
			  port: 35729 // Default livereload listening port.
		  }

		, connect		: {
			  server	: {
			  	  options	: {
			  	  	  port	: 9001
			  	  	, base	: '.'
			  	  }
			  }
			
			//*
			/* Only for development */
			, livereload: {
				  options	: {
				  	  port		: 9001
				  	, hostname	: '*'
				  	, middleware: function(connect, options) {
						  return [lrSnippet, folderMount(connect, options.base)]
					  }
				  }
			  }
			//*/

		  }

		//*
		/* Only for development */
		, regarde	: {
			  caffeinated		: {
				  files	: [
				  	  'src/**/*.js'
				  	, 'src/**/*.css'
				  	, 'src/**/*.html'
				  	, 'test/**/*.js'
				  	, 'test/**/*.css'
				  	, 'test/**/*.html'
				  	, './*.html'
				  ]
				, tasks	: ['livereload']
			  }
		  }
		//*/

		, qunit		: {
			   all	: {
				  options	: {
				  	  urls	: [
						  'http://127.0.0.1:9001/test/caffeinated/index.html'
					  ]
				  }
			   }

		  }

	});

	
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks("grunt-contrib-qunit")
	grunt.loadNpmTasks("grunt-contrib-jshint")
	grunt.loadNpmTasks("grunt-contrib-uglify")

	grunt.registerTask('default', ['connect:server', 'qunit'])
	grunt.registerTask('test', ['qunit'])

	//*
	/* Only for development */
	grunt.loadNpmTasks('grunt-regarde');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.registerTask('watch', ['livereload-start', 'connect:livereload', 'regarde'])
	//*/
}