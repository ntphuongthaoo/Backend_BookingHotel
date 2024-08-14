const HOTEL_MODEL = require('../../Model/Hotel/Hotel.Model')
const HOTEL_SERVICE = require('../../Service/Hotel/Hotel.Service')
const { createHotelValidate } = require('../../Model/Hotel/validate/validateHotel')

class HOTEL_CONTROLLER {
    createHotel = async (req, res) => {
        const payload = req.body;
        const { error, value } = createHotelValidate.validate(payload);

        if (error) {
            const errors = error.details.reduce((acc, current) => {
              acc[current.context.key] = current.message;
              return acc;
            }, {});
            return res.status(400).json({ errors });
        }
        try {
            await HOTEL_SERVICE.createHotel(payload);
            return res.status(200).json({
                success: true,
                message: "Tạo khách sạn thành công!!"
            })

        } catch (err) {
            return res.status(500).json({ errors: "Tạo khách sạn thất bại!!" });
        }
    };

    updateHotel = async (req, res) => {
        try {
            const { id } = req.params;
            const hotelData = req.body;

            const updatedHotel = await HOTEL_SERVICE.updateHotelById(id, hotelData);

            if (updatedHotel) {
                res.status(200).json({ message: 'Khách sạn đã được cập nhật thành công.', data: updatedHotel });
            } else {
                res.status(404).json({ message: 'Khách sạn không tìm thấy.' });
            }

        } catch (err) {
            return res.status(500).json({ message: "Lỗi khi cập nhật khách sạn!!"})
        }
    }
}

module.exports = new HOTEL_CONTROLLER();