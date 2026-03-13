require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/default');
const User = require('../src/modules/users/model');
const Content = require('../src/modules/content/model');

const USERS = [
  { name: 'Admin User',   email: 'admin@cms.dev',  password: 'Admin1234!', role: 'admin'  },
  { name: 'Jane Editor',  email: 'editor@cms.dev', password: 'Editor123!', role: 'editor' },
  { name: 'Bob Author',   email: 'author@cms.dev', password: 'Author123!', role: 'author' },
];

const ARTICLES = (authorId) => [
  {
    title: 'Getting Started with Node.js CMS',
    body: 'Node.js is a powerful runtime for building scalable server-side applications. This CMS leverages its async capabilities along with MongoDB to deliver fast content delivery. The microkernel architecture ensures that plugins are loaded without affecting core stability. You can extend the system by writing new plugins that hook into the event bus.',
    excerpt: 'Learn how to build a CMS with Node.js and MongoDB using microkernel architecture.',
    status: 'published',
    type: 'article',
    tags: ['nodejs', 'cms', 'mongodb', 'tutorial'],
    author: authorId,
  },
  {
    title: 'Understanding Microkernel Architecture',
    body: 'The microkernel pattern separates a minimal functional core from extended functionality. In our CMS, the kernel manages plugin registration and event routing. Business modules like content and users are thin layers that communicate through events. This makes the system highly extensible: drop a new plugin folder, register it in app.js, and it hooks into the lifecycle immediately.',
    excerpt: 'Deep dive into microkernel architecture and how it applies to modern CMS systems.',
    status: 'published',
    type: 'article',
    tags: ['architecture', 'microkernel', 'design-patterns'],
    author: authorId,
  },
  {
    title: 'Draft: Advanced MongoDB Aggregations',
    body: 'MongoDB aggregation pipelines allow complex data transformations at the database level. Using $lookup, $group, and $project stages together can replace multiple application-level queries with a single efficient pipeline run.',
    excerpt: 'A guide to building advanced aggregation pipelines in MongoDB.',
    status: 'draft',
    type: 'article',
    tags: ['mongodb', 'database', 'aggregation'],
    author: authorId,
  },
];

async function seed() {
  await mongoose.connect(config.db.uri);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Content.deleteMany({});
  console.log('Cleared existing data');

  const users = await User.create(USERS);
  console.log(`Created ${users.length} users`);

  const admin = users.find((u) => u.role === 'admin');
  const articles = await Content.create(ARTICLES(admin._id));
  console.log(`Created ${articles.length} articles`);

  console.log('\n✅ Seed complete!\n');
  console.log('Login credentials:');
  USERS.forEach(({ email, password, role }) =>
    console.log(`  [${role}] ${email} / ${password}`)
  );

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
