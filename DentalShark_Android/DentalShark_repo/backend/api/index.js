// Vercel serverless entry point. Vercel treats any file under /api as a
// serverless function — exporting the Express app directly (instead of
// calling app.listen()) lets Vercel handle each incoming request by
// invoking this app as a request handler.
//
// This is the ONLY file Vercel actually runs; vercel.json (in the folder
// above this one) routes every request here.
module.exports = require('../app');
