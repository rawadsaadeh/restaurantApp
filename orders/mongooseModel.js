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
    else model = mongoose.model('Order', new Schema
    ({
        items: [],
        is_pending: { type: Number, default: 1 },
        is_approved: { type: Number, default: 0 },
        is_cancelled: { type: Number, default: 0 },
        order_location:{
            type: pointSchema,
            index: '2dsphere'
        },
        ordered_by: Schema.ObjectId,
        branch_id: Schema.ObjectId,
        created: { type: Date, default: Date.now }
    }));
    return model;
}