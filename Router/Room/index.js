const express = require("express");
const router = express.Router();
const ROOM_CONTROLLER  = require('../../Controllers/Room/Room.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

router.post('/createRoom', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.createRoom);


module.exports = router;