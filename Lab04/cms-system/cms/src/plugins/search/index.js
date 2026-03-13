const Content = require('../../modules/content/model');
const logger = require('../../infrastructure/logger');

/**
 * Search Plugin — exposes full-text search using MongoDB $text index.
 * Can be swapped for Elasticsearch adapter without changing routes.
 */
const searchPlugin = {
  name: 'search',
  version: '1.0.0',

  async register(app, _container) {
    app.get('/api/search', async (req, res, next) => {
      try {
        const { q, type, page = 1, limit = 20 } = req.query;
        if (!q || q.trim().length < 2) {
          return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const filter = {
          $text: { $search: q },
          status: 'published',
        };
        if (type) filter.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
          Content.find(filter, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'name')
            .select('title slug excerpt type tags publishedAt author'),
          Content.countDocuments(filter),
        ]);

        res.json({
          success: true,
          query: q,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          items,
        });
      } catch (err) { next(err); }
    });

    logger.info('[Search Plugin] Registered: full-text search active');
  },
};

module.exports = searchPlugin;
