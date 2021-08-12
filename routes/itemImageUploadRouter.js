var express = require('express');
var router = express.Router();
const fs = require('fs');
const jwt = require("jsonwebtoken");
const path = require('path');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.IMAGES_FOLDER_LOCATION)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });
const errorResponseHandler = require("../utils/errorResponseHandler");


router.post('', upload.single('file'), async function(req, res){
    let validationError = "";
    const { parseRequest } = require('../utils/requestHelpers')();

    let items = req.app.items;
    let users = req.app.users;
    try
    {
        req.body = req.body.data;
        let reqinput = await parseRequest({req: req});
        let id = reqinput.item_id || "";
        let token = reqinput.token || "";
        let user_id = reqinput.user_id || "";
        let path = process.env.IMAGES_FOLDER_LOCATION_FULL_PATH+"";
        let filename = path+req.file.filename;

        try{
            jwt.verify(token, process.env.TOKEN_KEY);
        }
        catch (err) {
            fs.unlinkSync(filename);
            return res.send(JSON.stringify({"response":true,status: 401, data: {}, 'error': {"code":403,"description":"Invalid token"}}));
        }

        if(id == "" || token == "" || user_id == "")
        {
            throw new Error("ValidationError");
        }

        let user = await users.findUserById(reqinput.user_id);
        if(user.length > 0 && user[0].role_type == 1) console.log("valid");
        else throw new Error("InvalidUser");

        let item = await items.findItemById(id);

        item = item[0];

        item.image = filename;

        let newitem = await items.updateItem(item);

        payload = JSON.stringify({"response":true,'status':200,'error':{'code':0,'description':''},data:{item:newitem}});
        res.send(payload);
    }
    catch(err){
        errorResponseHandler(err,validationError);
        res.send(payload);
    }
});


module.exports = router;
