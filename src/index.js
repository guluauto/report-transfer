let Transfer = require('./transfer');

if (process.argv.length !== 4) {
  console.error('参数不正确');

  console.info(
    `
      Usage:

      node ./index.js ./test/source_dir ./test/target_dir
    `
  );

  process.exit(1);
}

const source_dir = process.argv[2];
const target_dir = process.argv[3];

let transfer = new Transfer(source_dir, target_dir);

transfer.run();