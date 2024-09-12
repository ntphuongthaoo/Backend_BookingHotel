const CART_MODEL = require("../../Model/Cart/Cart.Model");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");

class CART_SERVICE {
  
  async createCart(userId) {
    const newCart = new CART_MODEL({
      USER_ID: userId,
      LIST_ROOMS: [],
      LIST_ROOM_MAX_NUMBER: 0,
    });

    await newCart.save();
    return newCart;
  }

  async addRoomToCart(userId, hotelId, roomId, startDate, endDate) {
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

    // Tính tổng số đêm và tổng tiền cho phòng
    const numNights = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalPriceForRoom = room.PRICE_PERNIGHT * numNights;

    // Kiểm tra xem khách sạn đã tồn tại trong giỏ hàng chưa
    const hotelIndex = cart.LIST_ROOMS.findIndex(
      (hotel) => hotel.HOTEL_ID.toString() === hotelId
    );

    if (hotelIndex > -1) {
      // Nếu khách sạn đã có trong giỏ hàng, kiểm tra phòng
      const roomIndex = cart.LIST_ROOMS[hotelIndex].ROOMS.findIndex(
        (room) => room.ROOM_ID.toString() === roomId
      );

      if (roomIndex === -1) {
        // Nếu phòng chưa có, thêm phòng mới
        cart.LIST_ROOMS[hotelIndex].ROOMS.push({
          ROOM_ID: roomId,
          START_DATE: startDate,
          END_DATE: endDate,
          TOTAL_PRICE_FOR_ROOM: totalPriceForRoom, // Lưu tổng tiền của phòng
        });
        cart.LIST_ROOM_MAX_NUMBER += 1;
      } else {
        throw new Error("Phòng đã tồn tại trong giỏ hàng của bạn.");
      }
    } else {
      // Nếu khách sạn chưa có trong giỏ hàng, thêm khách sạn và phòng mới
      cart.LIST_ROOMS.push({
        HOTEL_ID: hotelId,
        ROOMS: [
          {
            ROOM_ID: roomId,
            START_DATE: startDate,
            END_DATE: endDate,
            TOTAL_PRICE_FOR_ROOM: totalPriceForRoom, // Lưu tổng tiền của phòng
          },
        ],
      });
      cart.LIST_ROOM_MAX_NUMBER += 1;
    }

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  }

  async removeRoomFromCart(userId, hotelId, roomId) {
    try {
      // Tìm giỏ hàng của người dùng
      const cart = await CART_MODEL.findOne({ USER_ID: userId });
      if (!cart) {
        throw new Error("Cart not found");
      }

      // Tìm khách sạn trong giỏ hàng
      const hotelIndex = cart.LIST_ROOMS.findIndex(
        (hotel) => hotel.HOTEL_ID.toString() === hotelId
      );
      if (hotelIndex === -1) {
        throw new Error("Hotel not found in cart");
      }

      // Tìm phòng trong danh sách phòng của khách sạn
      const roomIndex = cart.LIST_ROOMS[hotelIndex].ROOMS.findIndex(
        (room) => room.ROOM_ID.toString() === roomId
      );
      if (roomIndex === -1) {
        throw new Error("Room not found in cart");
      }

      // Xóa phòng khỏi danh sách phòng của khách sạn
      cart.LIST_ROOMS[hotelIndex].ROOMS.splice(roomIndex, 1);

      // Cập nhật lại tổng số phòng
      cart.LIST_ROOM_MAX_NUMBER -= 1;

      // Nếu không còn phòng nào trong khách sạn, xóa khách sạn khỏi giỏ hàng
      if (cart.LIST_ROOMS[hotelIndex].ROOMS.length === 0) {
        cart.LIST_ROOMS.splice(hotelIndex, 1);
      }

      // Lưu thay đổi giỏ hàng
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error removing room from cart:", error);
      throw new Error("Error removing room from cart");
    }
  }

  async updateRoomInCart(userId, hotelId, roomId, newStartDate, newEndDate) {
    try {
      // Tìm giỏ hàng của người dùng
      let cart = await CART_MODEL.findOne({ USER_ID: userId });
      if (!cart) {
        throw new Error("Cart not found");
      }

      // Tìm khách sạn trong giỏ hàng
      const hotelIndex = cart.LIST_ROOMS.findIndex(
        (hotel) => hotel.HOTEL_ID.toString() === hotelId
      );
      if (hotelIndex === -1) {
        throw new Error("Hotel not found in cart");
      }

      // Tìm phòng trong danh sách phòng của khách sạn
      const roomIndex = cart.LIST_ROOMS[hotelIndex].ROOMS.findIndex(
        (room) => room.ROOM_ID.toString() === roomId
      );
      if (roomIndex === -1) {
        throw new Error("Room not found in cart");
      }

      // Cập nhật thông tin ngày bắt đầu và ngày kết thúc của phòng
      cart.LIST_ROOMS[hotelIndex].ROOMS[roomIndex].START_DATE = newStartDate;
      cart.LIST_ROOMS[hotelIndex].ROOMS[roomIndex].END_DATE = newEndDate;

      // Tính toán lại tổng số đêm và tổng tiền
      const room = await ROOM_MODEL.findById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const numNights = Math.ceil(
        (new Date(newEndDate) - new Date(newStartDate)) / (1000 * 60 * 60 * 24)
      );
      const totalPriceForRoom = room.PRICE_PERNIGHT * numNights;

      // Cập nhật lại tổng giá tiền của phòng
      cart.LIST_ROOMS[hotelIndex].ROOMS[roomIndex].TOTAL_PRICE_FOR_ROOM =
        totalPriceForRoom;

      // Lưu thay đổi giỏ hàng
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error updating room in cart:", error);
      throw new Error("Error updating room in cart");
    }
  }

  async getCartByUserId (userId) {
    // Tìm giỏ hàng của người dùng dựa trên userId
    const cart = await CART_MODEL.findOne({ USER_ID: userId })
      // Lấy thông tin người dùng mà không cần lấy ID
      // .populate({
      //   path: "USER_ID",
      //   select: "fullName",
      // })

      // Lấy thông tin khách sạn mà không cần lấy ID
      .populate({
        path: "LIST_ROOMS.HOTEL_ID",
        select: "NAME",
      })

      // Lấy thông tin phòng mà không cần lấy ID
      .populate({
        path: "LIST_ROOMS.ROOMS.ROOM_ID",
        select: "TYPE PRICE_PERNIGHT", 
      })
      .lean();
    if (!cart) {
      throw new Error("Cart not found");
    }

    return cart;
  };
}

module.exports = new CART_SERVICE();