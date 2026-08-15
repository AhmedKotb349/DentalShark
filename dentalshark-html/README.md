# DentalShark — HTML/JS Version

Drop your existing HTML/CSS/JS files into this folder. One file is already
here to help connect to the backend:

## `js/api-config.js`

Include this script tag **before** any of your other JS files that make API
calls:

```html
<script src="js/api-config.js"></script>
<script src="js/your-script.js"></script>
```

It gives you one function, `dentalSharkApi(path, options)`, and one constant,
`API_BASE_URL`, that everything else should route through — so when the
backend's URL changes, you only ever edit it in this one file.

```js
// Example: fetch the product catalog
const products = await dentalSharkApi('/api/products');

// Example: login
const result = await dentalSharkApi('/api/auth/login', {
  method: 'POST',
  body: { email: 'ahmed.kotb@dentalshark.eg', password: '...' },
});
```

If your existing HTML files already call `fetch('/api/...')` directly
(relative paths), replace those calls with `dentalSharkApi('/api/...')`
calls, or at minimum prefix your existing fetch URLs with `API_BASE_URL`.

## Deploying to Vercel

1. Update `API_BASE_URL` in `js/api-config.js` to your real deployed backend
   URL (see `../backend/README.md` for deploying the backend first).
2. Vercel dashboard → **Add New → Project** → import this repo
3. **Root Directory**: `dentalshark-html`
4. Framework Preset: **Other** (static site — no build step needed for
   plain HTML/CSS/JS)
5. Deploy.

Since the backend URL is hardcoded in a JS file (not an environment
variable like the React version), any time you change it you'll need to
edit `js/api-config.js` and push again — there's no dashboard toggle for
this version. If you'd rather it work like the React version (configurable
without touching code), let me know and I can set up a small build step for
that instead.
