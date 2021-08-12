let model;
module.exports = function(mongoose) {
    if (model) return model;
    else model = mongoose.model('User', new mongoose.Schema
    ({
        role_type: { type: Number, default: 2 }, //1 for admin , 2 for user
        fullname: String,
        email: String,
        password: String,
        refresh_token: String,
        active: { type: Number, default: 1 },
        created: { type: Date, default: Date.now }
    }));
    return model;
}