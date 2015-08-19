/**
 * Created by Kane on 15/8/19.
 */
let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');

module.exports = router;

const PREFIX = 'gulu.tester.';
const SUFFIXS = ['report', 'photo'];
const FILE_EXT = '.json';
const CONNECTOR = '_';
const TRANSFORMED_REPORT_DIR = './output';

router.post('/transfer', (req, res) => {
  var order_id = req.body.order_id;
  var car_id = req.body.car_id;

  var data = {};
  SUFFIXS.forEach((suffix) => {
    let filename = PREFIX + [order_id, car_id, suffix].join(CONNECTOR);
    let filepath = path.resolve(process.cwd(), TRANSFORMED_REPORT_DIR, filename + FILE_EXT);
    let transformed = fs.readFileSync(filepath);

    data[suffix] = transformed.toString();
  });

  res.status(200).json({
    code: 200,
    data: data
  });
});