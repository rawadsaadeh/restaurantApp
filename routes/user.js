var express = require('express');
var router = express.Router();
let md5 = require('md5');
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
let uuid = require("uuid/v4");
let errorResponseHandler = require("../utils/errorResponseHandler");
let Joi = require('joi');

//JUST an example of how to use apidoc for APIs documentation
//N.B: I didn't use it in this project
 
 /** 
 * @api {post} /user/signUp api called for user signUp
 * @apiGroup User
 * @apiUse CommonHeaders
 * @apiParam {String} email
 * @apiParam {String} fullname
 * @apiParam {String} password
 * @apiParamExample {json} Request Body :
 * { 
 *   email: "usr@gmail.com"
 *   fullname: "usr"
 *   password: "pwd"
 * }
 * @apiSuccessExample {json} Success-Response :
 * HTTP/1.1 200 Success
 * {
    status: 200,
    "response": true,
    "error": {
        "code": 0,
        "description": ""
    },
    "data": {...}
 * @apiErrorExample {json} Validation Error:
 * HTTP/1.1 400 Bad Input
 * {
 *    status: 401,
 *    data: '',
 *    errors: {"code":number,"description":"desc"}
 * }
 * @apiErrorExample {json} Server Error:
 * HTTP/1.1 500 Internal Server Error
 * {
 *    status: 500,
 *    data: '',
 *    errors: {"code":number,"description":"desc"}
 * }
 */


router.post('/signUp', async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});        

        let schema = Joi.object().keys({
            email: Joi.string().min(1).required(),
            fullname: Joi.string().min(1).required(),
            password: Joi.string().min(1).required(),
            is_admin: Joi.number().integer().valid(0,1)
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let password = reqinput.password;
        const fullname = reqinput.fullname;
        const email = reqinput.email;
        password = password.split("").reverse().join("");
        password = md5(password);

        let userFound = await users.findByEmail(email);

        let role_type;
        reqinput.is_admin == 1 ? role_type = 1 : role_type = 2;

        if(userFound.length == 0)
        {

            let refresh_token = uuid();

            let user = await addUser(users, {
                email,
                fullname,
                password,
                role_type,
                refresh_token
            });

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"user":{"_id":user._id,"fullname":user.fullname,"email":user.email,"token":token,"refresh_token":user.refresh_token}}});
        }
        else
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':1007,'description':'This email is already used'},data:{}});
        }
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

   
});



router.post('/signIn',async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            email: Joi.string().min(1).required(),
            password: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let password = reqinput.password;
        const email = reqinput.email;
        password = password.split("").reverse().join("");
        password = md5(password);

        let userFound = await users.findByEmailandPassword(email,password);
        if(userFound.length > 0)
        {
            let user = userFound[0];

            let refresh_token = uuid();

            user.refresh_token = refresh_token;
    
            let newUser = await users.updateUser(user);

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
                
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"user":{"_id":newUser._id,"fullname":newUser.fullname,"email":newUser.email,"token":token,"refresh_token":newUser.refresh_token}}});
        }
        else
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':1008,'description':'User does not exist'},data:{}});
        }
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }


});


async function addUser(users, userInp) {
    try
    {
        let user = await users.addUser(userInp);
        return user;
    }
    catch(err)
    {
        throw err;
    }
}



//APIs for orders

router.post('/addOrder', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let orders = req.app.orders;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            items: Joi.array().items(
                Joi.object({
                  item_id: Joi.string(),
                  quantity: Joi.number()
                })
            ).has(Joi.object({ item_id: Joi.string().min(1), quantity: Joi.number().min(1) })).min(1).required(),
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

        let branch = await restaurants.getNearestRestaurant(parseFloat(reqinput.longitude),parseFloat(reqinput.latitude));

        let branchDistance = parseInt(branch[0].dist);

        let branch_id = branch[0]._id;

        if(parseInt(branchDistance)>5000)
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':506,'description':'Sorry , no restaurant branch near you :('},data:{}});
        }
        else
        {
            let items = reqinput.items
            let ordered_by = user[0]._id;
    
            let pointObj = {};
            pointObj.type = "Point";
            pointObj.coordinates = [parseFloat(reqinput.longitude),parseFloat(reqinput.latitude)];
    
            let order_location = pointObj;
    
            let order = await addOrder(orders, {
                items,
                ordered_by,
                order_location,
                branch_id
            });

            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{order:order}});
        }
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateOrder', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let restaurants = req.app.restaurants;
    let orders = req.app.orders;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            order_id: Joi.string().min(1).required(),
            items: Joi.array().items(
                Joi.object({
                  item_id: Joi.string(),
                  quantity: Joi.number()
                })
            ).has(Joi.object({ item_id: Joi.string().min(1), quantity: Joi.number().min(1) })).min(1).required(),
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
      
        let order = await orders.findOrderById(reqinput.order_id);

        order = order[0];

        order.items = reqinput.items;

        let newOrder = await orders.updateOrder(order);

        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{order:newOrder}});
    
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/listOrders', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let orders = req.app.orders;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
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
      
        let ordersFound = await orders.findUserOrders(user[0]._id);

        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{orders:ordersFound}});
    
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});


router.post('/cancelOrder', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let orders = req.app.orders;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            order_id: Joi.string().min(1).required(),
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
      
        let order = await orders.findOrderById(reqinput.order_id);

        order = order[0];

        if(order.is_pending == 0)
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':803,'description':'order is no longer pending and cant be cancelled'},data:{}});
        }

        else
        {
            order.is_cancelled = 1;
            order.is_pending = 0;
            let newOrder = await orders.updateOrder(order);
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{order:newOrder}});
        }

        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});



router.post('/approveOrRejectOrder', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let orders = req.app.orders;
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            order_id: Joi.string().min(1).required(),
            is_approved: Joi.number().integer().valid(0,1).required(),
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
      
        let order = await orders.findOrderById(reqinput.order_id);

        order = order[0];

        if(order.is_pending == 0)
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':803,'description':'order is no longer pending and cant be approved or rejected'},data:{}});
        }

        else
        {
            order.is_approved = reqinput.is_approved;
            order.is_pending = 0;
            let newOrder = await orders.updateOrder(order);
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{order:newOrder}});
        }

        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});






router.post('/enableOrDisableUser', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            targeted_user_id: Joi.string().min(1).required(),
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
      
        let targeted_user = await users.findTargetedUserById(reqinput.targeted_user_id);

        targeted_user = targeted_user[0];

        targeted_user.active == 0 ? targeted_user.active = 1 : targeted_user.active = 0 ;

        let newUser = await users.updateUser(targeted_user);
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"enabled":newUser.active}});
    

        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});




router.post('/updateProfile', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required(),
            fullname: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0) console.log("valid");
        else throw new Error("InvalidUser");

        user = user[0];

        user.fullname = reqinput.fullname;

        let newUser = await users.updateUser(user);
        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"user":{"_id":newUser._id,"fullname":newUser.fullname,"email":newUser.email}}});
    

        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});



router.post('/viewProfile', authenticate,async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    let addresses = req.app.address;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            token: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0) console.log("valid");
        else throw new Error("InvalidUser");

        user = user[0];

        let addr = await addresses.getUserAdresses(user._id);

        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"user":{"_id":user._id,"fullname":user.fullname,"email":user.email,"addresses":addr}}});    

        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }

});


async function addOrder(orders, orderInput) {
    try
    {
        let order = await orders.addOrder(orderInput);
        return order;
    }
    catch(err)
    {
        throw err;
    }
}


//APIs for token

router.post('/refreshToken',async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            refresh_token: Joi.string().min(1).required()
        });
        let result = Joi.validate(reqinput, schema);
        if(result.error != null)
        {
            validationError = result.error.details[0].message;
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);

        if(user.length > 0) console.log("valid");
        else throw new Error("InvalidUser");

        userFound = user[0];
        
        if(userFound.refresh_token == reqinput.refresh_token)
        {
            let email = userFound.email;
            const token = jwt.sign(
                { user_id: userFound._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
                
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"user":{"_id":userFound._id,"fullname":userFound.fullname,"email":userFound.email,"token":token,"refresh_token":userFound.refresh_token}}});
        }
        else
        {
            payload = JSON.stringify({"response":true,'status':200,'error':{'code':604,'description':'Couldnt refresh token'},data:{}});
        }
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }


});



router.post('/invokeToken',async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();
    let users = req.app.users;
    try
    {
        let reqinput = await parseRequest({req: req});

        

        let schema = Joi.object().keys({
            user_id: Joi.string().min(1).required(),
            refresh_token: Joi.string().min(1).required()
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

        await users.invokeToken(reqinput.refresh_token);

        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{"message":"token invoked"}});
        
        res.send(payload);

    }
    
    catch(err)
    {
        errorResponseHandler(err,validationError);
        res.send(payload);
    }


});


module.exports = router;
