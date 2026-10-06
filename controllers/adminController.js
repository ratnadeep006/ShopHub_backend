const db = require('../config/db');

// GET ALL USERS
exports.getAllUsers = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    if (result.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE USER
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res, next) => {
  try {
    const [result] = await db.query(
      `SELECT o.id, o.user_id, o.total_price, o.status, 
              o.created_at, u.name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      const error = new Error('Status is required');
      error.statusCode = 400;
      return next(error);
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    next(error);
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ADD PRODUCT
exports.addProduct = async (req, res, next) => {
  try {
    const { name, price, description, category_id, stock, image } = req.body;

    if (!name || !price) {
      const error = new Error('Name and price are required');
      error.statusCode = 400;
      return next(error);
    }

    const [result] = await db.query(
      `INSERT INTO products 
       (name, price, description, category_id, stock, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, description, category_id, stock || 0, image]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, category_id, stock, image } = req.body;

    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, price = ?, description = ?, 
           category_id = ?, stock = ?, image = ?
       WHERE id = ?`,
      [name, price, description, category_id, stock, image, id]
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

// GET ALL COUPONS
exports.getAllCoupons = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ADD COUPON
exports.addCoupon = async (req, res, next) => {
  try {
    const { code, discount, expiresAt, active } = req.body;

    if (!code || !discount) {
      const error = new Error('Code and discount are required');
      error.statusCode = 400;
      return next(error);
    }

    const [existing] = await db.query(
      'SELECT id FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    );

    if (existing.length > 0) {
      const error = new Error('Coupon code already exists');
      error.statusCode = 409;
      return next(error);
    }

    await db.query(
      `INSERT INTO coupons 
       (code, discount_percent, expiry_date, is_active) 
       VALUES (?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        discount,
        expiresAt || null,
        active ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Coupon added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE COUPON
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discount, expiresAt, active } = req.body;

    const [result] = await db.query(
      `UPDATE coupons 
       SET discount_percent = ?, expiry_date = ?, is_active = ?
       WHERE id = ?`,
      [discount, expiresAt || null, active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE COUPON
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM coupons WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET ALL RETURNS
exports.getAllReturns = async (req, res, next) => {
  try {
    const [result] = await db.query(
      `SELECT r.*, u.name, o.total_price
       FROM returns r
       JOIN users u ON r.user_id = u.id
       JOIN orders o ON r.order_id = o.id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// APPROVE RETURN
exports.approveReturn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE returns SET status = "approved" WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Return not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Return approved successfully' });
  } catch (error) {
    next(error);
  }
};

// REJECT RETURN
exports.rejectReturn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE returns SET status = "rejected" WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Return not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, message: 'Return rejected successfully' });
  } catch (error) {
    next(error);
  }
};

// GET ANALYTICS
exports.getAnalytics = async (req, res, next) => {
  try {
    // Total users
    const [users] = await db.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Total orders
    const [orders] = await db.query(
      'SELECT COUNT(*) as count FROM orders'
    );

    // Total revenue
    const [revenue] = await db.query(
      'SELECT SUM(total_price) as total FROM orders WHERE status != "cancelled"'
    );

    // Total products
    const [products] = await db.query(
      'SELECT COUNT(*) as count FROM products'
    );

    // Top products
    const [topProducts] = await db.query(
      `SELECT p.id, p.name, COUNT(oi.product_id) as sales
       FROM products p
       JOIN orderItems oi ON p.id = oi.product_id
       GROUP BY p.id, p.name
       ORDER BY sales DESC
       LIMIT 5`
    );

    // Monthly revenue
    const [monthlyRevenue] = await db.query(
      `SELECT 
         DATE_FORMAT(created_at, '%b') as month,
         SUM(total_price) as revenue
       FROM orders
       WHERE status != 'cancelled'
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%b'), 
                DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY DATE_FORMAT(created_at, '%Y-%m')`
    );

    // Average order value
    const [avgOrder] = await db.query(
      'SELECT AVG(total_price) as avg FROM orders WHERE status != "cancelled"'
    );

    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalOrders: orders[0].count,
        totalRevenue: revenue[0].total || 0,
        totalProducts: products[0].count,
        topProducts: topProducts,
        monthlyRevenue: monthlyRevenue,
        avgOrderValue: avgOrder[0].avg || 0,
        conversionRate: 0,
        returnRate: 0
      }
    });
  } catch (error) {
    next(error);
  }
};