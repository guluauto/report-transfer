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
 * @name Item
 * @desc 检测项结果
 */

var Item = function Item(o) {
  _classCallCheck(this, Item);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(o)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var k = _step.value;

      this[k] = o[k];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * @name Processor
 * @desc 数据处理器
 */
;

var Processor = (function () {
  function Processor() {
    _classCallCheck(this, Processor);
  }

  _createClass(Processor, null, [{
    key: 'image',

    /**
     * @name image
     * @desc 单个图片字符串转图片字符串数组
     * @param item
     */
    value: function image(item) {
      var it = new Item(item);
      it.image = [item.image];

      return it;
    }

    /**
     * @name input
     * @desc 普通填写字符串转对象 { input: string }
     * @param input
     */
  }, {
    key: 'input',
    value: function input(_input) {
      return new Item({
        input: _input
      });
    }

    /**
     * @name input_date
     * @desc 日期填写字符串转对象 { input_date: string }
     * @param input_date
     */
  }, {
    key: 'input_date',
    value: function input_date(_input_date) {
      return new Item({
        input_date: _input_date
      });
    }
  }]);

  return Processor;
})()
/**
 * @name Transfer
 * @desc 报告数据迁移类
 */
;

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
      this.rm_cn_4filename();
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
      var files = fs.readdirSync(this.target_dir);
      var OSX = '.DS_Store';

      var i = files.indexOf(OSX);
      if (i !== -1) {
        files.splice(i, 1);
      }

      return files;
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
     *
     */
  }, {
    key: 'rm_cn_4filename',
    value: function rm_cn_4filename() {
      var _this = this;

      var files = this.jsonfiles();

      files.forEach(function (filename) {
        var n_filename = filename.replace(/^[\u4e00-\u9fa5\-0-9]+/g, '');
        var o_file_path = path.join(_this.target_dir, filename);
        var n_file_path = path.join(_this.target_dir, n_filename);

        fs.renameSync(o_file_path, n_file_path);
      });
    }

    /**
     * @name process
     * @desc 处理老数据，转换成新数据
     * @todo
     * 1. image to image Array
     * 2. input field to object { input: xxx }
     * 3. input date field to object { input_date: xxx }
     */
  }, {
    key: 'process',
    value: function process() {
      var _this2 = this;

      this._jsonfiles = this.jsonfiles();
      var DATE_REG = /^\d{4}\-\d{2}\-\d{2}$/;

      this._jsonfiles.forEach(function (filename) {
        console.info(filename);

        var file_path = path.resolve(path.join(_this2.target_dir, filename));
        var report = require(file_path);

        Object.getOwnPropertyNames(report).forEach(function (key) {
          var item_keys = Object.keys(report[key]);

          if (item_keys.length) {
            item_keys.forEach(function (item_key) {
              var item = report[key][item_key];

              if (typeof item === 'string') {
                if (DATE_REG.test(item)) {
                  return report[key][item_key] = Processor.input_date(item);
                }

                return report[key][item_key] = Processor.input(item);
              }

              if (typeof item === 'object') {
                if (typeof item.image === 'string') {
                  return report[key][item_key] = Processor.image(item);
                }
              }
            });
          }
        });

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
      var _this3 = this;

      this._jsonfiles.forEach(function (filename) {
        var ERR_SUFFIX = '_err';
        var PHOTO_SUFFIX = '_photo';

        if (filename.indexOf(ERR_SUFFIX) !== -1) {
          var n_filename = filename.replace(ERR_SUFFIX, PHOTO_SUFFIX);
          var o_file_path = path.join(_this3.target_dir, filename);
          var n_file_path = path.join(_this3.target_dir, n_filename);

          fs.renameSync(o_file_path, n_file_path);
        }
      });
    }
  }]);

  return Transfer;
})();

module.exports = Transfer;

// 待迁移文件名集合