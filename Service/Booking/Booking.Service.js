const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_SERVICE = require("../../Service/Cart/Cart.Service");
const ROOM_SERVICE = require('../../Service/Room/Room.Service');

class BOOKING_SERVICE {
  async bookRoomNow(userId, roomDetails, startDate, endDate) {

    const room = await ROOM_SERVICE.findRoomsById(roomDetails.ROOM_ID);

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

  async bookFromCart(userId, bookingDetails) {
    const cart = await CART_SERVICE.getCartByUserId(userId);
    console.log('Cart retrieved:', cart);

    if (!cart || !cart.LIST_ROOMS || cart.LIST_ROOMS.length === 0) {
      throw new Error("Giỏ hàng rỗng");
    }

    // Chuyển đổi LIST_ROOMS để chỉ chứa các phòng thay vì cả khách sạn
    const mappedRooms = cart.LIST_ROOMS.flatMap(hotel => hotel.ROOMS.map(room => ({
      ROOM_ID: room.ROOM_ID,
      START_DATE: room.START_DATE,
      END_DATE: room.END_DATE,
      TOTAL_PRICE_ROOM: room.TOTAL_PRICE_FOR_ROOM,
    })));

    console.log('Mapped Rooms for booking:', mappedRooms);

    const totalPrice = mappedRooms.reduce((total, room) => total + (room.TOTAL_PRICE_ROOM || 0), 0);

    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_ROOMS: mappedRooms, // Truyền trực tiếp danh sách phòng
      TOTAL_PRICE: totalPrice,
      STATUS: "NotYetPaid",
      BOOKING_TYPE: "Website",
      CUSTOMER_PHONE: bookingDetails.CUSTOMER_PHONE,
      CUSTOMER_NAME: bookingDetails.CUSTOMER_NAME,
      CITIZEN_ID: bookingDetails.CITIZEN_ID,
    });

    await booking.save();

    // Xóa các phòng đã đặt khỏi giỏ hàng
    await CART_SERVICE.removeBookedRooms(userId, mappedRooms.map(room => room.ROOM_ID));

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

  //   async getBookingsByUserId(userId) {
  //     // Tìm tất cả các booking của người dùng dựa trên USER_ID
  //     const bookings = await BOOKING_MODEL.find({ USER_ID: userId });

  //     // Nếu không có booking nào, trả về thông báo
  //     if (!bookings || bookings.length === 0) {
  //       throw new Error("Không tìm thấy booking nào.");
  //     }

  //     return bookings;
  //   }
}

module.exports = new BOOKING_SERVICE();
