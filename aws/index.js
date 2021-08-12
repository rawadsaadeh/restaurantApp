const AWS = require('aws-sdk');

module.exports = {
    init: function(config) {
        AWS.config.update({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
          });
    },
    putObject: function(params) {
        return new Promise((resolve, reject) => {
            var s3 = new AWS.S3();
            s3.putObject(params, function(err, data) {
                if(err) reject(err);
                else resolve(data);
            });
        });
    },
    getObject: function(params) {
        return new Promise((resolve, reject) => {
            var s3 = new AWS.S3();
            s3.getObject(params, function(err, data) {
                if(err) reject(err);
                else resolve(data.Body);
            });
        });
    }
}