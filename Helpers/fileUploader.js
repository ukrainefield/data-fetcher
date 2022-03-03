const aws = require('aws-sdk');
const fs = require('fs');
const log = require('fancy-log');

const { S3_ENDPOINT, BUCKET_NAME } = process.env;

const spacesEndpoint = new aws.Endpoint(S3_ENDPOINT);

const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET,
});

async function uploadFile(filePath, fileName, type) {
  const file = fs.readFileSync(filePath);
  log.info('Got a file', fileName);
  const myPromise = new Promise((resolve, reject) => {
    s3.upload({ Bucket: BUCKET_NAME, Key: `${type}/${fileName}`, Body: file, ACL: 'public-read' }, (err, data) => {
      if (err) {
        log.info(err);
        reject(err);
      }
      log.info('Your file has been uploaded successfully!', data);
      resolve(data);
    });
  });
  return myPromise;
}

module.exports = { s3, uploadFile };
