/**
 * 报告数据迁移
 *
 * @author Kane
 * @email yunhua.xiao@guluauto.com
 *
 */
let path = require('path');
let fs = require('fs');
let shell = require('shelljs');

/**
 * @flow
 */
/**
 * @name Item
 * @desc 检测项结果
 */
class Item {
  constructor(o) {
    for (let k in o) {
      if (o.hasOwnProperty(k)) {
        this[k] = o[k];
      }
    }
  }
}

/**
 * @name Processor
 * @desc 数据处理器
 */
class Processor {
  static image(item: Object): Item {
    let it = new Item(item);
    it.image = [item.image];

    return it;
  }

  static input(input: string): Item {
    return new Item({
      input: input
    });
  }

  static input_date(input_date: string): Item {
    return new Item({
      input_date: input_date
    });
  }
}
/**
 * @name Transfer
 * @desc 报告数据迁移类
 */
class Transfer {
  // 待迁移文件名集合
  _jsonfiles: Array<string>;

  /**
   * @name constructor
   * @desc 构造函数
   * @param {string} source_dir 老数据文件夹
   * @param {string} target_dir 处理后新数据存放文件夹
   */
  constructor(source_dir: string, target_dir: string) {
    this.source_dir = source_dir;
    this.target_dir = target_dir;
  }

  /**
   * @name run
   * @desc 开始迁移
   */
  run() {
    this.copy();
    this.process();
    this.rename();
  }

  /**
   * @name jsonfiles
   * @desc 获取需要迁移的文件名集合
   * @returns {Array<string>} 返回文件名的数组
   */
  jsonfiles(): Array<string> {
    return fs.readdirSync(this.target_dir);
  }

  /**
   * @name copy
   * @desc 拷贝老数据文件到新数据文件夹
   */
  copy() {
    shell.exec('cp -rf ' + path.join(this.source_dir, './*') + ' ' + this.target_dir);
  }

  /**
   * @name process
   * @desc 处理老数据，转换成新数据
   * @todo
   * 1. image to image Array
   * 2. input field to object { input: xxx }
   * 3. input date field to object { input_date: xxx }
   */
  process() {
    this._jsonfiles = this.jsonfiles();

    this._jsonfiles.forEach((filename: string) => {
      let file_path = path.resolve(path.join(this.target_dir, filename));
      let report = require(file_path);

      fs.writeFileSync(file_path, JSON.stringify(report));
    });
  }

  /**
   * @name rename
   * @desc 迁移老文件名至新文件名
   */
  rename() {
    this._jsonfiles.forEach((filename: string) => {
      const ERR_SUFFIX = '_err';
      const PHOTO_SUFFIX = '_photo';

      if (filename.indexOf(ERR_SUFFIX) !== -1) {
        let n_filename = filename.replace(ERR_SUFFIX, PHOTO_SUFFIX);
        let o_file_path = path.join(this.target_dir, filename);
        let n_file_path = path.join(this.target_dir, n_filename)

        fs.renameSync(o_file_path, n_file_path);
      }
    });
  }
}

module.exports = Transfer;