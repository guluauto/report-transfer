/**
 * 报告数据迁移类测试
 *
 * @author Kane
 * @email yunhua.xiao@guluauto.com
 */
let fs = require('fs');
let path = require('path');
let shell = require('shelljs');
let chai = require('chai');
let assert = chai.assert;
let Transfer = require('../../built/transfer');

describe('transfer.js', () => {
  const source_dir = path.join(process.cwd(), 'test/source');
  const target_dir = path.join(process.cwd(), 'test/target');

  let transfer;

  beforeEach(() => {
    transfer = new Transfer(source_dir, target_dir);
  });

  afterEach(() => {
    shell.exec('rm -rf ' + path.join(transfer.target_dir, './*'));
  });

  describe('.constructor', () => {
    it('should config json dirs correctly', () => {
      assert.equal(transfer.source_dir, source_dir, 'json 源目录位置设置 ok');
      assert.equal(transfer.target_dir, target_dir, 'json 目标输出目录设置 ok');
    });
  });

  describe('.copy()', () => {
    it('should copy source dir files to target dir', () => {
      transfer.copy();
      let files = fs.readdirSync(transfer.target_dir);
      files.splice(files.indexOf('.DS_Store'), 1);

      assert.equal(files.length, 4, 'copy ok');
    });
  });

  describe('.jsonfiles()', () => {
    it(`should return array of source_dir's filenames`, () => {
      transfer.copy();
      let files = transfer.jsonfiles();

      assert.equal(files.length, 4, 'ok');
    });
  });

  describe('.process()', () => {
    it('should add test attr to json file', () => {
      transfer.copy();
      transfer.process();

      transfer._jsonfiles.forEach((filename) => {
        let report = require(path.join(transfer.target_dir, filename));
        Object.keys(report).forEach((key) => {
          Object.keys(report[key]).forEach((item_key) => {
            assert.isObject(report[key][item_key], '基本数据类型转对象成功');
            if (report[key][item_key].image != null) {
              assert.isArray(report[key][item_key].image, '转图片数组成功');
            }
          });
        });
      });
    });
  });

  describe('.rename', () => {
    it('should change name of json file with err suffix', () => {
      transfer.copy();
      transfer.process();
      transfer.rename();

      let files = fs.readdirSync(transfer.target_dir);
      let r1 = files.every((filename) => {
        return filename.indexOf('_err') === -1;
      });
      let r2 = files.some((filename) => {
        return filename.indexOf('_photo') !== -1;
      });

      assert.ok(r1 && r2, 'err 修改为 photo 成功');
    });
  });
});