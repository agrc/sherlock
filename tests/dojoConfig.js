/* global JasmineFaviconReporter, jasmineRequire */
window.dojoConfig = {
    baseUrl: '../bower_components',
    packages: [
        'agrc',
        'dojo',
        'dijit',
        'dojox',
        'esri',
        'spinjs',
        {
            name: 'sherlock',
            location: '../'
        }, {
            name: 'stubmodule',
            main: 'stub-module'
        }
    ],
    has: {'dojo-undef-api': true}
};

try {
    // for jasmine-favicon-reporter
    jasmine.getEnv().addReporter(new JasmineFaviconReporter());
    jasmine.getEnv().addReporter(new jasmineRequire.JSReporter2());
} catch (er) {
    // do nothing for stand-alone test page
}
