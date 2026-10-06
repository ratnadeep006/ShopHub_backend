const db = require('../config/db');

// GET ALL PRODUCTS (with pagination, search, filter)
exports.getAllProducts = async (req, res, next) => {
  try {
    // URL se page, limit, search, category lo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Base query
    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    let params = [];
    let countParams = [];

    // Search filter
    if (search) {
      query += ' AND name LIKE ?';
      countQuery += ' AND name LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Category filter
    if (category) {
      query += ' AND category_id = ?';
      countQuery += ' AND category_id = ?';
      params.push(category);
      countParams.push(category);
    }

    // Total count
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    // Pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [result] = await db.query(query, params);

    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit: limit
      }
    });

  } catch (error) {
    next(error);
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};

// ADD PRODUCT
exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category_id, image } = req.body;

    if (!name || !price || !stock || !category_id) {
      const error = new Error('All required fields missing');
      error.statusCode = 400;
      return next(error);
    }

    await db.query(
      'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category_id, image]
    );

    res.json({ success: true, message: 'Product added successfully' });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image } = req.body;

    if (!name || !price || !stock || !category_id) {
      const error = new Error('All required fields missing');
      error.statusCode = 400;
      return next(error);
    }

    const [result] = await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image = ? WHERE id = ?',
      [name, description, price, stock, category_id, image, id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};