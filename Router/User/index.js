const express = require("express");
const router = express.Router();
const userController  = require('../../Controllers/User/User.controller');

router.post('/registerUser', userController .registerUser);

module.exports = router;