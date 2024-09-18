const CART_MODEL = require("../../Model/Cart/Cart.Model");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");
const mongoose = require("mongoose");

class CART_SERVICE {
  async createCart(userId) {
    const newCart = new CART_MODEL({
      USER_ID: userId,
      ROOMS: [],
    });

    await newCart.save();
    return newCart;
  }

  async addRoomToCart(userId, roomId, startDate, endDate) {
    // Tìm giỏ hàng của người dùng
    let cart = await CART_MODEL.findOne({ USER_ID: userId });

    // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
    if (!cart) {
      cart = await this.createCart(userId);
    }

    // Lấy thông tin phòng
    const room = await ROOM_MODEL.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Kiểm tra phòng đã tồn tại trong giỏ hàng hay chưa
    const roomExists = cart.ROOMS.find(
      (room) => room.ROOM_ID.toString() === roomId
    );
    if (roomExists) {
      throw new Error("Phòng đã tồn tại trong giỏ hàng của bạn.");
    }

    // Thêm phòng mới vào giỏ hàng
    cart.ROOMS.push({
      ROOM_ID: roomId,
      START_DATE: startDate,
      END_DATE: endDate,
    });

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  }

  async removeRoomFromCart(userId, roomId) {
    // Tìm giỏ hàng của người dùng
    const cart = await CART_MODEL.findOne({ USER_ID: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tìm phòng trong giỏ hàng
    const roomIndex = cart.ROOMS.findIndex(
      (room) => room.ROOM_ID.toString() === roomId
    );
    if (roomIndex === -1) {
      throw new Error("Room not found in cart");
    }

    // Xóa phòng khỏi giỏ hàng
    cart.ROOMS.splice(roomIndex, 1);

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  }

  async updateRoomInCart(userId, roomId, newStartDate, newEndDate) {
    // Tìm giỏ hàng của người dùng
    let cart = await CART_MODEL.findOne({ USER_ID: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tìm phòng trong giỏ hàng
    const roomIndex = cart.ROOMS.findIndex(
      (room) => room.ROOM_ID.toString() === roomId
    );
    if (roomIndex === -1) {
      throw new Error("Room not found in cart");
    }

    // Cập nhật thông tin ngày bắt đầu và kết thúc của phòng
    cart.ROOMS[roomIndex].START_DATE = newStartDate;
    cart.ROOMS[roomIndex].END_DATE = newEndDate;

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  }

  // Hàm xóa các phòng đã đặt trong giỏ hàng
  async removeBookedRooms(userId, bookedRooms) {
    // Tìm giỏ hàng dựa vào USER_ID
    const cart = await CART_MODEL.findOne({ USER_ID: userId });
    if (!cart) {
      throw new Error("Giỏ hàng không tồn tại");
    }

    // Duyệt qua và xóa các phòng đã đặt
    cart.ROOMS = cart.ROOMS.filter((room) => {
      return !bookedRooms.some(
        (bookedRoom) =>
          bookedRoom.ROOM_ID &&
          room.ROOM_ID &&
          bookedRoom.ROOM_ID.equals(room.ROOM_ID)
      );
    });

    // Lưu lại giỏ hàng sau khi đã xóa các phòng đã đặt
    await cart.save();
    return cart;
  }

  async getCartByUserId(userId) {
    const cart = await CART_MODEL.findOne({ USER_ID: userId });
    return cart;
  }

  async getCartWithGroupedRoomsByHotel(userId) {
    const cart = await CART_MODEL.aggregate([
      {
        $match: { USER_ID: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: { path: "$ROOMS", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "ROOMS.ROOM_ID",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      {
        $unwind: { path: "$roomDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "roomDetails.HOTEL_ID",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      {
        $unwind: { path: "$hotelDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          "ROOMS.TOTAL_PRICE_FOR_ROOM": {
            $multiply: [
              "$roomDetails.PRICE_PERNIGHT",
              {
                $ceil: {
                  $divide: [
                    { $subtract: ["$ROOMS.END_DATE", "$ROOMS.START_DATE"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            ],
          },
          "ROOMS.HOTEL_ID": "$hotelDetails._id",
          "ROOMS.HOTEL_NAME": "$hotelDetails.NAME",
        },
      },
      {
        $group: {
          _id: { HOTEL_ID: "$ROOMS.HOTEL_ID", HOTEL_NAME: "$ROOMS.HOTEL_NAME" },
          ROOMS: { $push: "$ROOMS" },
        },
      },
      {
        $project: {
          _id: 0,
          HOTEL_ID: "$_id.HOTEL_ID",
          HOTEL_NAME: "$_id.HOTEL_NAME",
          ROOMS: 1,
        },
      },
      {
        $group: {
          _id: null,
          HOTELS: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          HOTELS: 1,
        },
      },
    ]);

    console.log(cart); // Kiểm tra kết quả để xác định nếu có vấn đề với bước nào

    if (!cart || cart.length === 0) {
      throw new Error("Cart not found");
    }

    return cart[0];
  }
}

module.exports = new CART_SERVICE();
