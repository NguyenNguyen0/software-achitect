const Joi = require('joi');
const userService = require('./service');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'editor', 'author', 'viewer').default('author'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class UserController {
  async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const user = await userService.register(value);
      res.status(201).json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { token, user } = await userService.login(value);
      res.json({ success: true, data: { token, user } });
    } catch (err) { next(err); }
  }

  async me(req, res, next) {
    try {
      const user = await userService.findById(req.user.sub);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const { page, limit, role } = req.query;
      const result = await userService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        role,
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async remove(req, res, next) {
    try {
      await userService.remove(req.params.id);
      res.json({ success: true, message: 'User deactivated' });
    } catch (err) { next(err); }
  }
}

module.exports = new UserController();
