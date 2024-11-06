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
        ROOM_NUMBER: Joi.string().pattern(/^\d+$/).optional().messages({
            'string.base': `"ROOM_NUMBER" phải là một chuỗi số`,
            'string.pattern.base': `"ROOM_NUMBER" phải là chuỗi số`
        }),        
        FLOOR: Joi.number().integer().positive().required().messages({
            'number.base': `"FLOOR" phải là một số`,
            'number.integer': `"FLOOR" phải là số nguyên`,
            'number.positive': `"FLOOR" phải là số dương`,
            'any.required': `"FLOOR" là trường bắt buộc`
        }),
        TYPE: Joi.string().valid("Superior", "Deluxe", "Suite").required().messages({
            'string.base': `"TYPE" phải là một chuỗi`,
            'any.only': `"TYPE" phải là một trong các giá trị: ["Superior", "Deluxe", "Suite"]`,
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
        IMAGES: Joi.array().items(Joi.string().uri()).optional().messages({
            'array.base': `"IMAGES" phải là một mảng`,
            'string.base': `"IMAGES" chứa các giá trị phải là chuỗi`,
            'string.uri': `"IMAGES" chứa các giá trị phải là URL hợp lệ`
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
            area: Joi.number().optional().allow('').messages({
                'string.base': `"view" phải là một chuỗi`
            }),
            amenities: Joi.string().optional().allow('').messages({
                'string.base': `"amenities" phải là một chuỗi`
            }),
            number_of_people: Joi.number().optional().allow('').messages({
                'string.base': `"view" phải là một chuỗi`
            }),
            others: Joi.object().optional().messages({
                'object.base': `"others" phải là một đối tượng`
            })
        }).optional().messages({
            'object.base': `"CUSTOM_ATTRIBUTES" phải là một đối tượng`
        }),
    });
}

module.exports = ROOM_VALIDATED;
