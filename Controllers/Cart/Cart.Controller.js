const CART_SERVICE = require("../../Service/Cart/Cart.Service");

class CART_CONTROLLER {
  async createCart(req, res) {
    try {
      const userId = req.user_id;
      const cart = await CART_SERVICE.createCart(userId);
      return res.status(201).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error("Error creating cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error creating cart.",
        error: error.message,
      });
    }
  }

  async addRoomToCart(req, res) {
    try {
      const { roomId, startDate, endDate } = req.body;
      const userId = req.user_id;
  
      if (!userId || !roomId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      const cart = await CART_SERVICE.addRoomToCart(userId, roomId, startDate, endDate);
  
      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Error adding room to cart:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error adding room to cart.',
        error: error.message,
      });
    }
  }  

  async removeRoomFromCart (req, res) {
    const userId = req.user_id; // Lấy từ token
    const { roomId } = req.body;
  
    try {
      const updatedCart = await CART_SERVICE.removeRoomFromCart(userId, roomId);
      return res.status(200).json({
        success: true,
        data: updatedCart,
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: error.message });
    }
  };

  async updateRoomInCart (req, res) {
    try {
      const { roomId, newStartDate, newEndDate } = req.body;
      const userId = req.user_id;
  
      // Gọi hàm updateRoomInCart từ service
      const updatedCart = await CART_SERVICE.updateRoomInCart(userId, roomId, newStartDate, newEndDate);
  
      // Trả về kết quả cho client
      return res.status(200).json({
        success: true,
        message: 'Cập nhật phòng thành công!',
        cart: updatedCart
      });
    } catch (error) {
      console.error('Error in updateRoomInCartController:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update room in cart',
        error: error.message
      });
    }
  };

  async getCartByUserId (req, res) {
    try {
      const userId = req.user_id;

      const cart = await CART_SERVICE.getCartWithGroupedRoomsByHotel(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        cart: cart
      });
    } catch (error) {
      console.error('Error in getCartByUserIdController:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart',
        error: error.message
      });
    }
  };
}

module.exports = new CART_CONTROLLER();
