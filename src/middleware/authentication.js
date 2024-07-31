const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { ERROR_CODE, ERROR_MESSEGE } = require('../utils/constants');

exports.userAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (err) {
                return res.json({
                    status: ERROR_CODE.INVALID_ACCESS_TOKEN,
                    message: ERROR_MESSEGE.INVALID_ACCESS_TOKEN
                })
            } else {
                try {
                    const user_detail = await User.findOne({ _id: decoded.user_id });
                    if (!user_detail) {
                        return res.json({
                            status: ERROR_CODE.INVALID_ACCESS_TOKEN,
                            message: ERROR_MESSEGE.INVALID_ACCESS_TOKEN
                        });
                    } else {
                        req.user_id = user_detail._id;
                        next();
                    }
                } catch (err) {
                    return res.json({
                        status: ERROR_CODE.INVALID_ACCESS_TOKEN,
                        message: ERROR_MESSEGE.INVALID_ACCESS_TOKEN
                    });
                }
            }
        });
    } catch (err) {
        return res.json({
            status: ERROR_CODE.INVALID_ACCESS_TOKEN,
            message: ERROR_MESSEGE.INVALID_ACCESS_TOKEN
        });
    }
};