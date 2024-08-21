const HOTEL_MODEL = require('../../Model/Hotel/Hotel.Model')

class HOTEL_SERVICE {
    async createHotel (data) {
        const newHotel = new HOTEL_MODEL(data);
        const result = await newHotel.save();
        return result.toObject();
    }

    async updateHotelById (id, hotelData) {
        const updateHotel = await HOTEL_MODEL.findByIdAndUpdate(
            id, 
            {
                ...hotelData,
            },
            {new: true}
        );
        return updateHotel;
    }

    async deleteHotel(hotelId) {
        const result = await HOTEL_MODEL.findByIdAndUpdate(
            hotelId,
            { $set: { IS_DELETED: true } },
            { new: true, runValidators: true } // `new: true` để trả về tài liệu đã cập nhật
        );
        if (!result) {
            throw new Error('Hotel not found');
        }
        return result.toObject();           
    }

    async getHotelsAndSearch(tabStatus, page, limit, search = "") {
        let query = {};
    
        switch (tabStatus) {
            case "1":
                // Khách sạn đang hoạt động
                query = { STATE: true, IS_DELETED: false };
                break;
            case "2":
                // Khách sạn không hoạt động
                query = { STATE: false, IS_DELETED: false };
                break;
            case "3":
                // Khách sạn bị xóa (IS_DELETED = true)
                query = { IS_DELETED: true };
                break;
            case "4":
                // Tất cả khách sạn
                // query = { IS_DELETED: false }; // Chỉ lấy những khách sạn chưa bị xóa
                query = {};
                break;
            default:
                throw new Error("Invalid tab status");
        }
    
        if (search) {
            query.$or = [
                { NAME: { $regex: new RegExp(search, "i") } },
                { "ADDRESS.PROVINCE.NAME": { $regex: new RegExp(search, "i") } },
                { "ADDRESS.DISTRICT.NAME": { $regex: new RegExp(search, "i") } },
                { "ADDRESS.WARD.NAME": { $regex: new RegExp(search, "i") } },
            ];
        }
    
        try {
            const totalCount = await HOTEL_MODEL.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limit);
            const offset = (page - 1) * limit;
    
            const hotels = await HOTEL_MODEL.find(query)
                .skip(offset)
                .limit(limit)
                .lean(); // Sử dụng lean() để nhận về plain JavaScript objects
    
            if (hotels.length === 0) {
                return {
                    hotels: [],
                    totalPages: 0,
                    totalCount: 0,
                };
            }
    
            return {
                hotels,
                totalPages,
                totalCount,
            };
        } catch (error) {
            console.error("Error querying hotels:", error);
            throw new Error("Lỗi khi truy vấn khách sạn");
        }
    }

    // async searchHotels(page, limit, name = "", address = "", provinceCode = "") {
    //     let query = { IS_DELETED: false }; // Chỉ lấy khách sạn chưa bị xóa
    
    //     const andConditions = [];
    
    //     // Điều kiện tìm kiếm theo tên khách sạn
    //     if (name) {
    //         andConditions.push({ NAME: { $regex: new RegExp(name, "i") } });
    //     }
    
    //     // Điều kiện tìm kiếm theo địa chỉ
    //     if (address) {
    //         andConditions.push({
    //             $or: [
    //                 { "ADDRESS.DESCRIPTION": { $regex: new RegExp(address, "i") } },
    //                 { "ADDRESS.PROVINCE.NAME": { $regex: new RegExp(address, "i") } },
    //                 { "ADDRESS.DISTRICT.NAME": { $regex: new RegExp(address, "i") } },
    //                 { "ADDRESS.WARD.NAME": { $regex: new RegExp(address, "i") } }
    //             ]
    //         });
    //     }
    
    //     // Điều kiện tìm kiếm theo mã vùng
    //     if (provinceCode) {
    //         andConditions.push({ "ADDRESS.PROVINCE.CODE": provinceCode });
    //     }
    
    //     // Kết hợp tất cả các điều kiện trong một truy vấn
    //     if (andConditions.length > 0) {
    //         query.$and = andConditions;
    //     }
    
    //     try {
    //         const totalCount = await HOTEL_MODEL.countDocuments(query);
    //         const totalPages = Math.ceil(totalCount / limit);
    //         const offset = (page - 1) * limit;
    
    //         const hotels = await HOTEL_MODEL.find(query)
    //             .skip(offset)
    //             .limit(limit)
    //             .lean(); // Sử dụng lean() để nhận về plain JavaScript objects
    
    //         return {
    //             hotels,
    //             totalPages,
    //             totalCount
    //         };
    //     } catch (error) {
    //         console.error("Error searching hotels:", error);
    //         throw new Error("Lỗi khi tìm kiếm khách sạn");
    //     }
    // }
    
    
}

module.exports = new HOTEL_SERVICE();