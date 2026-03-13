const eventBus = require('../../kernel/event-bus');
const Content = require('../../modules/content/model');
const logger = require('../../infrastructure/logger');

/**
 * SEO Plugin — listens to content events and auto-generates
 * meta titles, descriptions, and keywords.
 */
const seoPlugin = {
  name: 'seo',
  version: '1.0.0',

  async register(app, container) {
    // Auto-generate SEO metadata when content is created/updated
    eventBus.subscribe('content:created', async ({ contentId }) => {
      await seoPlugin._generateMeta(contentId);
    });

    eventBus.subscribe('content:updated', async ({ contentId }) => {
      await seoPlugin._generateMeta(contentId);
    });

    // Expose SEO endpoint
    app.get('/api/seo/:slug', async (req, res, next) => {
      try {
        const content = await Content.findOne({ slug: req.params.slug }).select('seo title slug');
        if (!content) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true, data: content.seo });
      } catch (err) { next(err); }
    });

    logger.info('[SEO Plugin] Registered: auto meta-generation active');
  },

  async _generateMeta(contentId) {
    try {
      const content = await Content.findById(contentId);
      if (!content) return;

      const metaTitle = content.title.length > 60
        ? content.title.substring(0, 57) + '...'
        : content.title;

      const metaDescription = content.excerpt
        || content.body.replace(/<[^>]*>/g, '').substring(0, 155) + '...';

      const keywords = [
        ...content.tags,
        ...content.title.toLowerCase().split(' ').filter((w) => w.length > 4),
      ].slice(0, 10);

      await Content.findByIdAndUpdate(contentId, {
        seo: { metaTitle, metaDescription, keywords },
      });

      logger.debug(`[SEO Plugin] Meta generated for content: ${contentId}`);
    } catch (err) {
      logger.error(`[SEO Plugin] Failed to generate meta: ${err.message}`);
    }
  },
};

module.exports = seoPlugin;
