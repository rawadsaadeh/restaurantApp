let model;
module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    if (model) return model;
    else model = mongoose.model('Log', new Schema
    ({
        message: String,
        level: String
    }));
    return model;
}