'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var api = require('./api');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/report', api);

module.exports = app;

var server = app.listen(9875, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.info('报告数据处理服务器已启动，地址：' + host + '，端口:' + port);
});