/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let settingModel = mongooseModel(mongoose);
    
    return {
        findByKey: function(settingkey)  {
            return settingModel.find({'setting_key': settingkey}).exec();
        },
        updateByKey: function(settingkey,settingValue)  {
            return settingModel.updateOne( {'setting_key': settingkey}, {'$set': {'setting_value': settingValue }} ).exec();
        }
    };


}


