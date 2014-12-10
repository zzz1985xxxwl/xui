// Generated on 2014-11-24 using generator-angular 0.10.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['src/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            compass: {
                files: ['src/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },

            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '{,*/}*.html',
                    'dist/styles/{,*/}*.css',
                    'dist/fonts/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/scripts/xui/*.js'],
                dest: 'src/scripts/xui.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/xui.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static(require('path').resolve(''))
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '/'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'src/scripts/xui/{nav,notify}.js'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'dist'
                    ]
                }]
            },
            server: 'dist'
        },


        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: 'src/styles',
                cssDir: 'dist/styles',
                javascriptsDir: 'src/scripts',
                fontsDir: 'src/fonts'
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/styles/',
                    src: '{,*/}*.css',
                    dest: 'dist/styles/'
                }]
            }
        }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'connect:livereload',
            'watch'
        ]);
    });
};
