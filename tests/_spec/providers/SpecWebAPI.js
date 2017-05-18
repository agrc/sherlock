require([
    'sherlock/providers/WebAPI'
], function (
    WebAPIProvider
) {
    describe('sherlock/providers/WebAPI', function () {
        var object;
        describe('constructor', function () {
            beforeEach(function () {
                object = new WebAPIProvider();
            });
            it('creates a valid object', function () {
                expect(object).toEqual(jasmine.any(WebAPIProvider));
            });
        });
    });
});
