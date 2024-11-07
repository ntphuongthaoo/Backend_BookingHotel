const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const USER_MODEL = require("../../Model/User/User.Model");
const MAIL_QUEUE = require("../../Utils/sendMail");
const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");
const mongoose = require("mongoose");

class BOOKING_SERVICE {
  async bookRoomNows(
    userId,
    roomsDetails,
    bookingType = "Website",
    airportPickup = false
  ) {
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
      if (!user || !user.EMAIL)
        throw new Error("Không tìm thấy người dùng hoặc email không tồn tại");

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
      if (status === "Booked") {
        const emailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
    <div style="text-align: center; padding: 10px 0; background-color: #6d4c41; color: white; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">Xác Nhận Đặt Phòng</h1>
    </div>
    
    <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px; color: #333;">
        Xin chào <strong>${user.FULLNAME}</strong>,
      </p>
      <p style="font-size: 16px; color: #333;">
        Chúc mừng bạn đã đặt phòng thành công với mã đơn hàng <strong>${bookingId}</strong>. Chi tiết đơn hàng như sau:
      </p>
      <ul style="list-style-type: none; padding: 0; font-size: 16px; color: #333;">
        <li style="margin-bottom: 8px;">
          <strong>Tên khách hàng:</strong> ${booking.CUSTOMER_NAME}
        </li>
        <li style="margin-bottom: 8px;">
          <strong>Thời gian đặt phòng:</strong> ${booking.LIST_ROOMS[0].START_DATE} - ${booking.LIST_ROOMS[0].END_DATE}
        </li>
        <li style="margin-bottom: 8px;">
          <strong>Tổng tiền:</strong> ${booking.TOTAL_PRICE} VND
        </li>
      </ul>
      
      <p style="font-size: 16px; color: #333;">
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! Chúng tôi mong muốn đem lại trải nghiệm tuyệt vời cho bạn.
      </p>
      
      // <div style="text-align: center; margin-top: 30px;">
      //   <a href="https://yourwebsite.com" style="text-decoration: none; padding: 10px 20px; background-color: #6d4c41; color: white; font-size: 16px; border-radius: 5px;">
      //     Quay về trang web
      //   </a>
      // </div>
    </div>
  </div>
`;

        // Đưa email vào hàng đợi
        await MAIL_QUEUE.enqueue({
          email: user.EMAIL,
          otp: "", // Không cần OTP cho xác nhận booking
          otpType: "BookingConfirmation",
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
    const bookings = await BOOKING_MODEL.find({ USER_ID: userId })
      .populate({
        path: "LIST_ROOMS.ROOM_ID",
        populate: {
          path: "HOTEL_ID", // Lấy thông tin khách sạn từ HOTEL_ID trong Room
          select: "NAME ADDRESS",
        },
        select:
          "ROOM_NUMBER TYPE FLOOR PRICE_PERNIGHT IMAGES CUSTOM_ATTRIBUTES",
      })
      .lean();

    if (!bookings || bookings.length === 0) {
      throw new Error("Không tìm thấy booking nào");
    }

    return bookings;
  }

  async getAllBookings(page, limit, hotelId, role) {
    const skip = (page - 1) * limit;
    let query = {};

    // Chỉ thêm điều kiện lọc `hotelId` nếu là nhân viên
    if (hotelId && role !== "ADMIN") {
      const roomIds = await ROOM_MODEL.find({ HOTEL_ID: hotelId }).distinct(
        "_id"
      );
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

  async cancelBooking(bookingId) {
    const booking = await BOOKING_MODEL.findById(bookingId);
    if (!booking) {
      throw new Error("Không tìm thấy đặt phòng.");
    }

    booking.STATUS = "Canceled";
    await booking.save();

    return booking;
  }

  async getRevenue(
    timeFrame,
    selectedDate,
    selectedMonth,
    selectedYear,
    hotelId
  ) {
    // Lấy danh sách các khách sạn
    const hotels = await HOTEL_MODEL.find({
      STATE: true,
      IS_DELETED: false,
    }).lean();

    // Tạo mảng doanh thu cho tất cả các khách sạn hoặc chỉ khách sạn có `hotelId`
    const hotelRevenues = hotels
      .filter((hotel) => !hotelId || hotel._id.toString() === hotelId)
      .map((hotel) => ({
        hotelId: hotel._id.toString(),
        hotelName: hotel.NAME,
        revenue: timeFrame === "day" ? {} : Array(12).fill(0),
      }));

    // Xác định điều kiện `$match` ban đầu
    const matchStage = { STATUS: "Booked", $expr: { $and: [] } };

    // Thêm điều kiện lọc cho năm
    if (selectedYear) {
      matchStage.$expr.$and.push({
        $eq: [{ $year: "$createdAt" }, parseInt(selectedYear)],
      });
    }

    // Thêm điều kiện lọc cho tháng
    if (timeFrame === "month" && selectedMonth) {
      matchStage.$expr.$and.push({
        $eq: [{ $month: "$createdAt" }, parseInt(selectedMonth)],
      });
    }

    // Thêm điều kiện lọc cho ngày
    if (timeFrame === "day" && selectedDate && selectedMonth) {
      matchStage.$expr.$and.push(
        { $eq: [{ $dayOfMonth: "$createdAt" }, parseInt(selectedDate)] },
        { $eq: [{ $month: "$createdAt" }, parseInt(selectedMonth)] }
      );
    }

    // Aggregation pipeline để lấy dữ liệu doanh thu
    const bookings = await BOOKING_MODEL.aggregate([
      { $match: matchStage },
      { $unwind: "$LIST_ROOMS" },
      {
        $lookup: {
          from: "rooms",
          localField: "LIST_ROOMS.ROOM_ID",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
      ...(hotelId
        ? [
            {
              $match: { "room.HOTEL_ID": new mongoose.Types.ObjectId(hotelId) },
            },
          ]
        : []),
      {
        $group: {
          _id: {
            day: timeFrame === "day" ? { $dayOfMonth: "$createdAt" } : null,
            month: timeFrame !== "year" ? { $month: "$createdAt" } : null,
            year: { $year: "$createdAt" },
            hotelId: { $toString: "$room.HOTEL_ID" },
          },
          totalRevenue: { $sum: "$LIST_ROOMS.TOTAL_PRICE_FOR_ROOM" },
        },
      },
    ]);

    bookings.sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year; // So sánh năm
      }
      if (a._id.month !== b._id.month) {
        return a._id.month - b._id.month; // So sánh tháng
      }
      return a._id.day - b._id.day; // So sánh ngày
    });

    // Tính tổng doanh thu theo khung thời gian cho từng khách sạn
    bookings.forEach((booking) => {
      const hotel = hotelRevenues.find(
        (h) => h.hotelId === booking._id.hotelId
      );

      if (hotel) {
        if (timeFrame === "day") {
          const dayKey = `${booking._id.year}-${booking._id.month}-${booking._id.day}`;
          hotel.revenue[dayKey] =
            (hotel.revenue[dayKey] || 0) + booking.totalRevenue;
        } else if (timeFrame === "month") {
          const month = booking._id.month - 1;
          hotel.revenue[month] += booking.totalRevenue;
        } else if (timeFrame === "year") {
          hotel.revenue[0] += booking.totalRevenue;
        }
      }
    });

    // Tổng hợp doanh thu cho tất cả các khách sạn theo khung thời gian
    let totalRevenue = 0;
    if (timeFrame === "day") {
      const dailyRevenue = {};
      hotelRevenues.forEach((hotel) => {
        for (const [day, revenue] of Object.entries(hotel.revenue)) {
          dailyRevenue[day] = (dailyRevenue[day] || 0) + revenue;
        }
      });
      totalRevenue = Object.values(dailyRevenue).reduce(
        (acc, curr) => acc + curr,
        0
      );
      return { totalRevenue, dailyRevenue, hotelRevenues };
    } else if (timeFrame === "month") {
      const monthlyRevenue = Array(12).fill(0);
      hotelRevenues.forEach((hotel) => {
        hotel.revenue.forEach((revenue, index) => {
          monthlyRevenue[index] += revenue;
        });
      });
      totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr, 0);
      return { totalRevenue, monthlyRevenue, hotelRevenues };
    } else if (timeFrame === "year") {
      const yearlyRevenue = hotelRevenues.reduce(
        (acc, hotel) => acc + hotel.revenue[0],
        0
      );
      return {
        totalRevenue: yearlyRevenue,
        yearlyRevenue: [yearlyRevenue],
        hotelRevenues,
      };
    }
  }

  async getBookingStatusData({
    timeFrame,
    selectedYear,
    selectedMonth,
    selectedDate,
    hotelId,
  }) {
    const matchStage = { $match: {} };

    // Điều kiện cho khung thời gian theo ngày (bao gồm ngày, tháng, năm và giờ UTC)
    if (timeFrame === "day" && selectedDate && selectedMonth && selectedYear) {
      matchStage.$match.createdAt = {
        $gte: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T00:00:00.000Z`
        ),
        $lt: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T23:59:59.999Z`
        ),
      };
    } else if (timeFrame === "month" && selectedYear && selectedMonth) {
      matchStage.$match.createdAt = {
        $gte: new Date(`${selectedYear}-${selectedMonth}-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-${selectedMonth}-31T23:59:59.999Z`),
      };
    } else if (timeFrame === "year" && selectedYear) {
      matchStage.$match.createdAt = {
        $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
      };
    }

    // Pipeline tiếp tục với lookup và group
    const bookingStatusData = await BOOKING_MODEL.aggregate([
      matchStage,
      { $unwind: "$LIST_ROOMS" },
      {
        $lookup: {
          from: "rooms",
          localField: "LIST_ROOMS.ROOM_ID",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
      ...(hotelId
        ? [
            {
              $match: { "room.HOTEL_ID": new mongoose.Types.ObjectId(hotelId) },
            },
          ]
        : []),
      {
        $group: {
          _id: {
            status: "$STATUS",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          successfulCount: {
            $sum: { $cond: [{ $eq: ["$_id.status", "Booked"] }, "$count", 0] },
          },
          canceledCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "Canceled"] }, "$count", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return bookingStatusData;
  }
}

module.exports = new BOOKING_SERVICE();
