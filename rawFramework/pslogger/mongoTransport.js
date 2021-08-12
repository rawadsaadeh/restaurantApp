/*
Based on: https://github.com/winstonjs/winston#adding-custom-transports
*/

const Transport = require('winston-transport');
const util = require('util');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class MongoTransport extends Transport {
  
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail, 
    //   logentries, etc.).
    //
    let mongooseModel = require('./mongooseModel');
    this.logModel = mongooseModel(opts.mongoose);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Perform the writing to the remote service
    new this.logModel(info).save(function(err){});
    
    callback();
  }
};