const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// GET all products (cache 10 minutes)
router.get(
  '/products',
  cacheMiddleware(600),
  productController.getAllProducts
);

// GET product by ID (cache 5 minutes)
router.get(
  '/products/:id',
  cacheMiddleware(300),
  productController.getProductById
);

// POST add product (clear cache after adding)
router.post('/products', async (req, res, next) => {
  await clearCache('cache:/api/products*');
  next();
}, productController.addProduct);

// PUT update product (clear cache after updating)
router.put('/products/:id', async (req, res, next) => {
  await clearCache('cache:/api/products*');
  next();
}, productController.updateProduct);

// DELETE product (clear cache after deleting)
router.delete('/products/:id', async (req, res, next) => {
  await clearCache('cache:/api/products*');
  next();
}, productController.deleteProduct);

module.exports = router;