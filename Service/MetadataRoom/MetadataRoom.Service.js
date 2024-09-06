const MetadataHotel = require('../../Model/MetadataHotel/MetadataHotel');

class MetadataRoomService {
  async updateMetadataAfterRoomAdded(hotelId, roomType) {
    try {
      // Tìm MetadataHotel dựa trên hotelId
      const metadata = await MetadataHotel.findOne({ HOTEL_ID: hotelId });

      if (metadata) {
        // Tăng tổng số phòng
        metadata.TOTAL_ROOMS += 1;

        // Cập nhật theo loại phòng
        if (roomType === 'Single') {
          metadata.TOTAL_ROOM_SINGLES += 1;
        } else if (roomType === 'Double') {
          metadata.TOTAL_ROOM_DOUBLES += 1;
        } else if (roomType === 'Suite') {
          metadata.TOTAL_ROOM_SUITES += 1;
        }

        // Tăng số lượng phòng có sẵn
        metadata.AVAILABLE_ROOMS += 1;

        // Lưu thay đổi
        await metadata.save();
      }
    } catch (error) {
      throw new Error('Error updating metadata after room added: ' + error.message);
    }
  }

  // Hàm này có thể được gọi khi phòng bị xóa
  async updateMetadataAfterRoomRemoved(hotelId, roomType) {
    try {
      const metadata = await MetadataHotel.findOne({ HOTEL_ID: hotelId });

      if (metadata) {
        // Giảm tổng số phòng
        metadata.TOTAL_ROOMS -= 1;

        // Cập nhật theo loại phòng
        if (roomType === 'Single') {
          metadata.TOTAL_ROOM_SINGLES -= 1;
        } else if (roomType === 'Double') {
          metadata.TOTAL_ROOM_DOUBLES -= 1;
        } else if (roomType === 'Suite') {
          metadata.TOTAL_ROOM_SUITES -= 1;
        }

        // Giảm số lượng phòng có sẵn
        metadata.AVAILABLE_ROOMS -= 1;

        await metadata.save();
      }
    } catch (error) {
      throw new Error('Error updating metadata after room removed: ' + error.message);
    }
  }
}

module.exports = new MetadataRoomService();
