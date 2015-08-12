#!/usr/bin/env node
'use strict';

var path = require('path');
var Transfer = require('./transfer');

if (process.argv.length !== 5) {
  console.error('参数不正确');

  console.info('\n      Usage:\n\n      gltrs ./test/source ./test/target\n    ');

  process.exit(1);
}

var source_dir = path.join(process.cwd(), process.argv[2]);
var target_dir = path.join(process.cwd(), process.argv[3]);
var order_file = path.join(process.cwd(), process.argv[4]);

var transfer = new Transfer(source_dir, target_dir, order_file);
transfer.run();