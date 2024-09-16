const BOOKING_SERVICE = require("../../Service/Booking/Booking.Service");

class BOOKING_CONTROLLER {
//   async setUserBookingDates(req, res) {
//     try {
//       const userId = req.user_id;
//       const { checkInDate, checkOutDate } = req.body;
//       await setUserBookingDates(userId, checkInDate, checkOutDate);
//       return res
//         .status(200)
//         .json({ message: "Ngày nhận phòng và trả phòng đã được lưu." });
//     } catch (error) {
//       console.error("Error booking room:", error.message);
//       return res.status(500).json({
//         success: false,
//         message: "Error booking room.",
//         error: error.message,
//       });
//     }
//   }

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

  // Đặt phòng từ giỏ hàng
  async bookFromCart(req, res) {
    try {
      const userId = req.user_id;
      const { bookingDetails } = req.body;

      // Gọi hàm bookFromCart
      const booking = await BOOKING_SERVICE.bookFromCart(
        userId,
        bookingDetails
      );

      return res.status(200).json({
        success: true,
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
