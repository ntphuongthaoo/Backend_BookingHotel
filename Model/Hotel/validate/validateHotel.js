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
    ADDRESS_LINE: Joi.string()
      .allow("")
      .messages({
        "string.base": "Địa chỉ phải là một chuỗi.",
      })
      .optional(), // Tùy chọn vì có thể không có thông tin đầy đủ

    HAMLET: Joi.string()
      .allow("")
      .messages({
        "string.base": "Tên ấp/thôn phải là một chuỗi.",
      })
      .optional(), // Tùy chọn cho những địa chỉ ở vùng nông thôn không có số nhà và đường

    WARD: Joi.string().allow("").messages({
      "string.base": "Tên phường/xã phải là một chuỗi.",
      "string.empty": "Tên phường/xã không được để trống.",
    }),

    DISTRICT: Joi.string().allow("").messages({
      "string.base": "Tên quận/huyện phải là một chuỗi.",
      "string.empty": "Tên quận/huyện không được để trống.",
    }),

    CITY: Joi.string().required().messages({
      "string.base": "Tên tỉnh/thành phố phải là một chuỗi.",
      "string.empty": "Tên tỉnh/thành phố không được để trống.",
      "any.required": "Tên tỉnh/thành phố là bắt buộc.",
    }),

    COUNTRY: Joi.string()
      .default("Vietnam")
      .messages({
        "string.base": "Tên quốc gia phải là một chuỗi.",
      })
      .optional(), // Có thể bỏ qua nếu sử dụng giá trị mặc định
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

  IMAGES: Joi.array()
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

    RATING: Joi.number().min(1).max(5).precision(2).optional().messages({
      "number.base": "Rating phải là một số.",
      "number.min": "Rating phải ít nhất là {#limit}.",
      "number.max": "Rating không được vượt quá {#limit}.",
    }),
  SERVICES: Joi.object({
    PHONG_TAM: Joi.object({
      name: Joi.string().default("Phòng tắm"),
      GIAY_VE_SINH: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Giấy vệ sinh"),
      }),
      BON_TAM_HOAC_VOI_SEN: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Bồn tắm hoặc vòi sen"),
      }),
      DEP: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Dép"),
      }),
      NHA_VE_SINH: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Nhà vệ sinh"),
      }),
      DO_VE_SINH_CA_NHAN: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Đồ vệ sinh cá nhân"),
      }),
      AO_CHOANG_TAM: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Áo choàng tắm"),
      }),
      BON_TAM: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Bồn tắm"),
      }),
      VOI_SEN: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Vòi sen"),
      }),
    }),
    CHO_DAU_XE: Joi.object({
      name: Joi.string().default("Chỗ đậu xe"),
      CO_CHO_DO_XE_CONG_CONG: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Có chỗ đỗ xe công cộng"),
      }),
    }),
    AN_NINH: Joi.object({
      name: Joi.string().default("An ninh"),
      BAO_DONG_AN_NINH: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Báo động an ninh"),
      }),
      KET_AN_TOAN: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Két an toàn"),
      }),
    }),
    CHAM_SOC_SUC_KHOE: Joi.object({
      enabled: Joi.boolean().default(true),
      name: Joi.string().default("Chăm sóc sức khỏe"),
    }),
    DICH_VU_DOANH_NHAN: Joi.object({
      name: Joi.string().default("Dịch vụ doanh nhân"),
      PHOTOCOPY: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Photocopy"),
      }),
      TRUNG_TAM_DICH_VU_DOANH_NHAN: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Trung tâm dịch vụ doanh nhân"),
      }),
      TIEN_NGHI_HOP_TIEC: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Tiện nghi họp/tiệc"),
      }),
    }),
    DICH_VU_GIAT_UI: Joi.object({
      name: Joi.string().default("Dịch vụ giặt ủi"),
      DON_PHONG_HANG_NGAY: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Dọn phòng hàng ngày"),
      }),
      DICH_VU_LA_UI: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Dịch vụ là/ủi"),
      }),
      GIAT_UI: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Giặt ủi"),
      }),
      GIAT_KHO: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Giặt khô"),
      }),
    }),
    DICH_VU_LE_TAN: Joi.object({
      name: Joi.string().default("Dịch vụ lễ tân"),
      NHAN_TRA_PHONG_RIENG: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Nhận/trả phòng riêng"),
      }),
      GIU_HANH_LY: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Giữ hành lý"),
      }),
      LE_TAN_24H: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Lễ tân 24 giờ"),
      }),
      THU_DOI_NGOAI_TE: Joi.object({
        enabled: Joi.boolean().default(true),
        name: Joi.string().default("Thu đổi ngoại tệ"),
      }),
    }),
    INTERNET: Joi.object({
      enabled: Joi.boolean().default(true),
      name: Joi.string().default("Internet"),
    }),
    TIEN_ICH_TRONG_PHONG: Joi.object({
      enabled: Joi.boolean().default(true),
      name: Joi.string().default("Tiện ích trong phòng"),
    }),
    DICH_VU_AN_UONG: Joi.object({
      enabled: Joi.boolean().default(true),
      name: Joi.string().default("Dịch vụ ăn uống"),
    }),
  }).default(),
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
