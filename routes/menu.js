var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
let errorResponseHandler = require("../utils/errorResponseHandler");
let Joi = require('joi');

router.post('/getMenu',async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let items = req.app.items;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            category_id: Joi.string().min(1),
            name: Joi.string().allow(""),
            page: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let name = reqinput.name || "";

        let category_id = reqinput.category_id || "";

        let itemsPerPage = parseInt(process.env.ITEMS_PER_PAGE);

        let startIndex = parseInt(reqinput.page) * itemsPerPage;

        let itemsFound = await items.findItems(startIndex,itemsPerPage,name,category_id);

        let itemsCount = await items.findItemsCount(name,category_id);

        itemsCount = itemsCount[0].total;
        
        console.log(itemsCount);
        
        let dataObject = {};

        dataObject.items = itemsFound;

        if(startIndex+itemsPerPage < itemsCount)
        {
            dataObject.has_next = "true";
            dataObject.next_page = (parseInt(reqinput.page) + 1) + "";
        }
        else
        {
            dataObject.has_next = "false";
        }
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:dataObject});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

  
});





//APIs for Categories

router.post('/addCategory', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

  
    let categories = req.app.categories;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            image: Joi.string().allow(""),
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

        let image = reqinput.image || "";

        let category = await addCategory(categories, {
            name,
            image
        });
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{category:category}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/deleteCategory', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

  
    let categories = req.app.categories;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            category_id: Joi.string().min(1).required(),
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

        await categories.deleteCategory(reqinput.category_id);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateCategory', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let categories = req.app.categories;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            category_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            image: Joi.string().allow("")
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

        let category = await categories.findCategoryById(reqinput.category_id);

        category = category[0];

        category.name = reqinput.name;

        let image = reqinput.image || "";

        if (image != "") category.image = image;

        let newCategory = await categories.updateCategory(category);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{category:newCategory}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});



async function addCategory(categories, categoryInput) {
    try
    {
        let category = await categories.addCategory(categoryInput);
        return category;
    }
    catch(err)
    {
        throw err;
    }
}





//APIs for Items


router.post('/addItem', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let items = req.app.items;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            image: Joi.string().allow(""),
            token: Joi.string().min(1).required(),
            price: Joi.number().integer().min(1).required(),
            category_id: Joi.string().min(1).required()
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

        let image = reqinput.image || "";

        let price = reqinput.price || 1;

        let category_id = reqinput.category_id;

        let item = await addItem(items, {
            name,
            image,
            price,
            category_id
        });
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{item:item}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/deleteItem', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

  
    let items = req.app.items;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            item_id: Joi.string().min(1).required(),
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

        await items.deleteItem(reqinput.item_id);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateItem', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();


    let items = req.app.items;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

       

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            item_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required(),
            name: Joi.string().min(1).required(),
            image: Joi.string().allow(""),
            price: Joi.number().integer().min(1).required(),
            category_id: Joi.string().min(1).required()
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

        let item = await items.findItemById(reqinput.item_id);

        item = item[0];

        item.name = reqinput.name;

        item.price = reqinput.price;

        item.category_id = reqinput.category_id;

        let image = reqinput.image || "";

        if (image != "") item.image = image;

        let newItem = await items.updateItem(item);
        
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{item:newItem}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }
});



async function addItem(items, itemInput) {
    try
    {
        let item = await items.addItem(itemInput);
        return item;
    }
    catch(err)
    {
        throw err;
    }
}




module.exports = router;
