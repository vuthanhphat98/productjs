var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/category');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res, next) {
  try {
    let categories = await categorySchema.find({ isDeleted: false });
    res.status(200).send({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let category = await categorySchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) throw new Error('Category not found');
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

// POST: Yêu cầu quyền mod hoặc admin
router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let newCategory = new categorySchema({ name: req.body.name });
    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    next(error);
  }
});

// PUT: Yêu cầu quyền mod hoặc admin
router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let category = await categorySchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) throw new Error('Category not found');
    if (req.body.name) category.name = req.body.name;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

// DELETE: Yêu cầu quyền admin
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let category = await categorySchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) throw new Error('Category not found');
    category.isDeleted = true;
    await category.save();
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;