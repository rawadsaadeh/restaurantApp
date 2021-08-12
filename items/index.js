/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let itemModel = mongooseModel(mongoose);
    
    return {
        findItems: function(skipItem,limitItems,name,category_id)  {
            return itemModel.aggregate([
                {$addFields: {
                    categoryId: { $toString: "$category_id" }
                }},
                {$match:{
                    "is_available":1,
                    "name" : {$regex : name},
                    "categoryId" : {$regex : category_id}
                }},
                {$lookup: {
                    from: 'categories',
                    localField:"category_id",
                    foreignField:"_id",
                    as: 'categories'
                }},
                {$addFields:{
                    "category_name":{$arrayElemAt: [ "$categories.name", 0 ] }
                }},
                {$project:{
                    "_id":1,
                    "name": 1,
                    "is_available": 1,
                    "price": 1,
                    "created": 1,
                    "category_name": 1
                }},
                { "$sort": { "category_name": -1 }},
                { "$skip": skipItem},  
                { "$limit": limitItems}
            ]).exec();
        },
        findItemsCount: function(name,category_id)  {
            return itemModel.aggregate([
                {$addFields: {
                    categoryId: { $toString: "$category_id" }
                }},
                {$match:{
                    "is_available":1,
                    "name" : {$regex : name},
                    "categoryId" : {$regex : category_id}
                }},
                {$lookup: {
                    from: 'categories',
                    localField:"category_id",
                    foreignField:"_id",
                    as: 'categories'
                }},
                {$addFields:{
                    "category_name":{$arrayElemAt: [ "$categories.name", 0 ] }
                }},
                {$project:{
                    "_id":1,
                    "name": 1,
                    "is_available": 1,
                    "price": 1,
                    "created": 1,
                    "category_name": 1
                }},
                {
                    $group:{
                        _id:null,
                        total:{$sum:1}
                    }
                }
            ]).exec();
        },
        addItem: function(item)  {
            let itToAdd = new itemModel(item);
            return itToAdd.save();
        },
        deleteItem: function(id)  {
            return itemModel.find({'_id':id}).remove().exec();
        },
        updateItem: function(item)  {
            return itemModel.findOneAndUpdate({'_id': item._id}, item, { new: true }).lean().exec();
        },
        findItemById: function(itemId)  {
            return itemModel.find({'_id': itemId}).lean().exec();
        }   
    };


}


