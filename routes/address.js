var express = require('express');
var router = express.Router();
const authenticate = require("../middleware/authenticate");
let errorResponseHandler = require("../utils/errorResponseHandler");
let Joi = require('joi');

//APIs for user addresses

router.post('/addAddress', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let addresses = req.app.address;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            label: Joi.string().min(1).required(),
            address: Joi.string().min(1).required(),
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
        if(user.length > 0 && user[0].role_type == 2) console.log("valid");
        else throw new Error("InvalidUser");

        let label = reqinput.label || "";
        let address = reqinput.address || "";
        let user_id = user[0]._id;

        let pointObj = {};
        pointObj.type = "Point";
        pointObj.coordinates = [parseFloat(reqinput.longitude),parseFloat(reqinput.latitude)];

        let location = pointObj;

        let newAddress = await addAddress(addresses, {
            label,
            address,
            location,
            user_id
        });
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{address:newAddress}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }


});




router.post('/deleteAddress', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let addresses = req.app.address;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            address_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 2) console.log("valid");
        else throw new Error("InvalidUser");

        await addresses.deleteAddress(reqinput.address_id);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateAddress', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let addresses = req.app.address;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            label: Joi.string().min(1).required(),
            address: Joi.string().min(1).required(),
            address_id: Joi.string().min(1).required(),
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
        if(user.length > 0 && user[0].role_type == 2) console.log("valid");
        else throw new Error("InvalidUser");

        let add = await addresses.getAdress(reqinput.address_id);

        add = add[0];

        add.label = reqinput.label;
        add.address = reqinput.address;

        let pointObj = {};
        pointObj.type = "Point";
        pointObj.coordinates = [parseFloat(reqinput.longitude),parseFloat(reqinput.latitude)];

        add.location = pointObj;

        let newAddress = await addresses.updateAddress(add);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{address:newAddress}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});


async function addAddress(adresses, addressInput) {
    try
    {
        let address = await adresses.addAddress(addressInput);
        return address;
    }
    catch(err)
    {
        throw err;
    }
}



module.exports = router;
