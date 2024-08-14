const USER_MODEL = require('../../Model/User/User.Model');
const USER_SERVICE = require('../../Service/User/User.Service');
// const { registerValidate } = require('../../Model/User/validate/validateUser');
const USER_VALIDATES = require('../../Model/User/validate/validateUser')
class USER_CONTROLLER {
    registerUser = async (req, res) => {
        const payload = req.body;
        
        // Validate dữ liệu đầu vào
        const { error, value } = USER_VALIDATES.registerValidate.validate(payload);

        if (error) {
            const errors = error.details.reduce((acc, current) => {
                acc[current.context.key] = current.message;
                return acc;
            }, {});
            return res.status(400).json({ errors });
        }

        const { EMAIL, PHONE_NUMBER } = value;

        try {
            // Kiểm tra xem người dùng đã tồn tại chưa
            const checkUserExists = await USER_SERVICE.checkUserExists(EMAIL, PHONE_NUMBER);
            if (checkUserExists) {
                return res.status(400).json({ message: 'Email hoặc số điện thoại đã tồn tại.' });
            }

            // Đăng ký người dùng
            const newUser = await USER_SERVICE.registerUser(payload);
            const { PASSWORD, ...userWithoutPassword } = newUser;
            return res.status(201).json({
                success: true,
                message: "Đăng ký người dùng thành công!!!",
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ 
                success: false, 
                message: "Đăng ký người dùng thất bại!!!",
                error: error.message 
            });
        }
    }

    login = async (req, res) => {
        const payload = req.body;
        const { error } = USER_VALIDATES.loginValidate.validate(payload);
        if (error) {
        return res.status(401).json({ message: error.details[0].message });
        }
    
        try {
          const user = await USER_SERVICE.checkUserExists(payload.EMAIL, payload.PHONE_NUMBER);
    
          if (!user) {
            return res.status(404).json({
              success: false,
              message: "Người dùng không tồn tại."
            });
          }
    
          const isPasswordValid = await USER_SERVICE.checkPassword(payload.PASSWORD, user.PASSWORD);
          if (!isPasswordValid) {
            return res.status(401).json({
              success: false,
              message: "Mật khẩu không chính xác."
            });
          }
    
        //   const payload = { id: user._id, EMAIL: user.EMAIL, PHONE_NUMBER: user.PHONE_NUMBER };
          const data_sign = {
            userId: user._id,
          };
          const accessToken = await USER_SERVICE.login (data_sign);
    
          return res.status(200).json({
            success: true,
            message: user,
            metadata: accessToken
          });
        } catch (err) {
          console.error('Error logging in:', err);
          return res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại.",
            error: err.message
          });
        }
      }
};

module.exports = new USER_CONTROLLER();