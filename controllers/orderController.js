const db = require("../config/db");


// ======================================================
// CREATE ORDER
// ======================================================

exports.createOrder = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const { user_id } = req.params;
    const { address_id, coupon_code } = req.body;

    // ==================================================
    // CHECK USER
    // ==================================================

    const [user] = await connection.query(
      `SELECT id
       FROM users
       WHERE id = ?`,
      [user_id]
    );

    if (user.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }


    // ==================================================
    // CHECK ADDRESS
    // ==================================================

    if (!address_id) {
      const error = new Error("Delivery address is required");
      error.statusCode = 400;
      return next(error);
    }

    const [address] = await connection.query(
      `SELECT id
       FROM addresses
       WHERE id = ? AND user_id = ?`,
      [address_id, user_id]
    );

    if (address.length === 0) {
      const error = new Error("Invalid delivery address");
      error.statusCode = 400;
      return next(error);
    }


    // ==================================================
    // GET CART
    // ==================================================

    const [cartItems] = await connection.query(
      `SELECT
         c.product_id,
         c.quantity,
         p.price
       FROM cart c
       JOIN products p
         ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id]
    );

    if (cartItems.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 400;
      return next(error);
    }


    // ==================================================
    // CALCULATE TOTAL
    // ==================================================

    let totalPrice = 0;

    for (const item of cartItems) {
      totalPrice += Number(item.price) * Number(item.quantity);
    }


    // ==================================================
    // COUPON VALIDATION
    // ==================================================

    let finalDiscount = 0;
    let couponId = null;
    let couponCode = null;

    if (coupon_code && coupon_code.trim() !== "") {

      const normalizedCouponCode =
        coupon_code.trim().toUpperCase();


      const [coupons] = await connection.query(
        `SELECT *
         FROM coupons
         WHERE code = ?`,
        [normalizedCouponCode]
      );


      // Coupon doesn't exist
      if (coupons.length === 0) {
        const error = new Error("Invalid coupon code");
        error.statusCode = 400;
        return next(error);
      }


      const coupon = coupons[0];


      // ==================================================
      // CHECK ACTIVE
      // ==================================================

      if (!coupon.is_active) {
        const error = new Error(
          "This coupon is no longer active"
        );

        error.statusCode = 400;
        return next(error);
      }


      // ==================================================
      // CHECK EXPIRY
      // ==================================================

      if (coupon.expiry_date) {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(coupon.expiry_date);
        expiry.setHours(0, 0, 0, 0);

        if (today > expiry) {
          const error = new Error(
            "This coupon has expired"
          );

          error.statusCode = 400;
          return next(error);
        }
      }


      // ==================================================
      // CHECK USAGE LIMIT
      // ==================================================

      if (
        Number(coupon.max_uses) !== -1 &&
        Number(coupon.current_uses) >= Number(coupon.max_uses)
      ) {
        const error = new Error(
          "This coupon has reached its usage limit"
        );

        error.statusCode = 400;
        return next(error);
      }


      // ==================================================
      // CHECK MINIMUM ORDER AMOUNT
      // ==================================================

      if (
        totalPrice < Number(coupon.min_order_amount)
      ) {
        const error = new Error(
          `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`
        );

        error.statusCode = 400;
        return next(error);
      }


      // ==================================================
      // CALCULATE DISCOUNT
      // ==================================================

      finalDiscount =
        (totalPrice * Number(coupon.discount_percent)) / 100;


      couponId = coupon.id;
      couponCode = coupon.code;
    }


    // ==================================================
    // CALCULATE FINAL PRICE
    // ==================================================

    const finalPrice =
      totalPrice - finalDiscount;


    // ==================================================
    // START TRANSACTION
    // ==================================================

    await connection.beginTransaction();


    // ==================================================
    // CREATE ORDER
    // ==================================================

    const [orderResult] = await connection.query(
      `INSERT INTO orders
      (
        user_id,
        total_price,
        status,
        address_id,
        coupon_code,
        discount
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        finalPrice,
        "pending",
        address_id,
        couponCode,
        finalDiscount
      ]
    );


    const orderId = orderResult.insertId;


    // ==================================================
    // CREATE ORDER ITEMS
    // ==================================================

    for (const item of cartItems) {

      await connection.query(
        `INSERT INTO orderItems
        (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.quantity,
          item.price
        ]
      );

    }


    // ==================================================
    // UPDATE COUPON USAGE
    // ==================================================

    if (couponId) {

      const [couponUpdate] = await connection.query(
        `UPDATE coupons
         SET current_uses = current_uses + 1
         WHERE id = ?
         AND (
           max_uses = -1
           OR current_uses < max_uses
         )`,
        [couponId]
      );


      // Coupon usage limit reached during order creation
      if (couponUpdate.affectedRows === 0) {

        throw new Error(
          "This coupon has just reached its usage limit. Please try again."
        );

      }
    }


    // ==================================================
    // CLEAR CART
    // ==================================================

    await connection.query(
      `DELETE FROM cart
       WHERE user_id = ?`,
      [user_id]
    );


    // ==================================================
    // COMMIT TRANSACTION
    // ==================================================

    await connection.commit();


    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({

      success: true,

      message: "Order created successfully",

      data: {

        order_id: orderId,

        total_price: totalPrice.toFixed(2),

        discount: finalDiscount.toFixed(2),

        final_price: finalPrice.toFixed(2),

        coupon_code: couponCode,

        address_id: address_id

      }

    });


  } catch (error) {

    // ==================================================
    // ROLLBACK
    // ==================================================

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    next(error);

  } finally {

    connection.release();

  }
};



// ======================================================
// GET USER ORDERS
// ======================================================

exports.getUserOrders = async (req, res, next) => {

  try {

    const { user_id } = req.params;


    // CHECK USER

    const [user] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?`,
      [user_id]
    );


    if (user.length === 0) {

      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      return next(error);

    }


    // GET ORDERS

    const [orders] = await db.query(
      `SELECT *
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );


    res.json({

      success: true,

      data: orders

    });


  } catch (error) {

    next(error);

  }

};



// ======================================================
// GET ORDER DETAILS
// ======================================================

exports.getOrderDetails = async (req, res, next) => {

  try {

    const {
      order_id,
      user_id
    } = req.params;


    // ==================================================
    // GET ORDER
    // ==================================================

    const [order] = await db.query(
      `SELECT *
       FROM orders
       WHERE id = ?
       AND user_id = ?`,
      [
        order_id,
        user_id
      ]
    );


    if (order.length === 0) {

      const error = new Error(
        "Order not found"
      );

      error.statusCode = 404;

      return next(error);

    }


    // ==================================================
    // GET ORDER ITEMS
    // ==================================================

    const [items] = await db.query(
      `SELECT
         oi.id,
         oi.order_id,
         oi.product_id,
         oi.quantity,
         oi.price,
         p.name,
         p.image
       FROM orderItems oi
       JOIN products p
         ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order_id]
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

      success: true,

      data: {

        order: order[0],

        items: items

      }

    });


  } catch (error) {

    next(error);

  }

};



// ======================================================
// UPDATE ORDER STATUS
// ======================================================

exports.updateOrderStatus = async (req, res, next) => {

  try {

    const { order_id } = req.params;

    const { status } = req.body;


    // ==================================================
    // CHECK STATUS
    // ==================================================

    if (!status) {

      const error = new Error(
        "Status is required"
      );

      error.statusCode = 400;

      return next(error);

    }


    // ==================================================
    // CHECK ORDER
    // ==================================================

    const [order] = await db.query(
      `SELECT id
       FROM orders
       WHERE id = ?`,
      [order_id]
    );


    if (order.length === 0) {

      const error = new Error(
        "Order not found"
      );

      error.statusCode = 404;

      return next(error);

    }


    // ==================================================
    // UPDATE STATUS
    // ==================================================

    await db.query(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [
        status,
        order_id
      ]
    );


    res.json({

      success: true,

      message: "Order status updated successfully"

    });


  } catch (error) {

    next(error);

  }

};