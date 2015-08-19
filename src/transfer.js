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
 * @class Item
 * @desc 检测项结果
 */
class Item {
  constructor(o) {
    for (let k of Object.keys(o)) {
      this[k] = o[k];
    }
  }
}

/**
 * @class Processor
 * @desc 数据处理器
 */
class Processor {
  /**
   * @method image
   * @desc 单个图片字符串转图片字符串数组
   * @static
   * @param item
   * @returns {Item} 检测项结果
   */
  static image(item:Object):Item {
    let it = new Item(item);
    it.image = [item.image];

    return it;
  }

  /**
   * @method input
   * @desc 普通填写字符串转对象 { input: string }
   * @static
   * @param input
   * @returns {Item} 检测项结果
   */
  static input(input:string):Item {
    return new Item({
      input: input
    });
  }

  /**
   * @method input_date
   * @desc 日期填写字符串转对象 { input_date: string }
   * @param input_date
   */
  static input_date(input_date:string):Item {
    return new Item({
      input_date: input_date
    });
  }

  /**
   * @method select
   * @desc 下拉列表结果({ name: string, value: number })转对象 { selected: number }
   * @static
   * @param item
   * @returns {Item} 检测项结果
   */
  static select(item:Object):Item {
    return new Item({
      selected: item.value
    });
  }
}

const PREFIX = 'gulu.tester.';
const ERR_SUFFIX = '_err';
const PHOTO_SUFFIX = '_photo';
const ORDER_SUFFIX = '_order';
const REPORT_SUFFIX = '_report';
const FILE_EXT = '.json';
const CONNECT_STR = '_';

/**
 * @class Transfer
 * @desc 报告数据迁移类
 */
class Transfer {
  // 待迁移文件名集合
  _jsonfiles:Array<string>;

  /**
   * @constructor
   * @desc 构造函数
   * @param {string} source_dir 老数据文件夹
   * @param {string} target_dir 处理后新数据存放文件夹
   */
  constructor(source_dir:string, target_dir:string, order_file:string) {
    this.source_dir = source_dir;
    this.target_dir = target_dir;
    this.order_file = order_file;
  }

  /**
   * @method run
   * @desc 开始迁移
   */
  run() {
    this.clear_output();
    this.copy();
    this.rm_cn_4filename();
    this.process();
    this.rename();
    this.out_order();
  }

  /**
   * @method jsonfiles
   * @desc 获取需要迁移的文件名集合
   * @returns {Array<string>} 返回文件名的数组
   */
  jsonfiles():Array<string> {
    if (this._jsonfiles) {
      return this._jsonfiles;
    }

    let files = fs.readdirSync(this.target_dir);
    const OSX = '.DS_Store';

    let i = files.indexOf(OSX);
    if (i !== -1) {
      files.splice(i, 1);
    }

    return files;
  }

  /**
   * @method clear_output
   * @desc 清空输出目录
   */
  clear_output() {
    shell.exec('rm -rf ' + path.join(this.target_dir, './*'));
  }

  /**
   * @method copy
   * @desc 拷贝老数据文件到新数据文件夹
   */
  copy() {
    shell.exec('cp -rf ' + path.join(this.source_dir, './*') + ' ' + this.target_dir);
  }

  /**
   * @method rm_cn_4filename
   * @desc 取出文件名中的中文字符
   */
  rm_cn_4filename() {
    let files = this.jsonfiles();

    files.forEach((filename:string) => {
      let n_filename = filename.replace(/^[\u4e00-\u9fa5\-0-9]+/g, '');
      let o_file_path = path.join(this.target_dir, filename);
      let n_file_path = path.join(this.target_dir, n_filename)

      fs.renameSync(o_file_path, n_file_path);
    });
  }

  /**
   * @method process
   * @desc 处理老数据，转换成新数据
   *
   * 1. image to image Array
   * 2. input field to object { input: xxx }
   * 3. input date field to object { input_date: xxx }
   * 4. select field to { selected: xxx }
   */
  process() {
    this._jsonfiles = this.jsonfiles();
    const DATE_REG = /^\d{4}\-\d{2}\-\d{2}.+$/;

    this._jsonfiles.forEach((filename:string) => {
      let file_path = path.resolve(path.join(this.target_dir, filename));
      let report = require(file_path);

      Object.getOwnPropertyNames(report).forEach((key) => {
        var item_keys = Object.keys(report[key]);

        if (item_keys.length) {
          item_keys.forEach((item_key) => {
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

              if (item.value != null) {
                return report[key][item_key] = Processor.select(item);
              }
            }
          });
        }
      });

      fs.writeFileSync(file_path, JSON.stringify(report));
    });
  }

  /**
   * @method rename
   * @desc 迁移老文件名至新文件名
   */
  rename() {
    this._jsonfiles.forEach((filename:string) => {
      let o_file_path = path.join(this.target_dir, filename);
      let n_file_path, n_filename;

      if (filename.indexOf(ERR_SUFFIX) !== -1) {
        n_filename = filename.replace(ERR_SUFFIX, PHOTO_SUFFIX);
      } else {
        n_filename = filename.replace(FILE_EXT, REPORT_SUFFIX + FILE_EXT);
      }

      console.info(filename + ' --> ' + n_filename);

      n_file_path = path.join(this.target_dir, n_filename);
      fs.renameSync(o_file_path, n_file_path);
    });
  }

  /**
   * @method format_orders
   * @desc 格式化订单列表数据，生成结果形式为：{ `order_id`: { ... } }
   * @returns {{}}
   */
  format_orders() {
    let orders = require(this.order_file).data;
    let brief_orders = {};
    orders.forEach((item:Object) => {
      brief_orders[item.id] = {
        address: item.address,
        contact: item.contact,
        inspector: item.inspector,
        appointment_time: item.appointment_time
      };
    });

    return brief_orders;
  }

  out_order() {
    let brief_orders = this.format_orders();
    let jsonfiles = this.jsonfiles();

    jsonfiles.forEach((filename:string) => {
      let ids = filename.replace(PREFIX, '').replace(FILE_EXT, '').replace(ERR_SUFFIX, '').split(CONNECT_STR);
      let order_id = ids[0];

      let order_filename = path.join(
        this.target_dir,
        filename.indexOf(ERR_SUFFIX) !== -1
          ? filename.replace(ERR_SUFFIX, ORDER_SUFFIX)
          : filename.replace(FILE_EXT, ORDER_SUFFIX + FILE_EXT)
      );
      fs.writeFileSync(order_filename, JSON.stringify(brief_orders[order_id]));
    });
  }
}

module.exports = Transfer;