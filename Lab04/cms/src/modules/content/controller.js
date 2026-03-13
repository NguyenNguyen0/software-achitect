const Joi = require('joi');
const contentService = require('./service');

const createSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  body: Joi.string().min(10).required(),
  excerpt: Joi.string().max(500),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  type: Joi.string().valid('article', 'page', 'post').default('article'),
  tags: Joi.array().items(Joi.string()).default([]),
  featuredImage: Joi.string().uri().allow(null, ''),
});

class ContentController {
  async create(req, res, next) {
    try {
      const { error, value } = createSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const content = await contentService.create(value, req.user.sub);
      res.status(201).json({ success: true, data: content });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const { page, limit, status, type, tag, search } = req.query;
      const result = await contentService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status, type, tag, search,
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async findById(req, res, next) {
    try {
      const content = await contentService.findById(req.params.id);
      res.json({ success: true, data: content });
    } catch (err) { next(err); }
  }

  async findBySlug(req, res, next) {
    try {
      const content = await contentService.findBySlug(req.params.slug);
      res.json({ success: true, data: content });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const content = await contentService.update(req.params.id, req.body, req.user.sub);
      res.json({ success: true, data: content });
    } catch (err) { next(err); }
  }

  async publish(req, res, next) {
    try {
      const content = await contentService.publish(req.params.id, req.user.sub);
      res.json({ success: true, data: content });
    } catch (err) { next(err); }
  }

  async remove(req, res, next) {
    try {
      await contentService.remove(req.params.id);
      res.json({ success: true, message: 'Content deleted' });
    } catch (err) { next(err); }
  }
}

module.exports = new ContentController();
