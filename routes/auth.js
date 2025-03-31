var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
const { check_authentication } = require('../utils/check_auth');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

// POST /login: Không yêu cầu đăng nhập
router.post('/login', async function (req, res, next) {
  try {
    let userId = await userControllers.checkLogin(req.body.username, req.body.password);
    let user = await userControllers.getUserById(userId);
    const token = jwt.sign(
      { id: userId, role: user.role.name, exp: Math.floor(Date.now() / 1000) + 3600 },
      constants.SECRET_KEY
    );
    res.status(200).send({ success: true, data: token });
  } catch (error) {
    next(error);
  }
});

// POST /signup: Không yêu cầu đăng nhập
router.post('/signup', async function (req, res, next) {
  try {
    let result = await userControllers.createAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      'user' // Role mặc định là 'user'
    );
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /me: Yêu cầu đăng nhập
router.get('/me', check_authentication, async function (req, res, next) {
  try {
    res.send({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

// POST /changepassword: Yêu cầu đăng nhập
router.post('/changepassword', check_authentication, async function (req, res, next) {
  try {
    let user = await userControllers.getUserById(req.user.id);
    let updatedUser = await userControllers.changePassword(user, req.body.oldpassword, req.body.newpassword);
    res.send({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;