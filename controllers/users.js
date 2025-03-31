let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
let bcrypt = require('bcrypt');

module.exports = {
  // Lấy tất cả user (chỉ lấy user chưa xóa mềm)
  getAllUsers: async function () {
    return userSchema.find({ status: true }).populate('role');
  },

  // Lấy user theo ID
  getUserById: async function (id) {
    const user = await userSchema.findById(id).populate('role');
    if (!user) throw new Error('User không tồn tại');
    return user;
  },

  // Lấy user theo username
  getUserByUsername: async function (username) {
    if (!username) throw new Error('Username là bắt buộc');
    const user = await userSchema.findOne({ username: username });
    return user; // Có thể null nếu không tìm thấy, xử lý ở nơi gọi
  },

  // Tạo user mới
  createAnUser: async function (username, password, email, roleI) {
    if (!username || !password || !email || !roleI) {
      throw new Error('Username, password, email và role là bắt buộc');
    }
    const role = await roleSchema.findOne({ name: roleI });
    if (!role) throw new Error('Role không tồn tại');

    const hashedPassword = bcrypt.hashSync(password, 10); // Mã hóa mật khẩu
    const newUser = new userSchema({
      username: username,
      password: hashedPassword,
      email: email,
      role: role._id,
      status: true // Đảm bảo user mới có status true
    });
    return await newUser.save();
  },

  // Cập nhật user
  updateAnUser: async function (id, body) {
    const updatedUser = await this.getUserById(id); // Đã có kiểm tra tồn tại trong getUserById
    const allowFields = ['password', 'email'];
    for (const key of Object.keys(body)) {
      if (allowFields.includes(key)) {
        if (key === 'password') {
          updatedUser[key] = bcrypt.hashSync(body[key], 10); // Mã hóa nếu cập nhật password
        } else {
          updatedUser[key] = body[key];
        }
      }
    }
    await updatedUser.save();
    return updatedUser;
  },

  // Xóa mềm user
  deleteAnUser: async function (id) {
    const updatedUser = await userSchema.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    if (!updatedUser) throw new Error('User không tồn tại');
    return updatedUser;
  },

  // Kiểm tra đăng nhập
  checkLogin: async function (username, password) {
    if (!username || !password) throw new Error('Username và password là bắt buộc');
    const user = await this.getUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error('Username hoặc password không đúng');
    }
    return user._id;
  },

  // Đổi mật khẩu
  changePassword: async function (user, oldpassword, newpassword) {
    if (!oldpassword || !newpassword) throw new Error('Mật khẩu cũ và mới là bắt buộc');
    if (!bcrypt.compareSync(oldpassword, user.password)) {
      throw new Error('Mật khẩu cũ không đúng');
    }
    user.password = bcrypt.hashSync(newpassword, 10); // Mã hóa mật khẩu mới
    return await user.save();
  }
};