require([
    'dojo/dom-construct',

    'esri/core/watchUtils',
    'esri/geometry/Point',
    'esri/Graphic',
    'esri/Map',
    'esri/views/MapView',

    'sherlock/Sherlock'
], function (
    domConstruct,

    watchUtils,
    Point,
    Graphic,
    Map,
    MapView,

    WidgetUnderTest
) {
    describe('sherlock/Sherlock', function () {
        var widget;
        var mapView;
        var feature = new Graphic({
            geometry: new Point({
                x: -12403622.5754,
                y: 4566845.492200002,
                spatialReference: {wkid: 3857}
            })
        });
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function (done) {
            mapView = new MapView({
                map: new Map({basemap: 'streets'}),
                container: domConstruct.create('div', null, document.body)
            });

            mapView.then(function () {
                widget = new WidgetUnderTest({
                    mapView: mapView
                }, domConstruct.create('div', null, document.body));

                done();
            });
        });

        afterEach(function (done) {
            // mapView.destroy needs some extra help...
            // https://thespatialcommunity.slack.com/archives/C0A6GD4T0/p1494006356289273
            mapView.allLayerViews.destroy();
            mapView.layerViewManager.empty();
            mapView.ui.empty();
            mapView.container.remove();
            setTimeout(function () {
                mapView.destroy();
                mapView = null;
                done();
            }, 0);

            if (widget) {
                destroy(widget);
            }
        });

        describe('constructor', function () {
            it('creates a valid widget', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('_setUpGraphicsLayer', function () {
            it('can preserve the graphics on map navigation', function (done) {
                widget.preserveGraphics = true;

                widget._zoom([feature]).then(function () {
                    mapView.zoom = mapView.zoom + 1;

                    expect(mapView.graphics.items.length).toBe(1);

                    done();
                });
            });
            it('can accept a graphicsLayer instead of creating a new one', function () {
                var layer = {};
                destroy(widget);

                widget = new WidgetUnderTest({
                    mapView: mapView,
                    graphicsLayer: layer
                });

                expect(widget.graphicsLayer).toBe(layer);
            });
        });
        describe('_zoom', function () {
            it('fires zoomed event', function () {
                var spy = jasmine.createSpy('zoomedCallback');
                widget.on('zoomed', spy);

                widget._zoom([feature]);

                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
