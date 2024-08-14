const express = require("express");
const router = express.Router();
const USER_CONTROLLER  = require('../../Controllers/User/User.controller');
const { verifyToken } = require('../../Middleware/verifyToken');

router.post('/registerUser', USER_CONTROLLER.registerUser);
router.post('/loginUser', USER_CONTROLLER.login);


module.exports = router;