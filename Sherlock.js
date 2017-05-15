define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-geometry',
    'dojo/dom-style',
    'dojo/keys',
    'dojo/mouse',
    'dojo/on',
    'dojo/query',
    'dojo/text!./templates/Sherlock.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/core/watchUtils',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',

    'spinjs/spin'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    domGeom,
    domStyle,
    keys,
    mouse,
    on,
    query,
    template,
    array,
    declare,
    lang,

    watchUtils,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,

    Spinner
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,

        // _deferred: [private] Dojo.Deferred
        //      Dojo.Deferred for canceling pending requests.
        _deferred: null,

        // _addingGraphic: [private] Boolean
        //      switch to prevent a new graphic from being cleared
        _addingGraphic: true,

        // _isOverTable: Boolean
        //      A switch to help with onBlur callback on search box.
        _isOverTable: false,

        // _timer: Number
        //      A timer to delay the search so that it doesn't fire too
        //      many times when typing quickly.
        _timer: null,

        // _spinTimer: Number
        //      A timer to delay the spinner from showing too soon
        _spinTimer: null,

        // _currentIndex: Integer
        //      The index of the currently selected item in the results.
        _currentIndex: 0,


        // Parameters to constructor

        // mapView: esri.Map
        //      esri.Map reference.
        mapView: null,

        // provider: Object
        //      An object that provides searching functionality.
        //      Found in sherlock/providers
        provider: null,

        // promptMessage: String
        //      The label that shows up in the promptMessage for the text box.
        promptMessage: '',

        // zoomLevel: Integer
        //      The number of cache levels up from the bottom that you want to zoom to.
        zoomLevel: 5,

        // maxResultsToDisplay: Integer
        //      The maximum number of results that will be displayed.
        //      If there are more, no results are displayed.
        maxResultsToDisplay: 20,

        // placeHolder: String
        //     The placeholder text in the text box
        placeHolder: 'Map Search...',

        // symbolFill: esri.symbol (optional)
        //      esri.symbol zoom graphic symbol for polygons.
        symbolFill: null,

        // symbolLine: esri.symbol (optional)
        //     esri.symbol zoom graphic symbol for polylines.
        symbolLine: null,

        // symbolPoint: esri.symbol (optional)
        //      esri.symbol zoom graphic symbol for points.
        symbolPoint: null,

        // graphicsLayer: esri/layers/GraphicsLayer (optional)
        //      If provided, this is the graphics layer that this widget will use.
        //      The widget assumes that if you provide your own graphics layer then
        //      it is already added to the map.
        //      If not, then it will create it's own layer and add it to the map.
        graphicsLayer: null,

        // preserveGraphics: Boolean (optional)
        //      Set to true if you want the graphics to persist after map navigation.
        preserveGraphics: false,

        // appendToBody: Boolean (optional)
        //      When true (default) the matches table is appended to the body element to allow it to overlap all others
        appendToBody: true,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('sherlock.Sherlock:postCreate', arguments);

            this._wireEvents();
            this._setUpGraphicsLayer();

            var opts = {
                lines: 9, // The number of lines to draw
                length: 4, // The length of each line
                width: 3, // The line thickness
                radius: 4, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                color: '#000', // #rgb or #rrggbb or array of colors
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 'auto', // Top position relative to parent in px
                left: 'auto' // Left position relative to parent in px
            };
            this.spinner = new Spinner(opts);
        },
        showSpinner: function () {
            // summary:
            //      sets up and shows the spinner
            console.log('sherlock.Sherlock:showSpinner', arguments);

            domStyle.set(this.searchIconSpan, 'display', 'none');

            if (!this.spinner.el) {
                // only start if it's not already started
                this.spinner.spin(this.spinnerDiv);
            }
        },
        hideSpinner: function () {
            // summary:
            //      hides the spinner and shows the search icon again
            console.log('sherlock.Sherlock:hideSpinner', arguments);

            clearTimeout(this._spinTimer);
            this.spinner.stop();
            domStyle.set(this.searchIconSpan, 'display', 'inline');
        },
        _setUpGraphicsLayer: function () {
            // summary:
            //      Sets up the graphics layer and associated symbols.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_setUpGraphicsLayer', arguments);

            var afterMapLoaded = function () {
                if (!this.graphicsLayer) {
                    this.graphicsLayer = this.mapView.graphics;
                }
            }.bind(this);

            // create new graphics layer and add to map
            this.mapView.then(afterMapLoaded);

            // set up new symbols, if needed
            if (!this.symbolFill) {
                this.symbolFill = new SimpleFillSymbol({
                    style: 'none',
                    outline: {
                        style: 'dash-dot',
                        color: [255, 255, 0],
                        width: 1.5
                    }
                });
            }

            if (!this.symbolLine) {
                this.symbolLine = new SimpleLineSymbol({
                    color: [255, 255, 0],
                    width: 5
                });
            }

            if (!this.symbolPoint) {
                this.symbolPoint = new SimpleMarkerSymbol({
                    color: [255, 255, 0, 0.5],
                    size: 10
                });
            }
        },
        _wireEvents: function () {
            // summary:
            //      Wires events.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_wireEvents', arguments);

            this.own(
                on(this.textBox, 'keyup', lang.hitch(this, this._onTextBoxKeyUp)),
                on(this.textBox, 'blur', lang.hitch(this, function () {
                    // don't hide table if the cursor is over it
                    if (!this._isOverTable) {
                        // hide table
                        this._toggleTable(false);
                    }
                })),
                on(this.textBox, 'focus', lang.hitch(this, function () {
                    if (this.textBox.value.length > 0) {
                        this._startSearchTimer();
                    }
                })),
                on(this.matchesTable, mouse.enter, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = true;

                    // remove any rows selected using arrow keys
                    query('.highlighted-row').removeClass('highlighted-row');

                    // reset current selection
                    this._currentIndex = 0;
                })),
                on(this.matchesTable, mouse.leave, lang.hitch(this, function () {
                    // set switch
                    this._isOverTable = false;

                    // set first row as selected
                    domClass.add(this.matchesList.children[0], 'highlighted-row');
                }))
            );
        },
        _onTextBoxKeyUp: function (evt) {
            // summary:
            //      Handles the text box onKeyUp evt.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_onTextBoxKeyUp', arguments);

            if (evt.keyCode === keys.ENTER) {
                // zoom if there is at least one match
                if (this.matchesList.children.length > 1) {
                    this._setMatch(this.matchesList.children[this._currentIndex]);
                } else {
                    // search
                    this._search(this.textBox.value);
                }
            } else if (evt.keyCode === keys.DOWN_ARROW) {
                this._moveSelection(1);
            } else if (evt.keyCode === keys.UP_ARROW) {
                this._moveSelection(-1);
            } else {
                this._startSearchTimer();
            }
        },
        _startSearchTimer: function () {
            // summary:
            //      Sets a timer before searching so that the search function
            //      isn't called too many times.
            // tags:
            //      private
            // set timer so that it doesn't fire repeatedly during typing
            console.log('sherlock.Sherlock:_startSearchTimer', arguments);

            clearTimeout(this._timer);
            this._timer = setTimeout(lang.hitch(this, function () {
                this._search(this.textBox.value);
            }), 250);
        },
        _moveSelection: function (increment) {
            // summary:
            //      Moves the selected row in the results table based upon
            //      the arrow keys being pressed.
            // increment: Number
            //      The number of rows to move. Positive moves down, negative moves up.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_moveSelection', arguments);

            // exit if there are no matches in table
            if (this.matchesList.children.length < 2) {
                this._startSearchTimer();
                return;
            }

            // remove selected class if any
            domClass.remove(this.matchesList.children[this._currentIndex], 'highlighted-row');

            // increment index
            this._currentIndex = this._currentIndex + increment;

            // prevent out of bounds index
            if (this._currentIndex < 0) {
                this._currentIndex = 0;
            } else if (this._currentIndex > this.matchesList.children.length - 2) {
                this._currentIndex = this.matchesList.children.length - 2;
            }

            // add selected class using new index
            domClass.add(this.matchesList.children[this._currentIndex], 'highlighted-row');
        },
        _search: function (searchString) {
            // summary:
            //      Initiates a search on the provider
            // searchString: String
            //      The string that is used to construct the LIKE query.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_search', arguments);

            // return if not enough characters
            if (searchString.length < 1) {
                this._deleteAllTableRows(this.matchesTable);
                return;
            }

            // delay spinner a bit
            this._spinTimer = setTimeout(lang.hitch(this, this.showSpinner), 250);

            this.provider.cancelPendingRequests();

            this.provider.search(searchString).then(lang.hitch(this, function (results) {
                // clear table
                this._deleteAllTableRows(this.matchesTable);

                this._processResults(results);
            }), lang.hitch(this, function (err) {
                // clear table
                this._deleteAllTableRows(this.matchesTable);

                // swallow errors from cancels
                if (err.message !== 'undefined') {
                    throw new Error('sherlock.Sherlock Provider Error: ' + err.message);
                }

                this.hideSpinner();
            }));
        },
        _processResults: function (features) {
            // summary:
            //      Processes the features returned from the search provider
            // features: Object[]
            // tags:
            //      private
            console.log('sherlock.Sherlock:_processResults', arguments);

            try {
                console.info(features.length + ' search features found.');

                // remove duplicates
                features = this._sortArray(this._removeDuplicateResults(features));

                // get number of unique results
                var num = features.length;
                console.info(num + ' unique results.');

                // return if too many values or no values
                if (num > this.maxResultsToDisplay) {
                    this.showMessage('More than ' + this.maxResultsToDisplay + ' matches found...');
                    this._populateTable(features.slice(0, this.maxResultsToDisplay - 1));
                } else if (num === 0) {
                    this.showMessage('There are no matches.');
                } else {
                    this.hideMessage();

                    this._populateTable(features);
                }
            } catch (e) {
                throw new Error('sherlock.Sherlock_processResults: ' + e.message);
            }

            this.hideSpinner();
        },
        _removeDuplicateResults: function (features) {
            // summary:
            //      Removes duplicates from the set of features.
            // features: Object[]
            //      The array of features that need to be processed.
            // returns: Object[]
            //      The array after it has been processed.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_removeDuplicateResults', arguments);

            var list = [];
            array.forEach(features, function (f) {
                if (array.some(list, function (existingF) {
                    if (existingF.attributes[this.provider.searchField]
                        === f.attributes[this.provider.searchField]) {
                        if (this.provider.contextField) {
                            if (existingF.attributes[this.provider.contextField]
                                === f.attributes[this.provider.contextField]) {
                                return true;
                            }
                        } else {
                            return true; // there is a match
                        }
                    }
                }, this) === false) {
                    // add item
                    list.push(f);
                }
            }, this);

            return list;
        },
        _populateTable: function (features) {
            // summary:
            //      Populates the autocomplete table.
            // features: Object[]
            //      The array of features to populate the table with.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_populateTable', arguments);

            // loop through all features
            array.forEach(features, function (feat) {
                // insert new empty row
                var row = domConstruct.create('li', {
                    'class': 'match'
                }, this.msg, 'before');

                // get match value string and
                // bold the matching letters
                var fString = feat.attributes[this.provider.searchField];
                var sliceIndex = this.textBox.value.length;
                if (!this.provider.contextField) {
                    row.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                } else {
                    // add context field values
                    var matchDiv = domConstruct.create('div', {
                        'class': 'first-cell'
                    }, row);
                    matchDiv.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                    var cntyDiv = domConstruct.create('div', {
                        'class': 'cnty-cell'
                    }, row);
                    cntyDiv.innerHTML = feat.attributes[this.provider.contextField] || '';
                    domConstruct.create('div', {
                        style: 'clear: both;'
                    }, row);
                }

                // wire onclick event
                this.own(on(row, 'click', lang.hitch(this, this._onRowClick)));
            }, this);

            // select first row
            domClass.add(this.matchesList.children[0], 'highlighted-row');

            // show table
            this._toggleTable(true);
        },
        _onRowClick: function (event) {
            // summary:
            //      Handles when someone clicks on the a row in the autocomplete
            //      table.
            // event: Event
            //      The event object.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_onRowClick', arguments);

            this._setMatch(event.currentTarget);
        },
        _setMatch: function (row) {
            // summary:
            //      Sets the passed in row as a match in the text box and
            //      zooms to the feature.
            // row: Object
            //      The row object that you want to set the textbox to.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_setMatch', arguments);

            // clear any old graphics
            this.graphicsLayer.removeAll();

            // clear table
            this._toggleTable(false);

            // clear prompt message
            this.hideMessage();

            // set textbox to full value
            var contextValue;
            if (!this.provider.contextField) {
                this.textBox.value = row.textContent;
            } else {
                // dig deeper when context values are present
                this.textBox.value = row.children[0].textContent;
                contextValue = row.children[1].innerHTML;
            }

            // execute query / canceling any previous query
            this.provider.cancelPendingRequests();

            this.provider.getFeature(this.textBox.value, contextValue)
                .then(function (graphics) {
                    this._zoom(graphics);
                }.bind(this),
                function (err) {
                    // clear table
                    this._deleteAllTableRows(this.matchesTable);

                    // swallow errors from cancels
                    if (err.message !== 'undefined') {
                        throw new Error('sherlock.Sherlock Provider Error: ' + err.message);
                    }

                    this.hideSpinner();
                }.bind(this)
            );
        },
        showMessage: function (msg) {
            // summary:
            //      shows a messages at the top of the matches list
            // msg: String
            console.log('sherlock.Sherlock:showMessage', arguments);

            this.msg.innerHTML = msg;
            domStyle.set(this.msg, 'display', 'block');
            this._toggleTable(true);
        },
        hideMessage: function () {
            // summary:
            //      hids the message at the top of the matches list
            console.log('sherlock.Sherlock:hideMessage', arguments);

            domStyle.set(this.msg, 'display', 'none');
        },
        _zoom: function (graphics) {
            // summary:
            //      Zooms to the passed in graphic(s).
            // graphics: esri.Graphic[]
            //      The esri.Graphic(s) that you want to zoom to.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_zoom', arguments);

            var goToPromise;
            var symbol;

            // check for point feature
            if (graphics[0].geometry.type === 'point') {
                var lod = this.mapView.map.basemap.baseLayers.items[0].tileInfo.lods.length - this.zoomLevel;

                goToPromise = this.mapView.goTo({
                    target: graphics,
                    zoom: lod
                });

                symbol = this.symbolPoint;
            } else {
                // zoom to feature
                goToPromise = this.mapView.goTo(graphics);

                symbol = (graphics[0].geometry.type === 'polyline') ? this.symbolLine : this.symbolFill;
            }

            graphics.forEach(function (graphic) {
                graphic.symbol = symbol;
            });

            goToPromise.then(function () {
                this.graphicsLayer.addMany(graphics);

                if (!this.preserveGraphics) {
                    watchUtils.once(this.mapView, 'extent', function () {
                        this.graphicsLayer.removeAll();
                    }.bind(this));
                }
            }.bind(this));

            this.onZoomed(graphics);

            return goToPromise;
        },
        onZoomed: function () {
            // summary:
            //      Fires after the map has been zoomed to the graphic.
            console.log('sherlock.Sherlock:onZoomed', arguments);
        },
        _deleteAllTableRows: function (table) {
            // summary:
            //      Deletes all of the rows in the table.
            // table: Object
            //      The table that you want to act upon.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_deleteAllTableRows', arguments);

            // delete all rows in table
            query('li.match', this.matchesTable).forEach(domConstruct.destroy);

            // hide table
            domStyle.set(table, 'display', 'none');

            // reset current index
            this._currentIndex = 0;
        },
        _toggleTable: function (show) {
            // summary:
            //      Toggles the visibility of the autocomplete table.
            // show: Boolean
            //      If true, table is shown. If false, table is hidden.
            // tags:
            //      private
            console.log('sherlock.Sherlock:_toggleTable', arguments);

            if (this.appendToBody) {
                // run this every time the matches table is shown just in
                // case the widget has moved within the flow of the page
                domConstruct.place(this.matchesTable, document.body);
                var textBoxPosition = domGeom.position(this.textBox);
                domStyle.set(this.matchesTable, {
                    top: textBoxPosition.y + textBoxPosition.h + 'px',
                    left: textBoxPosition.x + 'px'
                });
            }

            var displayValue = (show) ? 'block' : 'none';
            domStyle.set(this.matchesTable, 'display', displayValue);
        },
        _sortArray: function (list) {
            // summary:
            //      Sorts the array by both the searchField and contextField
            //      if there is a contextField specied. If no context field is
            //      specified, no sorting is done since it's already done on the server
            //      with the 'ORDER BY' statement. I tried to add a second field to the
            //      'ORDER BY' statement but ArcGIS Server just choked.
            console.log('sherlock.Sherlock:_sortArray', arguments);

            // custom sort function
            var that = this;

            function sortFeatures(a, b) {
                var searchField = that.provider.searchField;
                var contextField = that.provider.contextField;
                if (a.attributes[searchField] === b.attributes[searchField]) {
                    if (a.attributes[contextField] < b.attributes[contextField]) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.attributes[searchField] < b.attributes[searchField]) {
                    return -1;
                } else {
                    return 1;
                }
            }

            // sort features
            return list.sort(sortFeatures);
        }
    });
});
