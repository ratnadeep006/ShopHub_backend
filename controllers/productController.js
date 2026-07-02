const db = require('../config/db');

exports.getAllProducts = (req, res) => {
  const getAllProductsQuery = 'SELECT * FROM products';

  db.query(getAllProductsQuery, (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    return res.json({ success: true, data: result });
  });
};

exports.getProductById = (req, res) => {
  const { id } = req.params;
  const getProductByIdQuery = 'SELECT * FROM products WHERE id = ?';

  db.query(getProductByIdQuery, [id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (result.length === 0) {
      return res.json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: result[0] });
  });
};

exports.addProduct = (req, res) => {
  const { name, description, price, stock, category_id, image } = req.body;

  // Validation
  if (!name || !price || !stock || !category_id) {
    return res.json({ success: false, message: "All required fields missing" });
  }

  const addProductQuery = 'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(addProductQuery, [name, description, price, stock, category_id, image], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    return res.json({ success: true, message: "Product added successfully" });
  });
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image } = req.body;

  // Validation
  if (!name || !price || !stock || !category_id) {
    return res.json({ success: false, message: "All required fields missing" });
  }

  const updateProductQuery = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image = ? WHERE id = ?';

  db.query(updateProductQuery, [name, description, price, stock, category_id, image, id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, message: "Product updated successfully" });
  });
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const deleteProductQuery = 'DELETE FROM products WHERE id = ?';

  db.query(deleteProductQuery, [id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, message: "Product deleted successfully" });
  });
};