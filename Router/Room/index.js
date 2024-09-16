const express = require("express");
const router = express.Router();
const ROOM_CONTROLLER  = require('../../Controllers/Room/Room.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const upload = require('../../Config/multerConfig');

router.post('/createRoom', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), upload.array('images', 10), ROOM_CONTROLLER.createRoom);
router.post('/deleteRoom/:roomId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.deleteRoom);
router.post('/updateRoom/:roomId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.updateRoom);
router.post('/findRoomsByHotel/:hotelId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.findRoomsByHotel);
router.post('/listAvailableRooms', verifyToken, ROOM_CONTROLLER.listAvailableRooms);
router.get('/getAllRoomsInHotel/:hotelId', verifyToken, ROOM_CONTROLLER.getAllRoomsInHotel);
router.get('/searchRooms', verifyToken, ROOM_CONTROLLER.searchRooms);

module.exports = router;