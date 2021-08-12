/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let restaurantModel = mongooseModel(mongoose);
    
    return {
        addBranch: function(branch)  {
            let branchToAdd = new restaurantModel(branch);
            return branchToAdd.save();
        },
        deleteBranch: function(id)  {
            return restaurantModel.find({'_id':id}).remove().exec();
        },
        updateBranch: function(branch)  {
            return restaurantModel.findOneAndUpdate({'_id': branch._id}, branch, { new: true }).lean().exec();
        },
        findBranchById: function(branchId)  {
            return restaurantModel.find({'_id': branchId}).lean().exec();
        },
        findBranches: function()  {
            return restaurantModel.find().lean().exec();
        },
        getNearestRestaurant:function(long,lat){
            return restaurantModel.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [ long , lat ] },
                        spherical: true,
                        distanceField: 'dist'
                    }
                },
                { "$sort": { "dist": 1 }},
                { "$limit": 1}
            ]).exec()
        }
    
    };


}


