/*eslint-disable no-unused-vars, no-undef */
profile = {
    resourceTags: {
        amd: function (filename, mid) {
            return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
        },
        copyOnly: function (filename, mid) {
            return (/^sherlock\/resources\//.test(mid) && !/\.css$/.test(filename));
        },
        miniExclude: function (filename, mid) {
            return (/bower_components/.test(mid) || /node_modules/.test(mid) || /GruntFile.js/.test(filename) || /tests/.test(mid));
        }
    }
};
/*eslint-enable no-unused-vars, no-undef */
