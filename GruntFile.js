var osx = 'OS X 10.10';
var windows = 'Windows 8.1';
var browsers = [{
    browserName: 'safari',
    platform: osx
}, {
    browserName: 'firefox',
    platform: windows
}, {
    browserName: 'chrome',
    platform: windows
}, {
    browserName: 'internet explorer',
    platform: windows,
    version: '11'
}, {
    browserName: 'internet explorer',
    platform: 'Windows 8',
    version: '10'
}, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
}];

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jasminePort = grunt.option('jasminePort') || 8001;
    var docPort = grunt.option('docPort') || jasminePort - 1;
    var testHost = 'http://localhost:' + jasminePort;
    var docHost = 'http:/localhost:' + docPort;
    var jsFiles = ['!bower_components', '!node_modules', '!.git', '!.grunt', '*.js', 'tests/**/*.js'];
    var otherFiles = ['templates/*.html', 'tests/*.html'];
    var bumpFiles = [
        'package.json',
        'bower.json'
    ];
    var sauceConfig = {
        urls: ['http://127.0.0.1:8001/tests/_SpecRunner.html'],
        tunnelTimeout: 120,
        build: process.env.TRAVIS_JOB_ID,
        browsers: browsers,
        testname: 'travis_' + process.env.TRAVIS_JOB_ID,
        maxRetries: 10,
        maxPollRetries: 10,
        'public': 'public',
        throttled: 5,
        sauceConfig: {
            'max-duration': 1800
        },
        statusCheckAttempts: 500
    };
    try {
        var secrets = grunt.file.readJSON('secrets.json');
        sauceConfig.username = secrets.sauce_name;
        sauceConfig.key = secrets.sauce_key;
        sauceConfig.testname = 'local';
    } catch (e) {
        // swallow for build server
    }
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        amdcheck: {
            main: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [{
                    src: 'Sherlock.js'
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
                port: jasminePort,
                base: '.'
            },
            docs: {
                options: {
                    port: docPort,
                    open: docHost + '/doc'
                }
            },
            open: {
                options: {
                    open: testHost + '/tests/_SpecRunner.html'
                }
            },
            jasmine: { }
        },
        documentation: {
            Sherlock: {
                files: [{
                    src: 'Sherlock.js'
                }],
                options: {
                    github: true,
                    format: 'md',
                    filename: './doc/Sherlock.md'
                }
            },
            SherlockHtml: {
                files: [{
                    src: 'Sherlock.js'
                }],
                options: {
                    destination: './doc'
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
                    outfile: 'tests/_SpecRunner.html',
                    specs: ['tests/**/Spec*.js'],
                    vendor: [
                        'bower_components/jasmine-favicon-reporter/vendor/favico.js',
                        'bower_components/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'bower_components/jasmine-jsreporter/jasmine-jsreporter.js',
                        '../tests/dojoConfig.js',
                        'bower_components/dojo/dojo.js',
                        '../tests/jasmineAMDErrorChecking.js',
                        '../tests/jsReporterSanitizer.js'
                    ],
                    host: testHost
                }
            }
        },
        'saucelabs-jasmine': {
            all: {
                options: sauceConfig
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false
                },
                files: [{
                    expand: true,
                    cwd: './',
                    src: ['resources/*.styl'],
                    dest: './',
                    ext: '.css'
                }]
            }
        },
        watch: {
            options: {
                livereload: true
            },
            src: {
                files: jsFiles.concat(otherFiles).concat('resources/*.styl'),
                tasks: ['amdcheck', 'newer:eslint:main', 'jasmine:main:build', 'stylus']
            },
            docs: {
                files: 'Sherlock.js',
                tasks: ['documentation']
            }
        }
    });

    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint:main',
        'amdcheck:main',
        'connect:jasmine',
        'stylus',
        'watch:src'
    ]);

    grunt.registerTask('launch', [
        'jasmine:main:build',
        'eslint:main',
        'amdcheck:main',
        'connect:open',
        'stylus',
        'watch:src'
    ]);

    grunt.registerTask('docs', [
        'documentation:Sherlock',
        'watch:docs'
    ]);

    grunt.registerTask('travis', [
        'eslint:main',
        'connect:jasmine',
        'jasmine:main:build',
        'saucelabs-jasmine'
    ]);
};
