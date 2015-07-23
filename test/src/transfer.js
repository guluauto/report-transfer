/**
 * @author Kane
 * @email yunhua.xiao@guluauto.com
 */
let fs = require('fs');
let path = require('path');
let chai = require('chai');
let assert = chai.assert;
let Transfer = require('../../built/transfer');

describe('transfer.js', () => {
  const source_dir = './test/source';
  const target_dir = './test/target';

  let transfer;

  beforeEach(() => {
    transfer = new Transfer(source_dir, target_dir);
  });

  describe('.constructor', () => {
    it('should config json dirs correctly', () => {
      assert.equal(transfer.source_dir, source_dir, 'json 源目录位置设置 ok');
      assert.equal(transfer.target_dir, target_dir, 'json 目标输出目录设置 ok');
    });
  });

  describe('.copy()', () => {
    it(`should return array of source_dir's filenames`, () => {
      transfer.copy();
      let files = fs.readFileSync(transfer.target_dir);

      assert.equal(files.length, 4, 'copy ok');

      if (!files || !files.length) {
        return;
      }

      files.forEach((filename: string) => {
        fs.rmdirSync(path.join(transfer.target_dir, filename));
      });
    });
  });

  describe('.jsonfiles()', () => {
    it(`should return array of source_dir's filenames`, () => {
      transfer.copy();
      let files = transfer.jsonfiles();
      assert.equal();
    });
  });
});