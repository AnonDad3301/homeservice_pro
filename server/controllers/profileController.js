const { User } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    await User.update({ name, email, phone }, { where: { id: req.user.id } });
    res.json({ message: 'Профиль обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};