const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const USER_MODEL = require("../../Model/User/User.Model");
const MAIL_QUEUE = require("../../Utils/sendMail");

class BOOKING_SERVICE {
  async bookRoomNows(userId, roomsDetails, bookingType = "Website", airportPickup = false) {
    let listRooms = [];
    let totalPrice = 0;
    const airportPickupPrice = 200000; // Giá cố định cho dịch vụ đưa rước sân bay
  
    // Kiểm tra nếu chỉ có một phòng (object) hoặc nhiều phòng (array)
    const isSingleRoom = !Array.isArray(roomsDetails);
  
    if (isSingleRoom) {
      // Trường hợp chỉ có một phòng
      roomsDetails = [roomsDetails]; // Chuyển object thành mảng để xử lý dễ hơn
    }
  
    for (const roomDetails of roomsDetails) {
      const roomId = roomDetails.roomId || roomDetails.ROOM_ID;
      const room = await ROOM_SERVICE.getRoomsById(roomId);
  
      if (!room) {
        throw new Error("Phòng không tồn tại.");
      }
  
      // Tính số ngày ở
      const checkInDate = new Date(roomDetails.startDate);
      const checkOutDate = new Date(roomDetails.endDate);
      const days = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24); // Tính số ngày ở
  
      if (days <= 0) {
        throw new Error("Ngày trả phòng phải lớn hơn ngày nhận phòng.");
      }
  
      // Tính tổng giá cho từng phòng
      const totalPriceRoom = days * room.PRICE_PERNIGHT;
  
      // Thêm phòng vào danh sách phòng trong booking
      listRooms.push({
        ROOM_ID: roomId,
        START_DATE: checkInDate,
        END_DATE: checkOutDate,
        TOTAL_PRICE_FOR_ROOM: totalPriceRoom,
      });
  
      // Cộng tổng giá vào tổng giá booking
      totalPrice += totalPriceRoom;
    }
  
    // Nếu dịch vụ đưa rước sân bay được chọn, thêm giá dịch vụ vào tổng giá
    if (airportPickup) {
      totalPrice += airportPickupPrice;
    }
  
    // Tạo booking mới với thông tin phòng
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_ROOMS: listRooms, // Danh sách các phòng đã đặt
      TOTAL_PRICE: totalPrice, // Tổng giá cho tất cả các phòng
      STATUS: "NotYetPaid",
      BOOKING_TYPE: bookingType, // Loại đặt phòng (ví dụ: Website)
      CUSTOMER_PHONE: roomsDetails[0].CUSTOMER_PHONE, // Thông tin khách hàng (lấy từ phòng đầu tiên)
      CUSTOMER_NAME: roomsDetails[0].CUSTOMER_NAME,
      CITIZEN_ID: roomsDetails[0].CITIZEN_ID,
      AIRPORT_PICKUP: airportPickup, // Lưu thông tin dịch vụ đưa rước sân bay
    });
  
    // Lưu booking vào database
    await booking.save();
  
    return booking;
  }
  

  async getBookingHistoryByUserId(userId) {
    const bookings = await BOOKING_MODEL.find({ USER_ID: userId });
    return bookings;
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
      STATUS: "NotYetPaid",
      BOOKING_TYPE: "Website",
      CUSTOMER_PHONE: bookingData.CUSTOMER_PHONE,
      CUSTOMER_NAME: bookingData.CUSTOMER_NAME,
      CITIZEN_ID: bookingData.CITIZEN_ID,
    });

    await booking.save();

    return booking;
  }

  // async updateBookingStatus(bookingId) {
  //   // Tìm booking dựa trên bookingId
  //   const booking = await BOOKING_MODEL.findById(bookingId);

  //   if (!booking) {
  //     throw new Error("Booking không tồn tại.");
  //   }

  //   // Cập nhật trạng thái thành "booked" khi thanh toán thành công
  //   booking.STATUS = "booked";

  //   await booking.save();

  //   return booking;
  // }

  // Cập nhật trạng thái đơn đặt phòng và trạng thái phòng
  async updateBookingStatus({ bookingId, status }) {
    try {
      // Tìm booking bằng ID
      const booking = await BOOKING_MODEL.findById(bookingId);
      if (!booking) throw new Error("Không tìm thấy đơn đặt phòng");
  
      // Lấy thông tin người dùng dựa trên USER_ID từ booking
      const user = await USER_MODEL.findById(booking.USER_ID);
      if (!user || !user.EMAIL) throw new Error("Không tìm thấy người dùng hoặc email không tồn tại");
  
      // Cập nhật trạng thái của đơn đặt phòng
      booking.STATUS = status;
      await booking.save();
  
      // Cập nhật trạng thái phòng trong LIST_ROOMS của đơn đặt phòng
      for (let room of booking.LIST_ROOMS) {
        await this.updateRoomAvailability(
          room.ROOM_ID,
          room.START_DATE,
          room.END_DATE
        );
      }
  
      // Gửi email xác nhận nếu trạng thái là 'Booked'
      if (status === 'Booked') {
        const emailContent = `
          <h2>Xin chào ${user.FULLNAME},</h2>
          <p>Chúc mừng bạn đã đặt phòng thành công với mã đơn hàng ${bookingId}. Chi tiết đơn hàng như sau:</p>
          <ul>
            <li>Tên khách hàng: ${booking.CUSTOMER_NAME}</li>
            <li>Thời gian đặt phòng: ${booking.LIST_ROOMS[0].START_DATE} - ${booking.LIST_ROOMS[0].END_DATE}</li>
            <li>Tổng tiền: ${booking.TOTAL_PRICE} VND</li>
          </ul>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        `;
  
        // Đưa email vào hàng đợi
        await MAIL_QUEUE.enqueue({
          email: user.EMAIL,
          otp: '', // Không cần OTP cho xác nhận booking
          otpType: 'BookingConfirmation',
          content: emailContent,
        });
      }
  
      return {
        statusCode: 200,
        msg: `Trạng thái booking đã được cập nhật thành ${status}`,
        data: booking,
        user,
      };
    } catch (error) {
      return {
        statusCode: 500,
        msg: "Có lỗi xảy ra khi cập nhật trạng thái booking",
        error: error.message,
      };
    }
  }

  // Cập nhật AVAILABILITY của các phòng đã đặt
  async updateRoomAvailability(roomId, startDate, endDate) {
    try {
      // Tìm phòng bằng ID
      const room = await ROOM_MODEL.findById(roomId);
      if (!room) throw new Error("Không tìm thấy phòng");

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Cập nhật các ngày trong AVAILABILITY của phòng
      room.AVAILABILITY = room.AVAILABILITY.map((availability) => {
        const availabilityDate = new Date(availability.DATE);
        if (availabilityDate >= start && availabilityDate <= end) {
          availability.AVAILABLE = false;
        }
        return availability;
      });

      // Lưu các thay đổi
      await room.save();
    } catch (error) {
      throw new Error(`Có lỗi xảy ra khi cập nhật phòng: ${error.message}`);
    }
  }

  // Hàm lấy tất cả các booking của một người dùng
  async getBookingHistory(userId) {
    const bookings = await BOOKING_MODEL.find({ USER_ID: userId }).populate({
      path: "LIST_ROOMS.ROOM_ID",
      populate: {
        path: "HOTEL_ID", // Lấy thông tin khách sạn từ HOTEL_ID trong Room
        select: "NAME",
      },
      select: "ROOM_NUMBER TYPE FLOOR PRICE_PERNIGHT IMAGES CUSTOM_ATTRIBUTES",
    });

    if (!bookings || bookings.length === 0) {
      throw new Error("Không tìm thấy booking nào");
    }

    return bookings;
  }

  async getAllBookings(page, limit, hotelId, role) {
    const skip = (page - 1) * limit;
    let query = {};
  
    // Chỉ thêm điều kiện lọc `hotelId` nếu là nhân viên
    if (hotelId && role !== 'ADMIN') {
      const roomIds = await ROOM_MODEL.find({ HOTEL_ID: hotelId }).distinct("_id");
      query["LIST_ROOMS.ROOM_ID"] = { $in: roomIds };
    }
  
    const bookings = await BOOKING_MODEL.find(query)
      .populate({
        path: "LIST_ROOMS.ROOM_ID",
        populate: { path: "HOTEL_ID", select: "NAME ADDRESS" },
      })
      .populate("USER_ID")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
    const totalBookings = await BOOKING_MODEL.countDocuments(query);
  
    return { bookings, totalBookings };
  }

  async cancelBooking (bookingId) {
    const booking = await BOOKING_MODEL.findById(bookingId);
    if (!booking) {
      throw new Error('Không tìm thấy đặt phòng.');
    }

    booking.STATUS = 'Canceled';
    await booking.save();

    return booking;
  }
  
}

module.exports = new BOOKING_SERVICE();
