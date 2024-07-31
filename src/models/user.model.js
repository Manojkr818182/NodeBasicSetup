const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        first_name: {
            type: String,
            default: ''
        },
        last_name: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        access_token: {
            type: String,
            default: ''
        },
        profile_pic: {
            type: String,
            default: ''
        },
        profile_pic_thumbnail: {
            type: String,
            default: ''
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
