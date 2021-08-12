

var mongoose = require('mongoose');
setTimeout(function(){
    mongoose.connect("mongodb://localhost:27017/restaurantDB", { useNewUrlParser: true });
}, 5000);

mongoose.connection.on('connected', () => { console.log('Mongo-> connected'); });

jest.setTimeout(15000);

var psusers = require('../rawFramework/users');
var users = psusers(mongoose);

test('POST user/viewProfile', async () => {
    let res = await getUserProfile("6112c26c08a5721604b8adaa");
    expect(res).toBe(0);
});
  

async function getUserProfile(user_id)
{
    return new Promise(async function(resolve,reject){
        try{
            let user = await users.findUserById(user_id);
            resolve(user.length); 
        }
        catch(err){
            reject(Error("Cannot get data"))
        }
    })
}