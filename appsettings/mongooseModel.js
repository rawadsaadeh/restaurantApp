let model;
module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    if (model) return model;
    else model = mongoose.model('Setting', new Schema
    ({
        setting_key: String ,
        setting_value: String,
        setting_type: String,
        created: { type: Date, default: Date.now }
    }));
    return model;
}