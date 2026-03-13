const { Router } = require('express');
const { authenticate, authorize } = require('./middleware/auth');
const userCtrl = require('./modules/users/controller');
const contentCtrl = require('./modules/content/controller');
const { upload } = require('./infrastructure/storage');
const path = require('path');

const router = Router();

// ─── Health ──────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', userCtrl.register.bind(userCtrl));
router.post('/auth/login',    userCtrl.login.bind(userCtrl));
router.get('/auth/me',        authenticate, userCtrl.me.bind(userCtrl));

// ─── Users (admin only) ───────────────────────────────────────────────────────
router.get('/users',          authenticate, authorize('admin'), userCtrl.list.bind(userCtrl));
router.patch('/users/:id',    authenticate, authorize('admin'), userCtrl.update.bind(userCtrl));
router.delete('/users/:id',   authenticate, authorize('admin'), userCtrl.remove.bind(userCtrl));

// ─── Content (public reads, auth writes) ──────────────────────────────────────
router.get('/content',               contentCtrl.list.bind(contentCtrl));
router.get('/content/slug/:slug',    contentCtrl.findBySlug.bind(contentCtrl));
router.get('/content/:id',           contentCtrl.findById.bind(contentCtrl));

router.post('/content',              authenticate, authorize('author', 'editor', 'admin'), contentCtrl.create.bind(contentCtrl));
router.patch('/content/:id',         authenticate, authorize('author', 'editor', 'admin'), contentCtrl.update.bind(contentCtrl));
router.post('/content/:id/publish',  authenticate, authorize('editor', 'admin'), contentCtrl.publish.bind(contentCtrl));
router.delete('/content/:id',        authenticate, authorize('editor', 'admin'), contentCtrl.remove.bind(contentCtrl));

// ─── File upload ──────────────────────────────────────────────────────────────
router.post('/upload',
  authenticate,
  authorize('author', 'editor', 'admin'),
  upload.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      },
    });
  }
);

module.exports = router;
