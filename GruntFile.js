module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = ['_src/**/*.js', 'tests/_spec/*.js', 'dojoConfig.js', 'GruntFile.js'];
    var bumpFiles = [
        'package.json',
        'package-lock.json'
    ];
    grunt.initConfig({
        amdcheck: {
            main: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [{ src: jsFiles }]
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['env'],
                plugins: ['transform-remove-strict-mode']
            },
            src: {
                files: [{
                    expand: true,
                    cwd: '_src',
                    src: ['**/*.js'],
                    dest: './'
                }, {
                    expand: true,
                    cwd: 'tests/_spec',
                    src: ['*.js'],
                    dest: 'tests/spec'
                }]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles,
                push: false
            }
        },
        connect: {
            options: {
                livereload: true,
                port: 8000,
                base: '.'
            },
            jasmine: {},
            open: {
                options: {
                    open: 'http://localhost:8000/_SpecRunner.html'
                }
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        jasmine: {
            main: {
                src: [],
                options: {
                    outfile: '_SpecRunner.html',
                    specs: ['tests/**/Spec*.js'],
                    vendor: [
                        'node_modules/jasmine-favicon-reporter/vendor/favico.js',
                        'node_modules/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'tests/dojoConfig.js',
                        'node_modules/dojo/dojo.js',
                        'tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false
                },
                files: [{
                    expand: true,
                    cwd: '_src/resources',
                    src: ['*.styl'],
                    dest: 'resources',
                    ext: '.css'
                }]
            }
        },
        watch: {
            options: {
                livereload: true
            },
            src: {
                files: [
                    'Gruntfile.js',
                    '_src/**/*.*',
                    'resources/**/*.*',
                    'tests/**/*.*',
                    '!tests/spec/**/*.*'
                ],
                tasks: [
                    'jasmine:main:build',
                    'stylus',
                    'babel',
                    'amdcheck',
                    'eslint'
                ]
            }
        }
    });

    grunt.registerTask('default', [
        'stylus',
        'babel',
        'connect:jasmine',
        'jasmine:main:build',
        'eslint',
        'amdcheck',
        'watch'
    ]);

    grunt.registerTask('launch', [
        'stylus',
        'babel',
        'connect:open',
        'jasmine:main:build',
        'eslint',
        'amdcheck',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'babel',
        'eslint:main',
        'connect:jasmine',
        'jasmine'
    ]);
};
