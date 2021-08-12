function login(email,password) {
    let loginObj = {};
    loginObj.email = email;
    loginObj.password = password;
    return loginObj;
}
module.exports = login;