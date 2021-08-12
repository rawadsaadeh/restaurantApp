let model;
module.exports = function(mongoose) {
    let Schema = mongoose.Schema;

    let pointSchema = new mongoose.Schema({
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    });

    if (model) return model;
    else model = mongoose.model('Restaurant', new Schema
    ({
        name: {type: String , index: { unique: true } },
        created: { type: Date, default: Date.now },
        location: {
            type: pointSchema,
            index: '2dsphere'
        }
    }));
    return model;
}