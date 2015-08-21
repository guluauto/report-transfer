let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');

module.exports = router;

const PREFIX = 'gulu.tester.';
const SUFFIXS = ['report', 'photo', 'order'];
const FILE_EXT = '.json';
const CONNECTOR = '_';
const TRANSFORMED_REPORT_DIR = './output';

/**
 * 获取已转换的车辆报告数据
 * @param req
 * @param res
 */
function transfer(req, res) {
  var order_id = req.body.order_id;
  var car_id = req.body.car_id;

  var data = {};
  SUFFIXS.forEach((suffix) => {
    let filename = PREFIX + [order_id, car_id, suffix].join(CONNECTOR);
    let filepath = path.resolve(process.cwd(), TRANSFORMED_REPORT_DIR, filename + FILE_EXT);

    if (fs.existsSync(filepath)) {
      let transformed = fs.readFileSync(filepath);
      data[suffix] = transformed.toString();
    }
  });

  res.status(200).json({
    code: 200,
    data: data
  });
}

router.use('/transfer', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  next();
});

router.options('/transfer', (req, res) => {
  res.status(204).end();
});

router.post('/transfer', transfer);
