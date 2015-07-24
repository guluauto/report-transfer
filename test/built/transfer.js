/**
 * 报告数据迁移类测试
 *
 * @author Kane
 * @email yunhua.xiao@guluauto.com
 */
'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var chai = require('chai');
var assert = chai.assert;
var Transfer = require('../../built/transfer');

describe('transfer.js', function () {
  var source_dir = path.join(process.cwd(), 'test/source');
  var target_dir = path.join(process.cwd(), 'test/target');

  var transfer = undefined;

  beforeEach(function () {
    transfer = new Transfer(source_dir, target_dir);
  });

  afterEach(function () {
    shell.exec('rm -rf ' + path.join(transfer.target_dir, './*'));
  });

  describe('.constructor', function () {
    it('should config json dirs correctly', function () {
      assert.equal(transfer.source_dir, source_dir, 'json 源目录位置设置 ok');
      assert.equal(transfer.target_dir, target_dir, 'json 目标输出目录设置 ok');
    });
  });

  describe('.copy()', function () {
    it('should copy source dir files to target dir', function () {
      transfer.copy();
      var files = fs.readdirSync(transfer.target_dir);
      files.splice(files.indexOf('.DS_Store'), 1);

      assert.equal(files.length, 4, 'copy ok');
    });
  });

  describe('.jsonfiles()', function () {
    it('should return array of source_dir\'s filenames', function () {
      transfer.copy();
      var files = transfer.jsonfiles();

      assert.equal(files.length, 4, 'ok');
    });
  });

  describe('.process()', function () {
    it('should add test attr to json file', function () {
      transfer.copy();
      transfer.process();

      transfer._jsonfiles.forEach(function (filename) {
        var report = require(path.join(transfer.target_dir, filename));
        Object.keys(report).forEach(function (key) {
          Object.keys(report[key]).forEach(function (item_key) {
            assert.isObject(report[key][item_key], '基本数据类型转对象成功');
            if (report[key][item_key].image != null) {
              assert.isArray(report[key][item_key].image, '转图片数组成功');
            }
          });
        });
      });
    });
  });

  describe('.rename', function () {
    it('should change name of json file with err suffix', function () {
      transfer.copy();
      transfer.process();
      transfer.rename();

      var files = fs.readdirSync(transfer.target_dir);
      var r1 = files.every(function (filename) {
        return filename.indexOf('_err') === -1;
      });
      var r2 = files.some(function (filename) {
        return filename.indexOf('_photo') !== -1;
      });

      assert.ok(r1 && r2, 'err 修改为 photo 成功');
    });
  });
});