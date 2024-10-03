const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_MODEL = require("../../Model/Room/Room.Model");

class BOOKING_SERVICE {
  async bookRoomNow(userId, roomDetails, startDate, endDate) {
    const room = await ROOM_SERVICE.getRoomsById(roomDetails.ROOM_ID);

    if (!room) {
      throw new Error("Phòng không tồn tại.");
    }

    // Tính số ngày ở
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);
    const days = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24); // Tính số ngày

    if (days <= 0) {
      throw new Error("Ngày trả phòng phải lớn hơn ngày nhận phòng.");
    }

    // Tính tổng giá dựa trên số ngày và giá mỗi đêm
    const totalPriceRoom = days * room.PRICE_PERNIGHT;

    // Tạo booking mới
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_ROOMS: [
        {
          ROOM_ID: roomDetails.ROOM_ID,
          START_DATE: checkInDate,
          END_DATE: checkOutDate,
          TOTAL_PRICE_ROOM: totalPriceRoom,
        },
      ],
      TOTAL_PRICE: totalPriceRoom, // Tổng giá cho booking là giá phòng
      STATUS: "NotYetPaid",
      BOOKING_TYPE: "Website", // Loại đặt phòng
      CUSTOMER_PHONE: roomDetails.CUSTOMER_PHONE,
      CUSTOMER_NAME: roomDetails.CUSTOMER_NAME,
      CITIZEN_ID: roomDetails.CITIZEN_ID,
    });

    // Lưu booking vào database
    await booking.save();

    return booking;
  }

  async bookFromCart(userId, bookingData) {
    // Tìm giỏ hàng của người dùng
    const cart = await CART_MODEL.findOne({ USER_ID: userId }).populate(
      "ROOMS.ROOM_ID"
    );
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tính tổng giá tiền cho từng phòng và tổng cộng
    let totalBookingPrice = 0;
    const rooms = await Promise.all(
      cart.ROOMS.map(async (room) => {
        if (!room.ROOM_ID) {
          throw new Error(`Room with ID ${room._id} not found in the database`);
        }

        // Lấy thông tin chi tiết của phòng từ collection "rooms"
        const roomDetails = await ROOM_MODEL.findById(room.ROOM_ID);

        if (!roomDetails) {
          throw new Error(`Room details not found for room ID ${room.ROOM_ID}`);
        }

        // Tính toán giá phòng dựa trên khoảng thời gian giữa START_DATE và END_DATE
        const numberOfNights = Math.ceil(
          (new Date(room.END_DATE) - new Date(room.START_DATE)) /
            (1000 * 60 * 60 * 24)
        );

        const totalPriceForRoom = roomDetails.PRICE_PERNIGHT * numberOfNights;

        // Cộng giá phòng vào tổng giá booking
        totalBookingPrice += totalPriceForRoom;

        return {
          ROOM_ID: room.ROOM_ID._id,
          START_DATE: room.START_DATE,
          END_DATE: room.END_DATE,
          TOTAL_PRICE_FOR_ROOM: totalPriceForRoom,
        };
      })
    );

    // Tạo booking với giá đã tính
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_ROOMS: rooms,
      TOTAL_PRICE: totalBookingPrice,
      STATUS: "NotYetPaid", // Giá trị mặc định
      BOOKING_TYPE: "Website", // Giá trị mặc định
      CUSTOMER_PHONE: bookingData.CUSTOMER_PHONE,
      CUSTOMER_NAME: bookingData.CUSTOMER_NAME,
      CITIZEN_ID: bookingData.CITIZEN_ID,
    });

    await booking.save();

    return booking;
  }

  async updateBookingStatus(bookingId) {
    // Tìm booking dựa trên bookingId
    const booking = await BOOKING_MODEL.findById(bookingId);

    if (!booking) {
      throw new Error("Booking không tồn tại.");
    }

    // Cập nhật trạng thái thành "booked" khi thanh toán thành công
    booking.STATUS = "booked";

    await booking.save();

    return booking;
  }

  // Hàm lấy tất cả các booking của một người dùng
  async getBookingsByUserId(userId) {
    try {
      // Tìm tất cả các booking của người dùng dựa trên USER_ID
      const bookings = await BOOKING_MODEL.find({ USER_ID: userId })
        .populate({
          path: "LIST_ROOMS.ROOM_ID",
          select: "name price", // Lấy thông tin cơ bản của phòng
        })
        .populate({
          path: "LIST_ROOMS.HOTEL_ID",
          select: "name address", // Lấy thông tin cơ bản của khách sạn
        });

      if (!bookings || bookings.length === 0) {
        throw new Error("Không tìm thấy booking nào");
      }

      return bookings;
    } catch (error) {
      console.error("Error in getBookingsByUserId:", error.message);
      throw new Error("Lỗi khi lấy booking của người dùng");
    }
  }
}

module.exports = new BOOKING_SERVICE();
