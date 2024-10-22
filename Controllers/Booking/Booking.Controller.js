const BOOKING_SERVICE = require("../../Service/Booking/Booking.Service");
const CART_SERVICE = require("../../Service/Cart/Cart.Service");
const ROOM_MODEL = require("../../Model/Room/Room.Model")

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
      const userId = req.user_id; // Lấy ID người dùng từ request
      const { roomDetails, roomsDetails, airportPickup } = req.body; // Lấy thêm biến airportPickup
  
      // Kiểm tra xem là booking 1 phòng hay nhiều phòng
      if (roomDetails) {
        // Nếu là 1 phòng
        const booking = await BOOKING_SERVICE.bookRoomNows(
          userId,
          roomDetails,
          "Website",
          airportPickup // Truyền biến airportPickup vào service
        );
        await CART_SERVICE.removeBookedRooms(userId, [roomDetails.ROOM_ID]);
        return res.status(200).json({
          success: true,
          message: "Đặt phòng thành công!",
          booking,
        });
      } else if (roomsDetails) {
        // Nếu là nhiều phòng
        const booking = await BOOKING_SERVICE.bookRoomNows(
          userId,
          roomsDetails,
          "Website",
          airportPickup // Truyền biến airportPickup vào service
        );
        const roomIds = roomsDetails.map((room) => room.ROOM_ID);
  
        // Xóa các phòng khỏi giỏ hàng sau khi đặt thành công
        await CART_SERVICE.removeBookedRooms(userId, roomIds);
        return res.status(200).json({
          success: true,
          message: "Đặt phòng nhiều phòng thành công!",
          booking,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu phòng không hợp lệ!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi đặt phòng:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi trong quá trình đặt phòng",
        error: error.message,
      });
    }
  }
  
  async getBookingHistory(req, res) {
    const userId = req.user_id;
    try {
      // Lấy tất cả các booking của người dùng, populate thông tin phòng và khách sạn
      const bookings = await BOOKING_SERVICE.getBookingHistory(userId);

      // Nhóm các phòng theo hotelId trong từng booking
      const formattedBookings = bookings.map((booking) => {
        const hotelGroups = {};

        // Nhóm các phòng theo hotelId
        booking.LIST_ROOMS.forEach((room) => {
          const hotelId = room.ROOM_ID.HOTEL_ID._id.toString(); // Lấy hotelId
          if (!hotelGroups[hotelId]) {
            hotelGroups[hotelId] = {
              hotelName: room.ROOM_ID.HOTEL_ID.name,
              hotelAddress: room.ROOM_ID.HOTEL_ID.address,
              rooms: [],
            };
          }
          hotelGroups[hotelId].rooms.push(room); // Thêm phòng vào nhóm theo hotelId
        });

        return {
          ...booking._doc, // Giữ nguyên các thuộc tính của booking
          hotels: Object.values(hotelGroups), // Gộp các nhóm phòng theo hotelId
        };
      });
      return res.status(200).json({
        success: true,
        formattedBookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi trong quá trình đặt phòng",
        error: error.message,
      });
    }
  }
  // Đặt phòng từ giỏ hàng
  async bookFromCart(req, res) {
    try {
      const userId = req.user_id;
      const bookingData = req.body;

      // Gọi hàm bookFromCart
      const booking = await BOOKING_SERVICE.bookFromCart(userId, bookingData);

      // Lấy danh sách Room IDs từ booking
      const roomIds = booking.LIST_ROOMS.map((room) => room.ROOM_ID);

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
      // Lấy dữ liệu từ body request
      const { bookingId, status } = req.body;

      // Kiểm tra nếu không có bookingId hoặc status
      if (!bookingId || !status) {
        return res.status(400).json({
          statusCode: 400,
          msg: "Vui lòng cung cấp đầy đủ thông tin bookingId và status",
        });
      }

      // Gọi hàm updateBookingStatus từ service
      const response = await BOOKING_SERVICE.updateBookingStatus({ bookingId, status });

      // Kiểm tra kết quả trả về từ service
      if (response.statusCode === 200) {
        return res.status(200).json(response);
      } else {
        return res.status(500).json(response);
      }
    } catch (error) {
      // Bắt lỗi và trả về lỗi
      return res.status(500).json({
        statusCode: 500,
        msg: "Có lỗi xảy ra",
        error: error.message,
      });
    }
  }

  async getAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const hotelId = req.query.hotelId;
      const role = req.user.role; // Lấy vai trò từ user đã được xác thực
  
      const { bookings, totalBookings } = await BOOKING_SERVICE.getAllBookings(
        page,
        limit,
        hotelId,
        role
      );
  
      res.status(200).json({
        success: true,
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách đặt phòng.",
        error: error.message,
      });
    }
  }
  
  
  async cancelBooking (req, res) {
    try {
      const { bookingId } = req.params;
  
      const updatedBooking = await BOOKING_SERVICE.cancelBooking(bookingId);
  
      res.status(200).json({
        success: true,
        message: 'Đặt phòng đã được hủy.',
        booking: updatedBooking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Không thể hủy đặt phòng.',
        error: error.message,
      });
    }
  }
}

module.exports = new BOOKING_CONTROLLER();
