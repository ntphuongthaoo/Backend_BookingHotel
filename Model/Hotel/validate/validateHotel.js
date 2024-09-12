const Joi = require("joi");

// Định nghĩa schema kiểm tra dữ liệu cho Hotel với STATE là kiểu boolean
const createHotelValidate = Joi.object({
  NAME: Joi.string().min(3).max(100).required().messages({
    "string.base": "Tên khách sạn phải là một chuỗi.",
    "string.empty": "Tên khách sạn không được để trống.",
    "string.min": "Tên khách sạn phải có ít nhất {#limit} ký tự.",
    "string.max": "Tên khách sạn không được vượt quá {#limit} ký tự.",
    "any.required": "Tên khách sạn là bắt buộc.",
  }),
  ADDRESS: Joi.object({
    ADDRESS_LINE: Joi.string().allow('').messages({
      "string.base": "Địa chỉ phải là một chuỗi.",
    }).optional(), // Tùy chọn vì có thể không có thông tin đầy đủ

    HAMLET: Joi.string().allow('').messages({
      "string.base": "Tên ấp/thôn phải là một chuỗi.",
    }).optional(), // Tùy chọn cho những địa chỉ ở vùng nông thôn không có số nhà và đường

    WARD: Joi.string().required().messages({
      "string.base": "Tên phường/xã phải là một chuỗi.",
      "string.empty": "Tên phường/xã không được để trống.",
      "any.required": "Tên phường/xã là bắt buộc.",
    }),

    DISTRICT: Joi.string().required().messages({
      "string.base": "Tên quận/huyện phải là một chuỗi.",
      "string.empty": "Tên quận/huyện không được để trống.",
      "any.required": "Tên quận/huyện là bắt buộc.",
    }),

    CITY: Joi.string().required().messages({
      "string.base": "Tên tỉnh/thành phố phải là một chuỗi.",
      "string.empty": "Tên tỉnh/thành phố không được để trống.",
      "any.required": "Tên tỉnh/thành phố là bắt buộc.",
    }),

    COUNTRY: Joi.string().default('Vietnam').messages({
      "string.base": "Tên quốc gia phải là một chuỗi.",
    }).optional(), // Có thể bỏ qua nếu sử dụng giá trị mặc định
  }).required(),
  STATE: Joi.boolean().required().messages({
    "boolean.base": "Trạng thái phải là kiểu boolean.",
    "any.required": "Trạng thái là bắt buộc.",
  }),
  PHONE: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.base": "Số điện thoại phải là một chuỗi.",
      "string.empty": "Số điện thoại không được để trống.",
      "string.pattern.base": "Số điện thoại phải có từ 10 đến 15 chữ số.",
      "any.required": "Số điện thoại là bắt buộc.",
    }),
  EMAIL: Joi.string().email().required().messages({
    "string.base": "Email phải là một chuỗi.",
    "string.empty": "Email không được để trống.",
    "string.email": "Email không hợp lệ.",
    "any.required": "Email là bắt buộc.",
  }),
  DESCRIPTION: Joi.string().optional().messages({
    "string.base": "Mô tả phải là một chuỗi.",
  }),

  IMAGE: Joi.array()
    .items(
      Joi.string()
        .uri()
        .regex(/\.(jpg|jpeg|png|gif)$/i)
    )
    .optional()
    .messages({
      "array.base": "Hình ảnh phải là một mảng.",
      "string.uri": "URL hình ảnh không hợp lệ.",
      "string.regex.base":
        "URL hình ảnh phải kết thúc bằng jpg, jpeg, png hoặc gif.",
    }),
});

// Hàm kiểm tra và trả về lỗi
// const validateHotel = (data) => {
//   const { error } = hotelValidationSchema.validate(data, { abortEarly: false });
//   if (error) {
//     return error.details.map(detail => detail.message);
//   }
//   return null;
// };

module.exports = { createHotelValidate };
