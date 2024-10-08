const BOOKING_SERVICE = require("../../Service/Booking/Booking.Service");
const CART_SERVICE = require('../../Service/Cart/Cart.Service');

class BOOKING_CONTROLLER {

  // Đặt phòng trực tiếp
  async bookRoomNow(req, res) {
    try {
      const userId = req.user_id;
      const { roomDetails, startDate, endDate } = req.body;

      const booking = await BOOKING_SERVICE.bookRoomNow(
        userId,
        roomDetails,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error("Error booking room:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking room.",
        error: error.message,
      });
    }
  }


  async bookRoomNows(req, res) {
    try {
      console.log(req.body);
      const userId = req.user_id; // Lấy ID người dùng từ request body
      const { roomDetails, roomsDetails } = req.body;

      // Kiểm tra xem là booking 1 phòng hay nhiều phòng
      if (roomDetails) {
        // Nếu là 1 phòng
        const booking = await BOOKING_SERVICE.bookRoomNows(userId, roomDetails, 'Website');
        return res.status(200).json({
          success: true,
          message: 'Đặt phòng thành công!',
          booking
        });
      } else if (roomsDetails) {
        // Nếu là nhiều phòng
        const booking = await BOOKING_SERVICE.bookRoomNows(userId, roomsDetails, 'Website');
        return res.status(200).json({
          success: true,
          message: 'Đặt phòng nhiều phòng thành công!',
          booking
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu phòng không hợp lệ!'
        });
      }
    } catch (error) {
      console.error("Lỗi khi đặt phòng:", error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình đặt phòng',
        error: error.message
      });
    }
  }

  // Đặt phòng từ giỏ hàng
  async bookFromCart(req, res) {
    try {
      const userId = req.user_id;
      const bookingData = req.body;

      // Gọi hàm bookFromCart
      const booking = await BOOKING_SERVICE.bookFromCart(
        userId,
        bookingData
      );

      // Lấy danh sách Room IDs từ booking
      const roomIds = booking.LIST_ROOMS.map(room => room.ROOM_ID);

      // Xóa các phòng đã đặt khỏi giỏ hàng
      await CART_SERVICE.removeBookedRooms(userId, roomIds);

      return res.status(200).json({
        success: true,
        message: "Booking created successfully and rooms removed from cart",
        data: booking,
      });
    } catch (error) {
      console.error("Error booking from cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking from cart.",
        error: error.message,
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { bookingId } = req.body; // Lấy bookingId từ request
  
      // Gọi service để cập nhật trạng thái
      const booking = await BOOKING_SERVICE.updateBookingStatus(bookingId);
  
      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating booking status.",
        error: error.message,
      });
    }
  }
  

  // Lấy tất cả các booking của một user
  async getBookingsByUserId(req, res) {
    try {
      const userId = req.user_id; // Lấy userId từ token hoặc session

      const bookings = await BOOKING_SERVICE.find({ USER_ID: userId });

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error("Error retrieving bookings:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error retrieving bookings.",
        error: error.message,
      });
    }
  }
}

module.exports = new BOOKING_CONTROLLER();
