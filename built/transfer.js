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

/**
 * @name Transfer
 * @desc 报告数据迁移类
 */

var Transfer = (function () {

  /**
   * @name constructor
   * @desc 构造函数
   * @param {string} source_dir 老数据文件夹
   * @param {string} target_dir 处理后新数据存放文件夹
   */

  function Transfer(source_dir, target_dir) {
    _classCallCheck(this, Transfer);

    this.source_dir = source_dir;
    this.target_dir = target_dir;
  }

  /**
   * @name run
   * @desc 开始迁移
   */

  _createClass(Transfer, [{
    key: 'run',
    value: function run() {
      this.copy();
      this.process();
      this.rename();
    }

    /**
     * @name jsonfiles
     * @desc 获取需要迁移的文件名集合
     * @returns {Array<string>} 返回文件名的数组
     */
  }, {
    key: 'jsonfiles',
    value: function jsonfiles() {
      return fs.readdirSync(this.target_dir);
    }

    /**
     * @name copy
     * @desc 拷贝老数据文件到新数据文件夹
     */
  }, {
    key: 'copy',
    value: function copy() {
      shell.exec('cp -rf ' + path.join(this.source_dir, './*') + ' ' + this.target_dir);
    }

    /**
     * @name process
     * @desc 处理老数据，转换成新数据
     */
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

    /**
     * @name rename
     * @desc 迁移老文件名至新文件名
     */
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

// 待迁移文件名集合