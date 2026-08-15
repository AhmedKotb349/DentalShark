// Local dev / traditional-host entry point (Render, Railway, `npm start` on
// your own machine). NOT used on Vercel — Vercel calls api/index.js instead,
// since serverless functions don't call app.listen() themselves.
const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`🦈 DentalShark API running on port ${port}`);
});
