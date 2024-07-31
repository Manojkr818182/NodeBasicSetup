const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        city: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        zipcode: {
            type: Number,
            default: null
        },
    },
    {
        timestamps: true
    }
);

const Address = mongoose.model('address', addressSchema);

module.exports = Address;
