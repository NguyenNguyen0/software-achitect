const Content = require('./model');
const cache = require('../../infrastructure/cache');
const eventBus = require('../../kernel/event-bus');

const CACHE_TTL = 120; // 2 minutes

class ContentService {
  async create(data, authorId) {
    const content = await Content.create({ ...data, author: authorId });
    await cache.invalidatePrefix('content:');
    eventBus.publish('content:created', { contentId: content._id, type: content.type });
    return content.populate('author', 'name email');
  }

  async list({ page = 1, limit = 20, status, type, tag, search } = {}) {
    const cacheKey = `content:list:${JSON.stringify({ page, limit, status, type, tag, search })}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const [items, total] = await Promise.all([
      Content.find(filter)
        .populate('author', 'name email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-body'),
      Content.countDocuments(filter),
    ]);

    const result = { items, total, page, limit, pages: Math.ceil(total / limit) };
    await cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findById(id) {
    const cacheKey = `content:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const content = await Content.findById(id).populate('author', 'name email avatar');
    if (!content) throw Object.assign(new Error('Content not found'), { statusCode: 404 });

    await cache.set(cacheKey, content, CACHE_TTL);
    return content;
  }

  async findBySlug(slug) {
    const cacheKey = `content:slug:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const content = await Content.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'name email avatar');

    if (!content) throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    await cache.set(cacheKey, content, CACHE_TTL);
    return content;
  }

  // Preview: any status, requires auth — used by CMS admin
  async previewBySlug(slug) {
    const content = await Content.findOne({ slug })
      .populate('author', 'name email avatar');
    if (!content) throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    return content;
  }

  async update(id, data, userId) {
    const content = await Content.findById(id);
    if (!content) throw Object.assign(new Error('Content not found'), { statusCode: 404 });

    Object.assign(content, data);
    await content.save();
    await cache.del(`content:${id}`);
    await cache.del(`content:slug:${content.slug}`);
    await cache.invalidatePrefix('content:list:');

    eventBus.publish('content:updated', { contentId: id, updatedBy: userId });
    return content.populate('author', 'name email');
  }

  async remove(id) {
    const content = await Content.findByIdAndDelete(id);
    if (!content) throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    await cache.del(`content:${id}`);
    await cache.invalidatePrefix('content:list:');
    eventBus.publish('content:deleted', { contentId: id });
    return content;
  }

  async publish(id, userId) {
    return this.update(id, { status: 'published', publishedAt: new Date() }, userId);
  }
}

module.exports = new ContentService();
