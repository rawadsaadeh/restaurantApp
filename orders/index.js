/*
module, dependens on mongoose, make sure the connection 
is open before initializeing this module.
*/
module.exports = function(mongoose) {
    let mongooseModel = require('./mongooseModel');
    let orderModel = mongooseModel(mongoose);
    
    return {
        addOrder: function(order)  {
            let itToAdd = new orderModel(order);
            return itToAdd.save();
        },
        deleteOrder: function(id)  {
            return orderModel.find({'_id':id}).remove().exec();
        },
        updateOrder: function(order)  {
            return orderModel.findOneAndUpdate({'_id': order._id}, order, { new: true }).lean().exec();
        },
        findOrderById: function(orderId)  {
            return orderModel.find({'_id': orderId}).lean().exec();
        },
        findUserOrders: function(userId){
            return orderModel.aggregate([
                {$match:{"ordered_by":userId}},
                { "$unwind": "$items" },
                {$addFields:{
                    "item_id":{$toObjectId:"$items.item_id"},
                    "item_quantity":"$items.quantity"
                }},
                { "$lookup": {
                    "from": "items",
                    "localField": "item_id",
                    "foreignField": "_id",
                    "as":"item"
                }},
                {$addFields:{
                    "item_name":{$arrayElemAt:["$item.name",0]},
                    "item_price":{$arrayElemAt:["$item.price",0]},
                    "item_cost":{ $multiply: [ {$arrayElemAt:["$item.price",0]} , "$item_quantity" ] }
                }},
                {
                    $group:{
                        _id:"$_id",
                        is_pending :{$addToSet:"$is_pending"},
                        is_approved :{$addToSet:"$is_approved"},
                        is_cancelled :{$addToSet:"$is_cancelled"},
                        branch_id :{$addToSet:"$branch_id"},
                        total:{$sum:"$item_cost"},
                        items : 
                        {$addToSet:{
                            "qty":"$item_quantity","item_price":"$item_price","name":"$item_name",
                            "total": { $multiply: [ "$item_price", "$item_quantity" ] }
                        }}
                    }
                },
                {
                    $addFields:{
                        branchId:{$arrayElemAt:["$branch_id",0]}
                    }
                },
                { "$lookup": {
                    "from": "restaurants",
                    "localField": "branchId",
                    "foreignField": "_id",
                    "as":"branch"
                }},
                {
                    $project:{
                        _id:1,
                        is_pending:{$arrayElemAt:["$is_pending",0]},
                        is_approved:{$arrayElemAt:["$is_approved",0]},
                        is_cancelled:{$arrayElemAt:["$is_cancelled",0]},
                        branch_name:{$arrayElemAt:["$branch.name",0]},
                        total:1,
                        items:1
                    }
                },
            ]).exec()
        },

    };


}


