'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

module.exports = router;

var PREFIX = 'gulu.tester.';
var SUFFIXS = ['report', 'photo', 'order'];
var FILE_EXT = '.json';
var CONNECTOR = '_';
var TRANSFORMED_REPORT_DIR = './output';

/**
 * 获取已转换的车辆报告数据
 * @param req
 * @param res
 */
function transfer(req, res) {
  var order_id = req.body.order_id;
  var car_id = req.body.car_id;

  var data = {};
  SUFFIXS.forEach(function (suffix) {
    var filename = PREFIX + [order_id, car_id, suffix].join(CONNECTOR);
    var filepath = path.resolve(process.cwd(), TRANSFORMED_REPORT_DIR, filename + FILE_EXT);

    if (fs.existsSync(filepath)) {
      var transformed = fs.readFileSync(filepath);
      data[suffix] = transformed.toString();
    }
  });

  res.status(200).json({
    code: 200,
    data: data
  });
}

router.use('/transfer', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  next();
});

router.options('/transfer', function (req, res) {
  res.status(204).end();
});

router.post('/transfer', transfer);