var express = require('express');
var router = express.Router();
const authenticate = require("../middleware/authenticate");
let errorResponseHandler = require("../utils/errorResponseHandler");
let Joi = require('joi');

//APIs for restaurant branches

router.post('/addBranch', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            longitude: Joi.string().min(1).required(),
            latitude: Joi.string().min(1).required(),
            token: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 1) console.log("valid");
        else throw new Error("InvalidUser");

        let name = reqinput.name || "";

        let pointObj = {};
        pointObj.type = "Point";
        pointObj.coordinates = [parseFloat(reqinput.longitude),parseFloat(reqinput.latitude)];

        let location = pointObj;

        let branch = await addBranch(restaurants, {
            name,
            location
        });
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{branch:branch}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }


});




router.post('/deleteBranch', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            branch_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 1) console.log("valid");
        else throw new Error("InvalidUser");

        await restaurants.deleteBranch(reqinput.branch_id);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateBranch', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            branch_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            longitude: Joi.string().min(1).required(),
            latitude: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 1) console.log("valid");
        else throw new Error("InvalidUser");

        let branch = await restaurants.findBranchById(reqinput.branch_id);

        branch = branch[0];

        branch.name = reqinput.name;

        let pointObj = {};
        pointObj.type = "Point";
        pointObj.coordinates = [parseFloat(reqinput.longitude),parseFloat(reqinput.latitude)];

        branch.location = pointObj;

        let newBranch = await restaurants.updateBranch(branch);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{branch:newBranch}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/getBranches', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required(),
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 1) console.log("valid");
        else throw new Error("InvalidUser");

        let branches = await restaurants.findBranches();
        
        branches.map(branch=>{
            branch.longitude = branch.location.coordinates[0];
            branch.latitude = branch.location.coordinates[1];
            delete branch.location;
        })
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{branches:branches}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});

async function addBranch(restaurants, restaurantInput) {
    try
    {
        let restaurant = await restaurants.addBranch(restaurantInput);
        return restaurant;
    }
    catch(err)
    {
        throw err;
    }
}



module.exports = router;
