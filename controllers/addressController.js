const db = require('../config/db');

// ADD ADDRESS
exports.addAddress = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { address, city, state, pincode, phone, is_default } = req.body;

    // Validate required fields
    if (!address || address.trim().length === 0) {
      const error = new Error('Address is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!city || city.trim().length === 0) {
      const error = new Error('City is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!state || state.trim().length === 0) {
      const error = new Error('State is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!pincode || pincode.trim().length === 0) {
      const error = new Error('Pincode is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!phone || phone.trim().length === 0) {
      const error = new Error('Phone number is required');
      error.statusCode = 400;
      return next(error);
    }

    // Check if user exists
    const [user] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );

    if (user.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // If this address should be default, unset other defaults first
    if (is_default) {
      await db.query(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [user_id]
      );
    }

    // Insert address
    await db.query(
      `INSERT INTO addresses 
        (user_id, address, city, state, pincode, phone, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        address,
        city,
        state,
        pincode,
        phone,
        is_default ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully'
    });

  } catch (error) {
    next(error);
  }
};

// GET USER ADDRESSES
exports.getUserAddresses = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
      `SELECT id, user_id, address, city, state, pincode, phone, is_default, created_at
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE ADDRESS
exports.updateAddress = async (req, res, next) => {
  try {
    const { address_id } = req.params;
    const { address, city, state, pincode, phone, user_id } = req.body;

    // Validate required fields
    if (!address || address.trim().length === 0) {
      const error = new Error('Address is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!city || city.trim().length === 0) {
      const error = new Error('City is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!state || state.trim().length === 0) {
      const error = new Error('State is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!pincode || pincode.trim().length === 0) {
      const error = new Error('Pincode is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!phone || phone.trim().length === 0) {
      const error = new Error('Phone number is required');
      error.statusCode = 400;
      return next(error);
    }

    // Get address first
    const [existingAddress] = await db.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [address_id]
    );

    if (existingAddress.length === 0) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns this address
    if (existingAddress[0].user_id !== user_id) {
      const error = new Error('You can only edit your own address');
      error.statusCode = 403;
      return next(error);
    }

    // Update address
    await db.query(
      `UPDATE addresses 
       SET address = ?, city = ?, state = ?, pincode = ?, phone = ?
       WHERE id = ?`,
      [address, city, state, pincode, phone, address_id]
    );

    res.json({
      success: true,
      message: 'Address updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// DELETE ADDRESS
exports.deleteAddress = async (req, res, next) => {
  try {
    const { address_id } = req.params;
    const user_id = req.body.user_id;  // Check if user owns address

    // Get address first
    const [address] = await db.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [address_id]
    );

    if (address.length === 0) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns this address
    if (address[0].user_id !== user_id) {
      const error = new Error('You can only delete your own address');
      error.statusCode = 403;
      return next(error);
    }

    // Delete address
    await db.query(
      'DELETE FROM addresses WHERE id = ?',
      [address_id]
    );

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// SET DEFAULT ADDRESS
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { address_id } = req.params;
    const user_id = req.body.user_id;

    // Get address first
    const [address] = await db.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [address_id]
    );

    if (address.length === 0) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns this address
    if (address[0].user_id !== user_id) {
      const error = new Error('You can only set your own address as default');
      error.statusCode = 403;
      return next(error);
    }

    // Unset previous default addresses for this user
    await db.query(
      'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
      [user_id]
    );

    // Set this address as default
    await db.query(
      'UPDATE addresses SET is_default = 1 WHERE id = ?',
      [address_id]
    );

    res.json({
      success: true,
      message: 'Default address updated successfully'
    });

  } catch (error) {
    next(error);
  }
};