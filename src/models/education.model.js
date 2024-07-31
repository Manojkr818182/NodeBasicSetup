const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const educationSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        qualification: {
            type: String,
            default: ''
        },
        institute: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        year: {
            type: Number,
            default: null
        },
    },
    {
        timestamps: true
    }
);

const Education = mongoose.model('education', educationSchema);

module.exports = Education;
