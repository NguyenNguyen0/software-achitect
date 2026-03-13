const mongoose = require('mongoose');
const slugify = require('slugify');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    slug: { type: String, unique: true, lowercase: true },
    body: { type: String, required: true },
    excerpt: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    type: {
      type: String,
      enum: ['article', 'page', 'post'],
      default: 'article',
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    featuredImage: { type: String, default: null },
    publishedAt: { type: Date, default: null },
    viewCount: { type: Number, default: 0 },

    // SEO fields (populated by SEO plugin via event)
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Auto-generate slug from title
contentSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) return next();

  let base = slugify(this.title, { lower: true, strict: true });
  let slug = base;
  let count = 1;

  while (await mongoose.model('Content').exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${count++}`;
  }
  this.slug = slug;

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('Content', contentSchema);
