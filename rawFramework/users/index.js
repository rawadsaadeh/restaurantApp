/*
Users module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let userModel = mongooseModel(mongoose);
    
    return {
        /*
        Find a user by id, and returns a promise
        */
        findById: function(userid)  {
            return userModel.findById(userid).lean().exec();
        },
        /*
        Find a user by email, and returns a promise
        */
        findByEmail: function(userEmail)  {
            return userModel.find({email: userEmail}).lean().exec();
        },
        /*
        Find a user by email and password, and returns a promise
        */
        findByEmailandPassword: function(userEmail, password)  {
            return userModel.find({email: userEmail, password: password}).lean().exec();
        },
        /*
        Add a user based on schema, return a promise 
        */
        addUser: function(user)  {
            let userToAdd = new userModel(user);
            return userToAdd.save();
        },
        findUserById: function(userId)  {
            return userModel.find({'_id': userId,'active':1}).lean().exec();
        },
        findTargetedUserById: function(userId)  {
            return userModel.find({'_id': userId}).lean().exec();
        },
        updateUser: function(user)  {
            return userModel.findOneAndUpdate({'_id': user._id}, user, { new: true }).lean().exec();
        },
        deleteUser: function(id)  {
            return userModel.find({'_id':id}).remove().exec();
        },
        invokeToken: function(refresh_token)  {
            return userModel.updateMany( {'refresh_token': refresh_token}, {'$set': {'refresh_token': null}} ).exec();
        }
    };


}


