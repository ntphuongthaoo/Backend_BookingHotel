const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const USER_MODEL = require("../../Model/User/User.Model");

class USER_SERVICE {
  async checkUserExists(email, phone) {
    // Tìm kiếm người dùng dựa trên email hoặc số điện thoại
    const searchConditions = [];

    if (email) {
      searchConditions.push({ EMAIL: email });
    }
    if (phone) {
      searchConditions.push({ PHONE_NUMBER: phone });
    }

    if (searchConditions.length === 0) {
      return null;
    }

    return await USER_MODEL.findOne({
      $or: searchConditions,
    }).lean();
  }

  async checkEmailExists(email) {
    return await USER_MODEL.findOne({ EMAIL: email }).lean();
  }

  async registerUser(body) {
    const hash = await this.hashPassword(body.PASSWORD);

    const newUser = new USER_MODEL({
      FULLNAME: body.FULLNAME,
      EMAIL: body.EMAIL,
      PHONE_NUMBER: body.PHONE_NUMBER,
      PASSWORD: hash,
      ROLE: {
        ADMIN: false,
        BRANCH_MANAGER: false,
        STAFF: false,
      },
      IS_BLOCKED: null,
      IS_ACTIVATED: false,
    });

    const result = await newUser.save();
    return result.toObject();
  }

  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password, passwordDB) {
    try {
      return await bcrypt.compare(password, passwordDB);
    } catch (err) {
      throw new Error("Password comparison failed");
    }
  }

  // Hàm tạo refresh token
  generateRefreshToken = async (userId) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = "30d";
    const refreshToken = jwt.sign({ userId }, secret, { expiresIn });
    return refreshToken;
  };
  // Hàm cấp phát lại refresh token
  resetRefreshToken = async (oldRefreshToken) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(oldRefreshToken, secret);

    // Tạo một refresh token mới
    const newRefreshToken = generateRefreshToken(decoded.userId);
    return newRefreshToken;
  };

  login = async (payload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = "5h";
    const accessToken = jwt.sign(payload, secret, { expiresIn });

    const refreshToken = await this.generateRefreshToken(payload.userId);
    return { accessToken, refreshToken };
  };

  async getUserInfo(user_id) {
    const user = await USER_MODEL.findById(user_id).lean();

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUserOTP(email, otp, otpType, expTime) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email },
        {
          $push: {
            OTP: {
              TYPE: otpType,
              CODE: otp,
              TIME: Date.now(),
              EXP_TIME: expTime,
              CHECK_USING: false,
            },
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async updateOTPstatus(email, otp) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email, "OTP.CODE": otp },
        { $set: { "OTP.$.CHECK_USING": true } },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async verifyOTPAndActivateUser(email, otp) {
    const updatedUser = await USER_MODEL.findOneAndUpdate(
      { EMAIL: email, "OTP.CODE": otp },
      { $set: { IS_ACTIVATED: true, "OTP.$.CHECK_USING": true } },
      { new: true }
    );

    return updatedUser;
  }

  async resetPassword(email, newPassword, otp) {
    const hash = await this.hashPassword(newPassword);
    const result = await USER_MODEL.updateOne(
      { EMAIL: email, "OTP.CODE": otp },
      { $set: { PASSWORD: hash, "OTP.$.CHECK_USING": true } }
    );

    if (result.nModified === 0) {
      throw new Error("Failed to update password. User may not exist.");
    }

    return { success: true, message: "Password updated successfully." };
  }

  async getUsers(tabStatus, page, limit, search = "") {
    // Xây dựng giai đoạn $match dựa trên tabStatus
    let matchStage = {};

    switch (tabStatus) {
      case "1":
        // Người dùng chưa kích hoạt hoặc không bị chặn
        matchStage = {
          $or: [{ IS_ACTIVATED: false }, { "IS_BLOCKED.CHECK": { $ne: true } }],
        };
        break;
      case "2":
        // Người dùng đã kích hoạt và không bị chặn
        matchStage = { IS_ACTIVATED: true, "IS_BLOCKED.CHECK": { $ne: true } };
        break;
      case "3":
        // Người dùng bị chặn
        matchStage = { "IS_BLOCKED.CHECK": true };
        break;
      case "4":
        // Tất cả người dùng
        matchStage = {};
        break;
      default:
        throw new Error("Tab status không hợp lệ");
    }

    // Nếu có từ khóa tìm kiếm, thêm điều kiện vào giai đoạn $match
    if (search) {
      matchStage.$or = [
        { FULLNAME: { $regex: new RegExp(search, "i") } },
        { EMAIL: { $regex: new RegExp(search, "i") } },
        { PHONE_NUMBER: { $regex: new RegExp(search, "i") } },
      ];
    }

    try {
      const aggregatePipeline = [
        { $match: matchStage },
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            users: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          },
        },
      ];

      const result = await USER_MODEL.aggregate(aggregatePipeline).exec();

      const totalCount =
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
      const users = result[0].users;

      const totalPages = Math.ceil(totalCount / limit);

      return {
        users,
        totalPages,
        totalCount,
      };
    } catch (error) {
      console.error("Lỗi khi truy vấn người dùng:", error);
      throw new Error("Lỗi khi truy vấn người dùng");
    }
  }

  async blockUser(userId, isBlocked, blocked_byuserid) {
    const condition = { _id: userId };
    const data = {
      IS_BLOCKED: {
        CHECK: isBlocked,
        TIME: Date.now(),
        BLOCK_BY_USER_ID: blocked_byuserid,
      },
    };
    const options = { new: true };

    const foundUser = await USER_MODEL.findOneAndUpdate(
      condition,
      data,
      options
    );

    return foundUser;
  }

  async editUser(userId, data) {
    const user = await USER_MODEL.findById(userId);
    console.log(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (data.EMAIL && data.EMAIL !== user.EMAIL) {
      user.EMAIL = data.EMAIL;
      user.IS_ACTIVATED = false;
    }

    if (!data.EMAIL && data.CURRENT_PASSWORD) {
      const isPasswordValid = await this.checkPassword(
        data.CURRENT_PASSWORD,
        user.PASSWORD
      );
      if (!isPasswordValid) {
        throw new Error("Mật khẩu hiện tại không chính xác");
      }
    }

    const fieldsToUpdate = ["FULLNAME", "PHONE_NUMBER", "ADDRESS", "GENDER"];
    fieldsToUpdate.forEach((field) => {
      if (data[field]) {
        user[field] = data[field];
      }
    });

    await user.save();

    return user.toObject();
  }
}

module.exports = new USER_SERVICE();
