exports.ERROR_CODE = {
    SERVER_ERROR: 0,
    INVALID_ACCESS_TOKEN: 4,
};

exports.ERROR_MESSEGE = {
    SERVER_ERROR: 'Something went wrong, Please try again later.',
    INVALID_LOGIN_CRED: 'Invalid login credential.',
    INVALID_ACCESS_TOKEN: 'Invalid access token.',
    EMAIL_ALREADY_USED: 'Email address already exists.',
};

exports.SUCCESS_MESSEGE = {
    REGISTER_SUCCESS: 'Registered successfully.',
    LOGIN_SUCCESS: 'Login successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    LOGOUT_SUCCESS: 'Logout successfully.',
   

    HELLO: (name) => {
        return `Hello! ${name}.`
    },
};