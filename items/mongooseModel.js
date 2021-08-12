let model;
module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    if (model) return model;
    else model = mongoose.model('Item', new Schema
    ({
        name: {type: String , index: { unique: true } },
        price: Number,
        is_available: { type: Number, default: 1 },
        category_id: Schema.ObjectId,
        created: { type: Date, default: Date.now },
        image: { type: String, default: "" }
    }));
    return model;
}