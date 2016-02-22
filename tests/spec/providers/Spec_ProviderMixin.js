require([
    'sherlock/providers/_ProviderMixin'
], function (
    _ProviderMixin
) {
    describe('sherlock/providers/_ProviderMixin', function () {
        var testObject;
        beforeEach(function () {
            testObject = new _ProviderMixin();
        });
        describe('_getOutFields', function () {
            it('adds the search and context fields if needed', function () {
                var result = testObject._getOutFields(['a', 'b'], 'c', 'd');
                expect(result).toEqual(['a', 'b', 'c', 'd']);

                result = testObject._getOutFields(['a', 'b', 'c'], 'c', 'd');
                expect(result).toEqual(['a', 'b', 'c', 'd']);

                result = testObject._getOutFields(null, 'a', 'b');
                expect(result).toEqual(['a', 'b']);

                result = testObject._getOutFields(['a', 'b'], 'c');
                expect(result).toEqual(['a', 'b', 'c']);
            });
            it('doesn\'t add any other fields if [\'*\'] is passed', function () {
                var result = testObject._getOutFields(['*'], 'c', 'd');
                expect(result).toEqual(['*']);
            });
        });
        describe('_getSearchClause', function () {
            it('formats the clause appropriately', function () {
                testObject.searchField = 'FieldName';
                var result = testObject._getSearchClause('hello');

                expect(result).toBe('UPPER(FieldName) LIKE UPPER(\'hello%\')');
            });
        });
        describe('_getFeatureClause', function () {
            it('formats the clause appropriately', function () {
                testObject.searchField = 'FN';
                var result = testObject._getFeatureClause('V');

                expect(result).toBe('FN = \'V\'');

                testObject.contextField = 'CF';
                var result = testObject._getFeatureClause('V', 'CV');

                expect(result).toBe('FN = \'V\' AND CF = \'CV\'');

                var result = testObject._getFeatureClause('V', null);

                expect(result).toBe('FN = \'V\' AND CF IS NULL');
            });
        });
    });
});
