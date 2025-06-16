const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authController = require('../controllers/authController');
const serviceController = require('../controllers/serviceController');
const profileController = require('../controllers/profileController');

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/profile', auth, profileController.getProfile);
router.get('/services', serviceController.getServices);
router.post('/services', auth, serviceController.addService);
router.delete('/services/:id', auth, serviceController.deleteService);

router.get('/admin', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещен' });
  res.json({ message: 'Добро пожаловать в админскую панель' });
});

module.exports = router;