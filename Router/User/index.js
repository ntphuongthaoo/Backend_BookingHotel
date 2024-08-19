const express = require("express");
const router = express.Router();
const USER_CONTROLLER  = require('../../Controllers/User/User.controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');

router.post('/registerUser', USER_CONTROLLER.registerUser);
router.post('/verifyOTPAndActivateUser', USER_CONTROLLER.verifyOTPAndActivateUser);
router.post('/forgotPassword', USER_CONTROLLER.forgotPassword);
router.post('/resendOTP', USER_CONTROLLER.ResendOTP);
router.post('/resetPassword', USER_CONTROLLER.resetPassword);
router.post('/loginUser', USER_CONTROLLER.login);
router.get('/getUsers',verifyToken,USER_CONTROLLER.getUsers);
router.post('/blockUser', verifyTokenAdmin, USER_CONTROLLER.blockUser);



module.exports = router;