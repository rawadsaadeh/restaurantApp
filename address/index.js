/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let addressModel = mongooseModel(mongoose);
    
    return {
        addAddress: function(address)  {
            let addressToAdd = new addressModel(address);
            return addressToAdd.save();
        },
        deleteAddress: function(id)  {
            return addressModel.find({'_id':id}).remove().exec();
        },
        updateAddress: function(address)  {
            return addressModel.findOneAndUpdate({'_id': address._id}, address, { new: true }).lean().exec();
        },
        getAdress: function(addressId)  {
            return addressModel.find({'_id': addressId}).lean().exec();
        },
        getUserAdresses: function(userId)  {
            return addressModel.find({'user_id': userId}).lean().exec();
        }
    };


}


