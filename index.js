var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    fs = require('fs'),
    PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-inlinecontent';

function escape(str) {
    return str
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
};

function gulpInlineContent() {
    var stream = through.obj(function(file, enc, cb) {
        var self = this;
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            var str = file.contents.toString();
            str = str.replace(/\{\{#\s*([^ ]+?)\s*#\}\}/g, function(whole, first) {
                try {
                    var contents = fs.readFileSync(path.join(path.dirname(file.path), first)).toString();
                    contents = escape(contents);
                    return contents;
                } catch (ex) {
                    return whole;
                }
            });
            file.contents = new Buffer(str);
            self.push(file);
            cb();
        }
    });

    return stream;
};

module.exports = gulpInlineContent;