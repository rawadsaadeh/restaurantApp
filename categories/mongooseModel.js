let model;
module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    if (model) return model;
    else model = mongoose.model('Category', new Schema
    ({
        name: {type: String , index: { unique: true } },
        created: { type: Date, default: Date.now },
        image: { type: String, default: "" }
    }));
    return model;
}