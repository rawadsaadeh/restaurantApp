function errorResponseHandler(err , validationError) {
    if(err.message == "ValidationError")
    {
        console.log(validationError);
        payload =JSON.stringify(
            {"response":true,
            "status":500,
            "data":{},
            "error":{
                "code":1007,
                "description":"Missing arguments:"+validationError
            }}
        );                    
    }   
    else if(err.message == "InvalidUser")
    {
        payload = JSON.stringify(
            {"response":true,
            "status":500,
            "data":{},
            "error":{
                "code":1010,
                "description":"Invalid User"
            }}
        );                    
    }    
    else
    {
        payload = JSON.stringify(
            {"response":true,
            "status":500,
            "data":{},
            "error":{
                "code":666,
                "description":"Internal server error"
            }}
        );
    }

    return payload;
}
module.exports = errorResponseHandler;