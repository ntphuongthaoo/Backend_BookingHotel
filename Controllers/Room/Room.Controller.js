const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_VALIDATED = require("../../Model/Room/validate/validateRoom");

class ROOM_CONTROLLER {
    async createRoom(req, res) {
        try {
            const { error, value } = ROOM_VALIDATED.createRoom.validate(req.body);
            if (error) {
                const errors = error.details.reduce((acc, current) => {
                    acc[current.context.key] = current.message;
                    return acc;
                }, {});
                return res.status(400).json({ errors });
            }

            const newRoom = await ROOM_SERVICE.createRoom(value);
            return res.status(201).json({ 
                success: true, 
                message: "Tạo phòng thành công!!",
                data: newRoom 
            }); 
        } catch (err) {
            console.error('Error creating room:', err);
            return res.status(500).json({ success: false, message: 'Tạo phòng không thành công!!', err: err.message }); // Xử lý lỗi
        }
      }

}

module.exports = new ROOM_CONTROLLER();