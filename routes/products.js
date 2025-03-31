var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

function BuildQuery(query) {
  let result = { isDeleted: false }; // Lọc sản phẩm chưa xóa
  if (query.name) result.name = new RegExp(query.name, 'i');
  result.price = {};
  if (query.price) {
    if (query.price.$gte && !isNaN(Number(query.price.$gte))) result.price.$gte = Number(query.price.$gte);
    else result.price.$gte = 0;
    if (query.price.$lte && !isNaN(Number(query.price.$lte))) result.price.$lte = Number(query.price.$lte);
    else result.price.$lte = 10000;
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// GET: Không yêu cầu đăng nhập
router.get('/', async function (req, res, next) {
  try {
    let products = await productSchema.find(BuildQuery(req.query)).populate({ path: 'category', select: 'name' });
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let product = await productSchema.findOne({ _id: req.params.id, isDeleted: false }).populate('category');
    if (!product) throw new Error('Product not found');
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// POST: Yêu cầu quyền mod hoặc admin
router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let body = req.body;
    let category = await categorySchema.findOne({ name: body.category, isDeleted: false });
    if (!category) throw new Error('Category not found');
    let newProduct = new productSchema({
      name: body.name,
      price: body.price || 0,
      quantity: body.quantity || 0,
      category: category._id,
    });
    await newProduct.save();
    res.status(200).send({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
});

// PUT: Yêu cầu quyền mod hoặc admin
router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let product = await productSchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) throw new Error('Product not found');
    let body = req.body;
    if (body.name) product.name = body.name;
    if (body.price) product.price = body.price;
    if (body.quantity) product.quantity = body.quantity;
    if (body.category) {
      let category = await categorySchema.findOne({ name: body.category, isDeleted: false });
      if (!category) throw new Error('Category not found');
      product.category = category._id;
    }
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// DELETE: Yêu cầu quyền admin
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let product = await productSchema.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) throw new Error('Product not found');
    product.isDeleted = true;
    await product.save();
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;