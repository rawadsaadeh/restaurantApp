
module.exports = function() {
    return {
        objToString: function(obj) {
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object') {
                  return toString(obj[key]);
                }
                
                obj[key] = '' + obj[key];
              });
              
              return obj;
        }
    }
}