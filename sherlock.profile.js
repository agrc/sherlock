/*eslint-disable no-unused-vars, no-undef */
profile = {
    resourceTags: {
        amd: function (filename, mid) {
            return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
        },
        copyOnly: function (filename, mid) {
            return (/^sherlock\/resources\//.test(mid) && !/\.css$/.test(filename));
        }
    }
};
/*eslint-enable no-unused-vars, no-undef */
