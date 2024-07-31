const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { userAuth } = require('../middleware/authentication');
const user_controller = require('../controller/user_controller');


router.post('/signUp', user_controller.signUp);
router.post('/signIn', user_controller.signIn);
router.post('/editProfile', userAuth, upload.single('profilePic'), user_controller.editProfile);
router.post('/addAddress', userAuth, user_controller.addAddress);

router.post('/addEducation', userAuth, user_controller.addEducation);
router.get('/getEducation', userAuth, user_controller.getEducation);

router.get('/getUserData', userAuth, user_controller.getUserData3);
 

module.exports = router;