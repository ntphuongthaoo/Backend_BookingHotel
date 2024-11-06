const express = require("express");
const router = express.Router();
const ROOM_CONTROLLER  = require('../../Controllers/Room/Room.Controller');
const { verifyToken, verifyTokenAdmin } = require('../../Middleware/verifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const upload = require('../../Config/multerConfig');

router.post('/createRoom', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), upload, ROOM_CONTROLLER.createRoom);
router.post('/deleteRoom/:roomId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.deleteRoom);
router.put('/updateRoom/:roomId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), upload, ROOM_CONTROLLER.updateRoom);
router.post('/findRoomsByHotel/:hotelId', verifyToken, authorizeRoles('ADMIN', 'BRANCH_MANAGER'), ROOM_CONTROLLER.findRoomsByHotel);
router.get('/getRooms/:hotelId', ROOM_CONTROLLER.getRooms);
router.get('/getRoomById/:roomId', ROOM_CONTROLLER.getRoomsById);
router.post('/searchRooms', ROOM_CONTROLLER.searchRooms);
router.post('/AvailableRooms', verifyToken, ROOM_CONTROLLER.getAvailableRooms);
router.get('/getAllRoomsInHotel/:hotelId', ROOM_CONTROLLER.getAllRoomsInHotel);

module.exports = router;