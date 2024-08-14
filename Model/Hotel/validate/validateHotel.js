const Joi = require('joi');

// Định nghĩa schema kiểm tra dữ liệu cho Hotel với STATE là kiểu boolean
const createHotelValidate = Joi.object({
  NAME: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Tên khách sạn phải là một chuỗi.',
      'string.empty': 'Tên khách sạn không được để trống.',
      'string.min': 'Tên khách sạn phải có ít nhất {#limit} ký tự.',
      'string.max': 'Tên khách sạn không được vượt quá {#limit} ký tự.',
      'any.required': 'Tên khách sạn là bắt buộc.'
    }),
  ADDRESS: Joi.object({
    PROVINCE: Joi.object({
      NAME: Joi.string().required()
        .messages({
          'string.base': 'Tên tỉnh thành phải là một chuỗi.',
          'string.empty': 'Tên tỉnh thành không được để trống.',
          'any.required': 'Tên tỉnh thành là bắt buộc.'
        }),
      CODE: Joi.number().integer().required()
        .messages({
          'number.base': 'Mã tỉnh thành phải là một số.',
          'number.integer': 'Mã tỉnh thành phải là số nguyên.',
          'any.required': 'Mã tỉnh thành là bắt buộc.'
        })
    }).required(),
    DISTRICT: Joi.object({
      NAME: Joi.string().required()
        .messages({
          'string.base': 'Tên quận huyện phải là một chuỗi.',
          'string.empty': 'Tên quận huyện không được để trống.',
          'any.required': 'Tên quận huyện là bắt buộc.'
        }),
      CODE: Joi.number().integer().required()
        .messages({
          'number.base': 'Mã quận huyện phải là một số.',
          'number.integer': 'Mã quận huyện phải là số nguyên.',
          'any.required': 'Mã quận huyện là bắt buộc.'
        })
    }).required(),
    WARD: Joi.object({
      NAME: Joi.string().required()
        .messages({
          'string.base': 'Tên phường xã phải là một chuỗi.',
          'string.empty': 'Tên phường xã không được để trống.',
          'any.required': 'Tên phường xã là bắt buộc.'
        }),
      CODE: Joi.number().integer().required()
        .messages({
          'number.base': 'Mã phường xã phải là một số.',
          'number.integer': 'Mã phường xã phải là số nguyên.',
          'any.required': 'Mã phường xã là bắt buộc.'
        })
    }).required(),
    DESCRIPTION: Joi.string().optional()
      .messages({
        'string.base': 'Mô tả phải là một chuỗi.'
      })
  }).required(),
  STATE: Joi.boolean().required()
    .messages({
      'boolean.base': 'Trạng thái phải là kiểu boolean.',
      'any.required': 'Trạng thái là bắt buộc.'
    }),
  PHONE: Joi.string().pattern(/^[0-9]{10,15}$/).required()
    .messages({
      'string.base': 'Số điện thoại phải là một chuỗi.',
      'string.empty': 'Số điện thoại không được để trống.',
      'string.pattern.base': 'Số điện thoại phải có từ 10 đến 15 chữ số.',
      'any.required': 'Số điện thoại là bắt buộc.'
    }),
  EMAIL: Joi.string().email().required()
    .messages({
      'string.base': 'Email phải là một chuỗi.',
      'string.empty': 'Email không được để trống.',
      'string.email': 'Email không hợp lệ.',
      'any.required': 'Email là bắt buộc.'
    })
});

// Hàm kiểm tra và trả về lỗi
// const validateHotel = (data) => {
//   const { error } = hotelValidationSchema.validate(data, { abortEarly: false });
//   if (error) {
//     return error.details.map(detail => detail.message);
//   }
//   return null;
// };

module.exports = {createHotelValidate};