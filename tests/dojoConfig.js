/* global JasmineFaviconReporter */
window.dojoConfig = {
    baseUrl: '../node_modules',
    packages: [
        'dojo',
        'dijit',
        'dojox',
        'moment',
        {
            name: 'spinjs',
            location: 'spin.js'
        }, {
            name: 'esri',
            location: 'arcgis-js-api'
        }, {
            name: 'maquette',
            location: 'maquette',
            main: 'dist/maquette.umd'
        }, {
            name: 'maquette-css-transitions',
            location: 'maquette-css-transitions',
            main: 'dist/maquette-css-transitions.umd'
        }, {
            name: 'maquette-jsx',
            location: 'maquette-jsx',
            main: 'dist/maquette-jsx.umd'
        }, {
            name: 'tslib',
            location: 'tslib',
            main: 'tslib'
        }, {
            name: 'helpers',
            location: '@agrc/helpers'
        }, {
            name: 'sherlock',
            location: '../'
        }, {
            name: 'stubmodule',
            main: 'stub-module'
        }
    ],
    has: { 'dojo-undef-api': true }
};

jasmine.getEnv().addReporter(new JasmineFaviconReporter());
