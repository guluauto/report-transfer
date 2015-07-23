/**
 * 报告数据迁移
 *
 * @author Kane
 * @email yunhua.xiao@guluauto.com
 *
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path');
var fs = require('fs');
var shell = require('shelljs');

var Transfer = (function () {
  function Transfer(source_dir, target_dir) {
    _classCallCheck(this, Transfer);

    this.source_dir = source_dir;
    this.target_dir = target_dir;
  }

  _createClass(Transfer, [{
    key: 'run',
    value: function run() {
      this.copy();
      this.process();
      this.rename();
    }
  }, {
    key: 'jsonfiles',
    value: function jsonfiles() {
      return fs.readdirSync(this.target_dir);
    }
  }, {
    key: 'copy',
    value: function copy() {
      shell.exec('cp -rf ' + path.join(this.source_dir, './*') + ' ' + this.target_dir);
    }
  }, {
    key: 'process',
    value: function process() {
      var _this = this;

      this._jsonfiles = this.jsonfiles();

      this._jsonfiles.forEach(function (filename) {
        var file_path = path.resolve(path.join(_this.target_dir, filename));
        var report = require(file_path);

        report.test = true;

        fs.writeFileSync(file_path, JSON.stringify(report));
      });
    }
  }, {
    key: 'rename',
    value: function rename() {
      var _this2 = this;

      this._jsonfiles.forEach(function (filename) {
        var ERR_SUFFIX = '_err';
        var PHOTO_SUFFIX = '_photo';

        if (filename.indexOf(ERR_SUFFIX) !== -1) {
          var n_filename = filename.replace(ERR_SUFFIX, PHOTO_SUFFIX);
          var o_file_path = path.join(_this2.target_dir, filename);
          var n_file_path = path.join(_this2.target_dir, n_filename);

          fs.renameSync(o_file_path, n_file_path);
        }
      });
    }
  }]);

  return Transfer;
})();

module.exports = Transfer;