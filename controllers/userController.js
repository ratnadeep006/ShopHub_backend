const db = require('../config/db');

exports.register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "ALL FIELDS ARE REQUIRED" });
  }

  const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  db.query(insertUserQuery, [username, email, password], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: "User Registered Successfully" });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Username and Password required' });
  }

  const loginQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(loginQuery, [email, password], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    if (result.length === 0) {
      return res.json({ success: false, message: "Invalid username or password" });
    }

    return res.json({ 
      success: true, 
      message: 'Login Successfully',
      data: result[0]
    });
  });
};

exports.user_list = (req, res) => {
  const getAllUsersQuery = 'SELECT * FROM users';

  db.query(getAllUsersQuery, (err, result) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true, data: result });
  });
};

exports.get_user_by_id = (req, res) => {
  const { id } = req.params;

  const getUserByIdQuery = 'SELECT * FROM users WHERE id = ?';

  db.query(getUserByIdQuery, [id], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    if (result.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: result[0] });
  });
};