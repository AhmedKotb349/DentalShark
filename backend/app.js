const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Database ─────────────────────────────────────────────────
// jsonDb.js self-seeds on first read (see initDB() inside it) — no separate
// seed step needed here, which matters on Vercel specifically: spawning
// child processes or relying on multi-step boot logic doesn't fit the
// serverless request/response model the way it does on a traditional
// always-on server.
const db = require('./jsonDb');

// ─── File uploads ─────────────────────────────────────────────
// NOTE: this writes to local disk, which works fine on a traditional host
// (Render/Railway/local) but NOT reliably on Vercel — serverless functions
// only get a writable /tmp, and it isn't shared or persistent between
// invocations. If you deploy this backend to Vercel and need file uploads
// to actually work, swap this for a cloud storage upload (e.g. Cloudinary)
// instead of multer.diskStorage. Left as-is here since it still works
// correctly on Render/Railway without any changes.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) { /* read-only fs (e.g. Vercel) — ignore */ }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ─── API Routes ───────────────────────────────────────────────
const authRoutes      = require('./routes/auth.route');
const orderRoutes     = require('./routes/orders.route');
const socialRoutes    = require('./routes/social.route');
const usersRoutes     = require('./routes/users.route');
const suppliersRoutes = require('./routes/suppliers.route');
const productsRoutes  = require('./routes/products.route');
const bookingsRoutes  = require('./routes/bookings.route');

app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/social',    socialRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/products',  productsRoutes);        // POST/PUT/DELETE — GET / stays below for the full catalog
app.use('/api/service-bookings', bookingsRoutes);  // Repairs: persisted, listable, status-updatable

// Products — always from db
app.get('/api/products', (req, res) => {
  try {
    const products = db.products.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// AI Analysis endpoint (demo data — no real image analysis is performed)
app.post('/api/analyze', upload.single('xray'), (req, res) => {
  const results = {
    accuracy: '98.2%',
    findings: [
      { tooth: '26', issue: 'Caries detected — mesial surface (Stage II)', confidence: 0.95 },
      { tooth: '36', issue: 'Periapical radiolucency suspected', confidence: 0.88 },
      { tooth: '48', issue: 'Impacted third molar — Class II mesioangular', confidence: 0.99 },
    ],
    normal: [
      'Bone levels within normal limits — Lower anterior',
      'No additional impacted teeth detected',
      'Sinus outlines appear clear bilaterally',
      'Condylar morphology within normal range',
    ],
    treatmentPlan: [
      { tooth: '48', treatment: 'Surgical extraction of impacted wisdom tooth', priority: 'Urgent' },
      { tooth: '26', treatment: 'Composite restoration — mesial surface', priority: 'Soon' },
      { tooth: '36', treatment: 'Periapical radiograph + Root canal evaluation', priority: 'Monitor' },
    ],
    recommendations: 'Schedule follow-up in 3 months. Improve oral hygiene in posterior regions. Consider panoramic X-ray annually.',
  };
  res.json({ success: true, results });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: 'JSON Storage Connected', timestamp: new Date().toISOString() });
});

// Root — this backend is deployed standalone (no frontend co-located), so it
// always just identifies itself as an API rather than trying to serve a
// frontend build.
app.get('/', (req, res) => {
  res.json({ message: 'DentalShark API', status: 'OK' });
});

module.exports = app;
