let express = require('express');
let bodyParser = require('body-parser');
let api = require('./api');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/report', api);

module.exports = app;

let server = app.listen(9875, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.info('报告数据处理服务器已启动，地址：' + host + '，端口:' + port);
});
