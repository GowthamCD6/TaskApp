const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/userController');

router.route('/')
  .get(getUsers)
  .post(createUser);

router.get('/:id', getUserById);

module.exports = router;
