const jwt = require('jsonwebtoken');
const User = require('./model');
const config = require('../../../config/default');
const eventBus = require('../../kernel/event-bus');

class UserService {
  async register({ name, email, password, role }) {
    const exists = await User.findOne({ email });
    if (exists) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

    const user = await User.create({ name, email, password, role });
    eventBus.publish('user:registered', { userId: user._id, email });
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

    const valid = await user.comparePassword(password);
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    eventBus.publish('user:loggedIn', { userId: user._id });
    return { token, user };
  }

  async findById(id) {
    const user = await User.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }

  async list({ page = 1, limit = 20, role } = {}) {
    const filter = role ? { role } : {};
    const [users, total] = await Promise.all([
      User.find(filter).skip((page - 1) * limit).limit(limit).sort('-createdAt'),
      User.countDocuments(filter),
    ]);
    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async update(id, data) {
    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    eventBus.publish('user:updated', { userId: id });
    return user;
  }

  async remove(id) {
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    eventBus.publish('user:deactivated', { userId: id });
    return user;
  }
}

module.exports = new UserService();
