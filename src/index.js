#!/usr/bin/env node

let path = require('path');
let Transfer = require('./transfer');

if (process.argv.length !== 4) {
  console.error('参数不正确');

  console.info(
    `
      Usage:

      gltrs ./test/source ./test/target
    `
  );

  process.exit(1);
}

const source_dir = path.join(process.cwd(), process.argv[2]);
const target_dir = path.join(process.cwd(), process.argv[3]);

let transfer = new Transfer(source_dir, target_dir);
transfer.run();











