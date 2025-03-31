var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
});

// POST: Yêu cầu quyền admin
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let newRole = new roleSchema({ name: req.body.name });
    await newRole.save();
    res.status(200).send({ success: true, data: newRole });
  } catch (error) {
    next(error);
  }
});

// PUT: Yêu cầu quyền admin
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role) throw new Error('Role not found');
    if (req.body.name) role.name = req.body.name;
    await role.save();
    res.status(200).send({ success: true, data: role });
  } catch (error) {
    next(error);
  }
});

// DELETE: Yêu cầu quyền admin
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (!role) throw new Error('Role not found');
    await role.remove(); // Xóa cứng vì không có isDeleted
    res.status(200).send({ success: true, message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;