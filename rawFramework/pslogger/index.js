
const winston = require('winston');


module.exports = {
    
    /*
    {
       logfile: logfile to write the logs
       loglevel: winston log level (check winston docs)
       wmongoose: mongoose object with a valid connectoin = WIP
    }
    */
    logger: function(options) {
        
        let moptions = options || {};

        const wloglevel = moptions.loglevel || 'info';
        const wlogfile = moptions.logfile || 'winston.log';
        const wmongoose = moptions.wmongoose || '';
        
        let transports = [
            new winston.transports.Console({ level: wloglevel }),
            new winston.transports.File({ filename: wlogfile, level: wloglevel })
        ];

        if(wmongoose === '') {
            throw new Error("Mongoose is a required parameter");
            //TODO: push mongo transport to transports array here
        }

        const wlogger = winston.createLogger({
            levels: winston.config.syslog.levels,
            transports
        });

        wlogger.stream = {
            write: function(message, encoding) {
                wlogger.info(message);
            }
        };
        return wlogger;
    }
}