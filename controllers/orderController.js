const db = require("../config/db");

exports.createOrder = (req, res) => {
  const { user_id } = req.params;

  const userQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(userQuery, [user_id], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.json({ success: false, message: 'User does not exist' });
    }

    const cartQuery = 'SELECT SUM(p.price * c.quantity) as total FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?';
    
    db.query(cartQuery, [user_id], (err, cartResult) => {
      if (err || !cartResult[0].total) {
        return res.json({ success: false, message: 'Cart is empty' });
      }

      const totalPrice = cartResult[0].total;

      const insertOrderQuery = 'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, "pending")';
      
      db.query(insertOrderQuery, [user_id, totalPrice], (err, result) => {
        if (err) return res.json({ success: false, message: err.message });

        const orderId = result.insertId;

        const insertItemsQuery = 'INSERT INTO orderItems (order_id, product_id, quantity, price) SELECT ?, c.product_id, c.quantity, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?';

        db.query(insertItemsQuery, [orderId, user_id], (err) => {
          if (err) return res.json({ success: false, message: err.message });

          const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';

          db.query(clearCartQuery, [user_id], (err) => {
            if (err) return res.json({ success: false, message: err.message });

            return res.json({ 
              success: true, 
              message: 'Order created successfully',
              order_id: orderId
            });
          });
        });
      });
    });
  });
};

exports.getUserOrders = (req, res) => {
  const { user_id } = req.params;

  const userQuery = "SELECT * FROM users WHERE id = ?";

  db.query(userQuery, [user_id], (err, userResult) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (userResult.length == 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const ordersQuery = "SELECT * FROM orders WHERE user_id = ?";
    db.query(ordersQuery, [user_id], (err, result) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      if (result.length == 0) {
        return res.json({ success: false, message: "Order Not found" });
      }
      return res.json({ success: true, data: result });
    });
  });
};

exports.getOrderDetails = (req, res) => {
  const { order_id, user_id } = req.params;

  const orderQuery = "SELECT * FROM orders WHERE id = ? AND user_id = ?";

  db.query(orderQuery, [order_id, user_id], (err, orderResult) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (orderResult.length == 0) {
      return res.json({ success: false, message: "Order does not exist" });
    }

    const itemsQuery = "SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name, p.image FROM orderItems oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?";

    db.query(itemsQuery, [order_id], (err, result) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      return res.json({ success: true, data: result });
    });
  });
};

exports.updateOrderStatus = (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  const orderQuery = "SELECT * FROM orders WHERE id = ?";

  db.query(orderQuery, [order_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (result.length == 0) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    const updateQuery = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(updateQuery, [status, order_id], (err, result) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      return res.json({ success: true, message: "Order updated successfully" });
    });
  });
};