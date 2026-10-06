const db = require("../config/db");

// =======================
// ADD TO CART
// =======================
exports.addToCart = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { product_id, quantity = 1 } = req.body;

    // Check user
    const [users] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check product
    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Check existing cart item
    const [cart] = await db.query(
      "SELECT * FROM cart WHERE user_id=? AND product_id=?",
      [user_id, product_id]
    );

    if (cart.length > 0) {
      await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id=? AND product_id=?",
        [quantity, user_id, product_id]
      );

      return res.json({
        success: true,
        message: "Cart updated successfully",
      });
    }

    // Insert new cart item
    await db.query(
      "INSERT INTO cart(user_id,product_id,quantity) VALUES(?,?,?)",
      [user_id, product_id, quantity]
    );

    res.json({
      success: true,
      message: "Item added to cart successfully",
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// =======================
// GET CART
// =======================
exports.getCart = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const [cart] = await db.query(
      `SELECT
          c.id,
          c.product_id,
          c.quantity,
          p.name,
          p.price,
          p.image,
          p.stock
       FROM cart c
       JOIN products p
       ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id]
    );

    res.json({
      success: true,
      data: cart,
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// =======================
// UPDATE QUANTITY
// =======================
exports.updateQuantity = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await db.query(
        "DELETE FROM cart WHERE user_id=? AND product_id=?",
        [user_id, product_id]
      );

      return res.json({
        success: true,
        message: "Item removed",
      });
    }

    await db.query(
      "UPDATE cart SET quantity=? WHERE user_id=? AND product_id=?",
      [quantity, user_id, product_id]
    );

    res.json({
      success: true,
      message: "Quantity updated",
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// =======================
// REMOVE ITEM
// =======================
exports.removeFromCart = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.params;

    await db.query(
      "DELETE FROM cart WHERE user_id=? AND product_id=?",
      [user_id, product_id]
    );

    res.json({
      success: true,
      message: "Item removed successfully",
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// =======================
// CLEAR CART
// =======================
exports.clearCart = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    await db.query(
      "DELETE FROM cart WHERE user_id=?",
      [user_id]
    );

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};