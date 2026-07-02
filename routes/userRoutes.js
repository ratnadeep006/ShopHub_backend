const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// register route
router.post('/register', userController.register);

// login route
router.post('/login', userController.login);  

// fetch user list
router.get('/list', userController.user_list);

// get user from by the id . 
router.get('/user/:id', userController.get_user_by_id);

module.exports = router;