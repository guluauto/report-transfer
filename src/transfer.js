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
class Transfer {
  _jsonfiles: Array<string>;

  constructor(source_dir, target_dir) {
    this.source_dir = source_dir;
    this.target_dir = target_dir;
  }

  run() {
    this.copy();
    this.process();
    this.rename();
  }

  jsonfiles(): Array<string> {
    return fs.readdirSync(this.target_dir);
  }

  copy() {
    shell.exec('cp -rf ' + path.join(this.source_dir, './*') + ' ' + this.target_dir);
  }

  process() {
    this._jsonfiles = this.jsonfiles();

    this._jsonfiles.forEach((filename: string) => {
      let file_path = path.resolve(path.join(this.target_dir, filename));
      let report = require(file_path);

      report.test = true;

      fs.writeFileSync(file_path, JSON.stringify(report));
    });
  }

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