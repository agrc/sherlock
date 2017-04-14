define([
    'dojo/Evented',
    'dojo/_base/declare'
], function (
    Evented,
    declare
) {
    return declare([Evented], {
        /**
         * @property {Deferred} _deferred - The deferred returned from the search for the provider
         * @private
         */
        _deferred: null,

        /**
         * Builds the outFields list taking into account the search and context fields
         * @private
         * @param {string[]} outFields
         * @param {string} searchField
         * @param {string} contextField
         */
        _getOutFields: function (outFields, searchField, contextField) {
            console.log('sherlock/providers/_ProviderMixin:_getOutFields', arguments);

            var outFields = outFields || [];

            // don't mess with '*'
            if (outFields[0] === '*') {
                return outFields;
            }

            var addField = function (fld) {
                if (fld && outFields.indexOf(fld) === -1) {
                    outFields.push(fld);
                }
            };
            addField(searchField);
            addField(contextField);

            return outFields;
        },
        /**
         * Gets the query that will return features matching the text
         * @private
         * @param {string} text - The text to search on
         */
        _getSearchClause: function (text) {
            console.log('sherlock.providers._ProviderMixin:_getSearchClause', arguments);

            return 'UPPER(' + this.searchField + ') LIKE UPPER(\'' + text + '%\')';
        },
        /**
         * Gets the query that will return the specific feature matching the values
         * @private
         * @param {string} searchValue
         * @param {string} [contextValue]
         */
        _getFeatureClause: function (searchValue, contextValue) {
            var statement = this.searchField + ' = \'' + searchValue + '\'';
            if (this.contextField) {
                if (contextValue && contextValue.length > 0) {
                    statement += ' AND ' + this.contextField + ' = \'' + contextValue + '\'';
                } else {
                    statement += ' AND ' + this.contextField + ' IS NULL';
                }
            }

            return statement;
        },
        /**
         * Cancel any pending search requests
         */
        cancelPendingRequests: function () {
            console.log('sherlock.providers._ProviderMixin:cancelPendingRequests', arguments);

            if (this._deferred) {
                this._deferred.cancel();
            }
        }
    });
});
