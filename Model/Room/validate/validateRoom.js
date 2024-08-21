const Joi = require('joi');

class ROOM_VALIDATED {
    static createRoom = Joi.object({
        HOTEL_ID: Joi.string().length(24).hex().required().messages({
            'string.base': `"HOTEL_ID" phải là một chuỗi`,
            'string.empty': `"HOTEL_ID" không được để trống`,
            'string.length': `"HOTEL_ID" phải có độ dài 24 ký tự`,
            'string.hex': `"HOTEL_ID" phải là chuỗi ký tự hexadecimal`,
            'any.required': `"HOTEL_ID" là trường bắt buộc`
          }),
          ROOM_NUMBER: Joi.string().required().messages({
            'string.base': `"ROOM_NUMBER" phải là một chuỗi`,
            'string.empty': `"ROOM_NUMBER" không được để trống`,
            'any.required': `"ROOM_NUMBER" là trường bắt buộc`
          }),
          TYPE: Joi.string().valid('Single', 'Double', 'Suite').required().messages({
            'string.base': `"TYPE" phải là một chuỗi`,
            'any.only': `"TYPE" phải là một trong các giá trị: ['Single', 'Double', 'Suite']`,
            'any.required': `"TYPE" là trường bắt buộc`
          }),
          PRICE_PERNIGHT: Joi.number().positive().required().messages({
            'number.base': `"PRICE_PERNIGHT" phải là một số`,
            'number.positive': `"PRICE_PERNIGHT" phải là số dương`,
            'any.required': `"PRICE_PERNIGHT" là trường bắt buộc`
          }),
          DESCRIPTION: Joi.string().optional().allow('').messages({
            'string.base': `"DESCRIPTION" phải là một chuỗi`
          }),
          IMAGES: Joi.array().items(
            Joi.object({
              path: Joi.string().uri().required().messages({
                'string.base': `"path" phải là một chuỗi`,
                'string.uri': `"path" phải là một URL hợp lệ`,
                'any.required': `"path" là trường bắt buộc`
              }),
              description: Joi.string().optional().allow('').messages({
                'string.base': `"description" phải là một chuỗi`
              }),
              order: Joi.number().integer().optional().messages({
                'number.base': `"order" phải là một số nguyên`
              })
            })
          ).optional().messages({
            'array.base': `"IMAGES" phải là một mảng`
          }),
          AVAILABILITY: Joi.array().items(
            Joi.object({
              DATE: Joi.date().required().messages({
                'date.base': `"DATE" phải là một ngày hợp lệ`,
                'any.required': `"DATE" là trường bắt buộc`
              }),
              AVAILABLE: Joi.boolean().required().messages({
                'boolean.base': `"AVAILABLE" phải là giá trị boolean`,
                'any.required': `"AVAILABLE" là trường bắt buộc`
              })
            })
          ).optional().messages({
            'array.base': `"AVAILABILITY" phải là một mảng`
          }),
          CUSTOM_ATTRIBUTES: Joi.object({
            bedType: Joi.string().optional().allow('').messages({
              'string.base': `"bedType" phải là một chuỗi`
            }),
            view: Joi.string().optional().allow('').messages({
              'string.base': `"view" phải là một chuỗi`
            }),
            others: Joi.object().optional().messages({
              'object.base': `"others" phải là một đối tượng`
            })
          }).optional().messages({
            'object.base': `"CUSTOM_ATTRIBUTES" phải là một đối tượng`
          }),
          DEPOSIT_PERCENTAGE: Joi.number().min(0).max(100).required().messages({
            'number.base': `"DEPOSIT_PERCENTAGE" phải là một số`,
            'number.min': `"DEPOSIT_PERCENTAGE" phải nằm trong khoảng từ 0 đến 100`,
            'number.max': `"DEPOSIT_PERCENTAGE" phải nằm trong khoảng từ 0 đến 100`,
            'any.required': `"DEPOSIT_PERCENTAGE" là trường bắt buộc`
          }),
          DISCOUNT: Joi.number().min(0).max(100).optional().messages({
            'number.base': `"DISCOUNT" phải là một số`,
            'number.min': `"DISCOUNT" phải nằm trong khoảng từ 0 đến 100`,
            'number.max': `"DISCOUNT" phải nằm trong khoảng từ 0 đến 100`
          })
      });
}

module.exports = ROOM_VALIDATED;