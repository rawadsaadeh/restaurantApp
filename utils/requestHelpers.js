
module.exports = function() {
    return {
        parseRequest: function(opts) {
            return _parsePayload(opts);
        }
    }
}

async function _parsePayload(opts) {
    const {req} = opts;
    let parsed = {};
    try {
        payload = decodeURIComponent(req.body.toString());
        parsed = JSON.parse(payload);
    } catch(err) {
        throw err;
    }
    
    return parsed;
}