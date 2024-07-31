const utils = require('../utils/utils');
const { ERROR_MESSEGE, SUCCESS_MESSEGE } = require('../utils/constants');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user.model');
const Address = require('../models/address.model');
const Education = require('../models/education.model');


exports.signUp = async (req, res, next) => {
    if (req.body.email === undefined || req.body.email === '') {
        return res.json({
            status: 0,
            message: 'Email is required.'
        });
    }
    if (req.body.password === undefined || req.body.password === '') {
        return res.json({
            status: 0,
            message: 'Password is required.'
        });
    }
    if (req.body.firstName === undefined || req.body.firstName === '') {
        return res.json({
            status: 0,
            message: 'First name is required.'
        });
    }
    if (req.body.lastName === undefined || req.body.lastName === '') {
        return res.json({
            status: 0,
            message: 'Last name is required.'
        });
    }
    try {
        const user_detail = await User.findOne({ email: req.body.email });
        if (user_detail) {
            return res.json({
                status: 0,
                message: ERROR_MESSEGE.EMAIL_ALREADY_USED
            });
        }
        const user = new User({
            email: req.body.email,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            password: bcrypt.hashSync(req.body.password, saltRounds)
        });

        const user_data = await user.save();
        try {
            user_data.access_token = await utils.generateToken(user_data._id.toString());
            const user_details = await user_data.save();
            const user_detail = await User.findOne(
                { _id: user_details._id },
                {
                    _id: 1,
                    accessToken: '$access_token',
                    profilePic: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                    profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                    firstName: '$first_name',
                    lastName: '$last_name',
                    updatedDate: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: '$updatedAt',
                            timezone: '+05:30' // for indian time
                        }
                    }
                }
            );
            res.json({
                status: 1,
                data: user_detail,
                message: SUCCESS_MESSEGE.REGISTER_SUCCESS
            });
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    };
};

exports.signIn = async (req, res, next) => {
    if (req.body.email === undefined || req.body.email === '') {
        return res.json({
            status: 0,
            message: 'Email is required.'
        });
    }
    if (req.body.password === undefined || req.body.password === '') {
        return res.json({
            status: 0,
            message: 'Password is required.'
        });
    }
    try {
        const user_detail = await User.findOne({ email: req.body.email });
        if (!user_detail) {
            return res.json({
                status: 0,
                message: ERROR_MESSEGE.INVALID_LOGIN_CRED
            });
        }
        const isMatched = await bcrypt.compare(req.body.password, user_detail.password);
        if (!isMatched) {
            return res.json({
                status: 0,
                message: ERROR_MESSEGE.INVALID_LOGIN_CRED
            });
        }
        user_detail.access_token = await utils.generateToken(user_detail._id.toString());
        await user_detail.save();
        const user_details = await User.findOne(
            { _id: user_detail._id },
            {
                _id: 1,
                accessToken: '$access_token',
                profilePic: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                firstName: '$first_name',
                lastName: '$last_name',
                updatedDate: {
                    $dateToString: {
                        format: "%d/%m/%Y %H:%M",
                        date: '$updatedAt',
                        timezone: '+05:30' // for indian time
                    }
                }
            }
        );
        res.json({
            status: 1,
            data: user_details,
            message: SUCCESS_MESSEGE.LOGIN_SUCCESS
        });
    } catch (err) {
        next(err);
    };
};

exports.editProfile = async (req, res, next) => {
    if (req.body.firstName === undefined || req.body.firstName === '') {
        return res.json({
            status: 0,
            message: 'First name is required.'
        });
    }
    if (req.body.lastName === undefined || req.body.lastName === '') {
        return res.json({
            status: 0,
            message: 'Last name is required.'
        });
    }
    try {
        const user_id = req.user_id;
        const user_data = await User.findOne({ _id: user_id });
        var profile_pic = user_data.profile_pic;
        var profile_pic_thumbnail = user_data.profile_pic_thumbnail;
        try {
            if (req.file !== undefined) {
                const file_name1 = 'profilePic_' + Date.now() + path.extname(req.file.originalname);
                const file_name2 = 'profilePicThumbnail_' + Date.now() + path.extname(req.file.originalname);

                const input_file_path = req.file.path;
                const output_file_path = `uploads/${file_name1}`;
                await utils.optimizeImage(input_file_path, output_file_path);
                profile_pic = output_file_path;

                const output_file_path2 = `uploads/${file_name2}`;
                await utils.generateThumbnail(output_file_path, output_file_path2);
                profile_pic_thumbnail = output_file_path2;
            }
            try {
                const updated_user = await User.findOneAndUpdate(
                    { _id: user_data._id },
                    {
                        first_name: req.body.firstName,
                        last_name: req.body.lastName,
                        profile_pic: profile_pic,
                        profile_pic_thumbnail: profile_pic_thumbnail
                    },
                    { new: true }
                );
                const user_details = await User.findOne(
                    { _id: user_data._id },
                    {
                        _id: 1,
                        accessToken: '$access_token',
                        profilePic: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                        profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                        firstName: '$first_name',
                        lastName: '$last_name',
                        updatedDate: {
                            $dateToString: {
                                format: "%d/%m/%Y %H:%M",
                                date: '$updatedAt',
                                timezone: '+05:30' // for indian time
                            }
                        }
                    }
                );
                res.json({
                    status: 1,
                    data: user_details,
                    message: SUCCESS_MESSEGE.PROFILE_UPDATED
                });
          
            } catch (err) {
                next(err);
            }
        } catch (err) {
            next(err);      // if (user_data.profile_pic !== '' && (user_data.profile_pic !== updated_user.profile_pic)) {
                //     utils.remove_file(user_data.profile_pic);
                // }
                // if (user_data.profile_pic_thumbnail !== '' && (user_data.profile_pic_thumbnail !== updated_user.profile_pic_thumbnail)) {
                //     utils.remove_file(user_data.profile_pic_thumbnail);
                // }
        }
    } catch (err) {
        next(err);
    }
};

exports.addAddress = async (req, res, next) => {
    if (req.body.city === undefined || req.body.city === '') {
        return res.json({
            status: 0,
            message: 'City is required.'
        });
    }
    if (req.body.address === undefined || req.body.address === '') {
        return res.json({
            status: 0,
            message: 'Address is required.'
        });
    }
    if (req.body.zipcode === undefined) {
        return res.json({
            status: 0,
            message: 'Zipcode is required.'
        });
    }
    try {
        const user_id = req.user_id;
        const address = new Address({
            user_id: user_id,
            city: req.body.city,
            address: req.body.address,
            zipcode: req.body.zipcode
        });
        const address_data = await address.save();
        res.json({
            status: 1,
            data: address_data
        })
    } catch (err) {
        next(err);
    }
};

exports.addEducation = async (req, res, next) => {
    if (req.body.qualification === undefined || req.body.qualification === '') {
        return res.json({
            status: 0,
            message: 'Qualification is required.'
        });
    }
    if (req.body.year === undefined) {
        return res.json({
            status: 0,
            message: 'Year is required.'
        });
    }
    try {
        const user_id = req.user_id;
        const education_data = await Education.findOne({ user_id: user_id });
        if (education_data) {
            const education_detail = await Education.findOneAndUpdate(
                { _id: education_data._id },
                {
                    qualification: req.body.qualification,
                    institute: req.body.institute,
                    address: req.body.address,
                    year: req.body.year
                },
                { new: true }
            );
            const education_details = await Education.findOne(
                { _id: education_detail._id },
                {
                    _id: 1,
                    qualification: 1,
                    institute: 1,
                    address: 1,
                    year: 1,
                    updatedDate: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: '$updatedAt',
                            timezone: '+05:30' // for indian time
                        }
                    }
                }
            );
            res.json({
                status: 1,
                data: education_details,
                message: 'Education detail added.'
            });
        } else {
            const education = new Education({
                user_id: user_id,
                qualification: req.body.qualification,
                institute: req.body.institute,
                address: req.body.address,
                year: req.body.year
            });
            const education_detail = await education.save();
            const education_details = await Education.findOne(
                { _id: education_detail._id },
                {
                    _id: 1,
                    qualification: 1,
                    institute: 1,
                    address: 1,
                    year: 1,
                    updatedDate: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: '$updatedAt',
                            timezone: '+05:30' // for indian time
                        }
                    }
                }
            );
            res.json({
                status: 1,
                data: education_details,
                message: 'Education detail added.'
            });
        }
    } catch (err) {
        next(err);
    }
};

exports.getEducation = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const education_details = await Education.findOne(
            { user_id: user_id },
            {
                _id: 1,
                qualification: 1,
                institute: 1,
                address: 1,
                year: 1,
                updatedDate: {
                    $dateToString: {
                        format: "%d/%m/%Y %H:%M",
                        date: '$updatedAt',
                        timezone: '+05:30' // for indian time
                    }
                }
            }
        );
        res.json({
            status: 1,
            data: education_details,
            message: 'Education detail added.'
        });

    } catch (err) {
        next(err);
    }
};


//*************/
exports.getUserData = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const user_data = await User.aggregate([
            {
                $lookup: {
                    from: "addresses",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "address"
                }
            },
            // {
            //     $match: {
            //         _id: user_id
            //     }
            // },
            {
                $project: {
                    _id: 1,
                    firstName: '$first_name',
                    lastName: '$last_name',
                    profilePic: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                    profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                    updatedDate: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: '$updatedAt',
                            // timezone: '+05:30' // for indian time
                        }
                    },
                    addressList: {
                        $map: {
                            input: "$address",
                            as: "addr",
                            in: {
                                _id: "$$addr._id",
                                city: "$$addr.city",
                                address: "$$addr.address",
                                zipCode: "$$addr.zipcode"
                            }

                        }
                    }
                }
            }
        ]);
        res.json({
            status: 1,
            data: user_data,
            message: 'User address detail found.'
        });
    } catch (err) {
        next(err);
    }
};

exports.getUserData2 = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const user_data = await User.aggregate([
            {
                $lookup: {
                    from: "addresses",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "address"
                }
            },
            {
                $lookup: {
                    from: "educations",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "education"
                }
            },
            // {
            //     $match: {
            //         _id: user_id
            //     }         
            // },
            {
                $project: {
                    _id: 1,
                    firstName: '$first_name',
                    lastName: '$last_name',
                    profilePic: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                    profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                    updatedDate: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: '$updatedAt',
                            // timezone: '+05:30' // for indian time
                        }
                    },
                    education: {
                        $cond: {
                            if: { $eq: [{ $size: "$education" }, 0] },
                            then: null,
                            else: {
                                _id: { $arrayElemAt: ["$education._id", 0] },
                                qualification: { $arrayElemAt: ["$education.qualification", 0] },
                                institute: { $arrayElemAt: ["$education.institute", 0] },
                                address: { $arrayElemAt: ["$education.address", 0] },
                                // year: { $arrayElemAt: ["$education.year", 0] }
                                year: {
                                    $cond: {
                                        if: { $eq: [{ $arrayElemAt: ["$education.year", 0] }, 2019] },
                                        then: 1,
                                        else: { $arrayElemAt: ["$education.year", 0] }
                                    }
                                }
                            }

                        }
                    },
                    addressList: {
                        $map: {
                            input: "$address",
                            as: "addr",
                            in: {
                                _id: "$$addr._id",
                                city: "$$addr.city",
                                address: "$$addr.address",
                                zipCode: "$$addr.zipcode",
                                // city2:  { $cond: { if: { $ne: ["$$addr.city", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$$addr.city"] }, else: "$$addr.city" } }
                            }
                        }
                    }
                }
            }
        ]);
        res.json({
            status: 1,
            data: user_data,
            message: 'User address detail found.'
        });
    } catch (err) {
        next(err);
    }
};

exports.getUserData3 = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const user_data = await User.aggregate([
            {
                $lookup: {
                    from: "educations",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "educationDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    firstName: '$first_name',
                    lastName: '$last_name',
                    profilePic: { $cond: { if: { $ne: ["$profile_pic_thumbnail", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic_thumbnail"] }, else: "$profile_pic_thumbnail" } },
                    profilePicThumbnail: { $cond: { if: { $ne: ["$profile_pic", ""] }, then: { $concat: [`${process.env.BASE_URL}`, "$profile_pic"] }, else: "$profile_pic" } },
                    educationDetails: {
                        $cond: {
                            if: { "$eq": [{ "$size": "$educationDetails" }, 0] },
                            then: null,
                            else: {
                                _id: { $arrayElemAt: ["$educationDetails._id", 0] },
                                qualification: { $arrayElemAt: ["$educationDetails.qualification", 0] },
                                institute: { $arrayElemAt: ["$educationDetails.institute", 0] },
                                address: { $arrayElemAt: ["$educationDetails.address", 0] },
                                year: { $arrayElemAt: ["$educationDetails.year", 0] },
                            }
                        }
                    }
                }
            }
        ]);
        res.json({
            status: 1,
            data: user_data,
            message: 'User address detail found.'
        });
    } catch (err) {
        next(err);
    }
};