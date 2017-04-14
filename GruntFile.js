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

    var jsFiles = ['*.js', 'providers/*.js', 'tests/**/*.js'];
    var otherFiles = [
        'src/**/*.html',
        'tests/**/*.html',
        'dojoConfig.js',
        'GruntFile.js'
    ];
    var stylFiles = 'resources/*.styl';
    var bumpFiles = [
        'package.json',
        'bower.json'
    ];
    var sauceConfig = {
        urls: ['http://127.0.0.1:8001/_SpecRunner.html'],
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
                files: [{src: jsFiles}]
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
                        'bower_components/jasmine-favicon-reporter/vendor/favico.js',
                        'bower_components/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'bower_components/jasmine-jsreporter/jasmine-jsreporter.js',
                        'tests/dojoConfig.js',
                        'bower_components/dojo/dojo.js',
                        'tests/jasmineAMDErrorChecking.js',
                        'tests/jsReporterSanitizer.js'
                    ],
                    host: 'http://localhost:8000'
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
                    src: stylFiles,
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
                files: jsFiles.concat(otherFiles).concat(stylFiles),
                tasks: ['amdcheck', 'eslint', 'jasmine:main:build', 'stylus']
            }
        }
    });

    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint',
        'amdcheck',
        'connect:jasmine',
        'stylus',
        'watch'
    ]);

    grunt.registerTask('launch', [
        'jasmine:main:build',
        'eslint',
        'amdcheck',
        'eslint',
        'amdcheck',
        'connect:open',
        'stylus',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'eslint:main',
        'connect:jasmine',
        'jasmine:main:build',
        'saucelabs-jasmine'
    ]);
};
