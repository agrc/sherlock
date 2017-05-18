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

    var jsFiles = ['_src/**/*.js', 'tests/_spec/*.js', 'dojoConfig.js', 'GruntFile.js'];
    var bumpFiles = [
        'package.json',
        'bower.json'
    ];
    var sauceConfig = {
        urls: ['http://127.0.0.1:8000/_SpecRunner.html'],
        tunnelTimeout: 120,
        build: process.env.TRAVIS_JOB_ID,
        browsers: browsers,
        testname: 'travis_' + process.env.TRAVIS_JOB_ID,
        maxRetries: 10,
        maxPollRetries: 10,
        public: 'public',
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
                presets: ['latest'],
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
        'jasmine:main:build',
        'saucelabs-jasmine'
    ]);
};
