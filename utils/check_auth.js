let jwt = require('jsonwebtoken');
let constants = require('./constants');
let userControllers = require('../controllers/users');

module.exports = {
  check_authentication: async function (req, res, next) {
    try {
      if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        throw new Error("Bạn chưa đăng nhập");
      }

      let token = req.headers.authorization.split(" ")[1];
      let decoded = jwt.verify(token, constants.SECRET_KEY); // Xác thực token

      // Kiểm tra thời gian hết hạn (JWT dùng 'exp' thay vì 'expireIn')
      if (decoded.exp * 1000 < Date.now()) { // 'exp' là timestamp giây, chuyển sang mili giây
        throw new Error("Token đã hết hạn");
      }

      let user = await userControllers.getUserById(decoded.id);
      if (!user) throw new Error("Người dùng không tồn tại");

      req.user = user; // Gán user đầy đủ (bao gồm role đã populate)
      next();
    } catch (error) {
      next(error);
    }
  },
  check_authorization: function (roles) {
    return function (req, res, next) {
      try {
        let roleOfUser = req.user.role.name; // Role đã populate từ schema
        if (!roles.includes(roleOfUser)) {
          throw new Error("Bạn không có quyền");
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
};