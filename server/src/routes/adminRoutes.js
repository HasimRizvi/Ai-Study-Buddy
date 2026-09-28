const express = require('express');
const {
  getStats,
  getUsers,
  updateUserStatus,
  changeUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
