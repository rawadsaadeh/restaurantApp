/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let categoryModel = mongooseModel(mongoose);
    
    return {
        addCategory: function(category)  {
            let catToAdd = new categoryModel(category);
            return catToAdd.save();
        },
        deleteCategory: function(id)  {
            return categoryModel.find({'_id':id}).remove().exec();
        },
        updateCategory: function(category)  {
            return categoryModel.findOneAndUpdate({'_id': category._id}, category, { new: true }).lean().exec();
        },
        findCategoryById: function(categoryId)  {
            return categoryModel.find({'_id': categoryId}).lean().exec();
        }
    };


}


