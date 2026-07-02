const db = require("../config/db");

exports.addToCart = (req, res) => {
  const { user_id } = req.params;
  const { product_id, quantity } = req.body;

  // Step 1: Check user exists
  const userQuery = "SELECT * FROM users WHERE id = ?";
  db.query(userQuery, [user_id], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // Step 2: Check product exists and stock
    const productQuery = "SELECT * FROM products WHERE id = ?";
    db.query(productQuery, [product_id], (err, productResult) => {
      if (err || productResult.length === 0) {
        return res.json({ success: false, message: "Product does not exist" });
      }

      // Step 3: Check stock
      if (productResult[0].stock <= 0) {
        return res.json({ success: false, message: "Product is not in stock" });
      }

      if (productResult[0].stock < quantity) {
        return res.json({ success: false, message: "Insufficient stock" });
      }

      // Step 4: Check if item already in cart
      const checkCartQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
      db.query(checkCartQuery, [user_id, product_id], (err, cartResult) => {
        if (err) return res.json({ success: false, message: err.message });

        if (cartResult.length > 0) {
          // Item exists - UPDATE quantity
          const updateCartQuery = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
          db.query(updateCartQuery, [quantity, user_id, product_id], (err) => {
            if (err) return res.json({ success: false, message: err.message });
            return res.json({
              success: true,
              message: "Cart updated successfully",
            });
          });
        } else {
          // Item doesn't exist - INSERT
          const insertCartQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
          db.query(insertCartQuery, [user_id, product_id, quantity], (err) => {
            if (err) return res.json({ success: false, message: err.message });
            return res.json({
              success: true,
              message: "Item added to cart successfully",
            });
          });
        }
      });
    });
  });
};

exports.getCart = (req, res) => {
  const { user_id } = req.params;

  const getCartQuery = 'SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?';

  db.query(getCartQuery, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: 'Invalid user id' });
    }
    if (result.length == 0) {
      return res.json({ success: false, message: 'Cart is empty' });
    }
    return res.json({ success: true, data: result });
  });
};

exports.updateQuantity = (req, res) => {
  const { user_id, product_id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    const deleteCartQuery = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';
    
    db.query(deleteCartQuery, [user_id, product_id], (err, result) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      return res.json({ success: true, message: 'Item removed from cart' });
    });
  } else {
    const updateQuantityQuery = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';

    db.query(updateQuantityQuery, [quantity, user_id, product_id], (err, result) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }

      if (result.affectedRows === 0) {
        return res.json({ success: false, message: 'Item not in cart' });
      }

      return res.json({ success: true, message: 'Quantity updated' });
    });
  }
};

exports.removeFromCart = (req, res) => {
  const { user_id, product_id } = req.params;
  
  const removeItemQuery = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';

  db.query(removeItemQuery, [user_id, product_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Item not in cart' });
    }
    
    return res.json({ success: true, message: 'Item deleted successfully' });
  });
};

exports.clearCart = (req, res) => {
  const { user_id } = req.params;

  const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';

  db.query(clearCartQuery, [user_id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    if (result.affectedRows == 0) {
      return res.json({ success: false, message: 'Cart is empty' });
    }
    if (result.affectedRows > 0) {
      return res.json({ success: true, message: 'Cart cleared successfully' });
    }
  });
};