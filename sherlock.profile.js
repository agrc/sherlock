/* eslint-disable no-undef, no-implicit-globals */
profile = {
    resourceTags: {
        amd: function (filename, mid) {
            return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
        },
        copyOnly: function (filename, mid) {
            return (/^sherlock\/resources\//.test(mid) && !/\.css$/.test(filename));
        },
        miniExclude: function (filename, mid) {
            return (/node_modules/.test(mid) ||
                /node_modules/.test(mid) ||
                /GruntFile.js/.test(filename) ||
                /tests/.test(mid) ||
                /_src/.test(mid)
            );
        }
    }
};
