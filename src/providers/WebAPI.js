define([
    'agrc/modules/WebAPI',

    'dojo/_base/declare',
    'dojo/_base/array',

    'esri/Graphic',

    'sherlock/providers/_ProviderMixin'
], function (
    WebAPI,

    declare,
    array,

    Graphic,

    _ProviderMixin
) {
    return declare([_ProviderMixin], {
        /**
         * @property {string} searchLayer - See constructor parameter
         */
        searchLayer: '',

        /**
         * @property {string} searchField - See constructor parameter
         */
        searchField: '',

        /**
         * @property {string} contextField - See constructor parameter
         */
        contextField: null,

        /**
         * @property {string} outFields - See constructor parameter
         */
        outFields: '',

        /**
         * A provider class for Sherlock that uses AGRC's web api (api.mapserv.utah.gov) to search
         * feature classes within the SGID.
         * @name WebAPI
         * @param {string} apiKey - You api key (obtained from api.mapserv.utah.gov)
         * @param {string} searchLayer - Fully qualified feature class name eg: SGID10.Boundaries.Counties
         * @param {string} searchField - The name of the field that you want the search based on
         * @param options {object}
         * @param {string[]} [options.outFields] - A list of the fields that you want returned from the search.
         * If undefined then the searchField and contextField (if provided) will be used.
         * @param {string} [options.contextField] - A second field to display in the results table to
         * give context to the results in case of duplicate results.
         * @param {number} [options.wkid=3857] - The well known id of the spatial reference that you are working in.
         */
        constructor: function (apiKey, searchLayer, searchField, options) {
            console.log('sherlock.providers.WebAPI:constructor', arguments);

            this.searchLayer = searchLayer;
            this.searchField = searchField;
            if (options) {
                this.wkid = options.wkid;
                this.contextField = options.contextField;
                this.outFields = this._getOutFields(options.outFields, this.searchField, this.contextField);
            }
            this.outFields = this._getOutFields(null, this.searchField, this.contextField);
            this._webApi = new WebAPI({
                apiKey: apiKey
            });
        },
        /**
         * Initiates a search for features
         * @param {string} searchString - The text to search for
         * @returns {Promise} - A promise that resolves with a list of matching features
         */
        search: function (searchString) {
            console.log('sherlock.providers.WebAPI:search', arguments);

            this._deferred = this._webApi.search(this.searchLayer, this.outFields, {
                predicate: this._getSearchClause(searchString),
                spatialReference: this.wkid
            });

            return this._deferred;
        },
        /**
         * Queries for the geometry of a specific feature or select of features matching the search criteria
         * @param {string} searchValue - The value of the data in the search field of the feature that you want
         * @param {string} [contextValue] - The value of the data in the context field of the feature that you want
         * @returns {Promise} - A promise that resolves with a list of matching features
         */
        getFeature: function (searchValue, contextValue) {
            console.log('sherlock.providers.WebAPI:getFeature', arguments);

            this._deferred = this._webApi.search(this.searchLayer, this.outFields.concat('shape@'), {
                predicate: this._getFeatureClause(searchValue, contextValue),
                spatialReference: this.wkid
            }).then(function handleFeatureQuery(features) {
                return array.map(features, function convertGeometryToGraphic(geometry) {
                    return new Graphic(geometry);
                });
            });

            return this._deferred;
        }
    });
});
