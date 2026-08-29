# DentalShark — Mobile App (Android / Kotlin)

## Description

A native Android app for DentalShark, Egypt's dental equipment
marketplace. Rather than re-implementing the UI natively — which we
tried, and which produced a slow, error-prone, visually-drifting app —
this wraps the actual production React frontend inside a native Android
shell using Capacitor. The native entry point (`MainActivity.kt`) is
Kotlin. The screens themselves are the real DentalShark UI: same
components, same styling, same behavior as the live website, because
it's the same build artifact, not a reimplementation.

The app talks to the live deployed backend at:

**https://dental-shark.vercel.app** (Express + MongoDB)

## Topics

- **Language**: Kotlin (native shell), TypeScript/React (the wrapped app, built ahead of time — not edited from this folder)
- **Native shell**: Capacitor 8 — generates and manages the native Android project, bridges the WebView to native APIs
- **Rendering**: Android's system WebView (Chromium-based) — close to real Chrome, unlike JavaFX's engine on the desktop build
- **Backend**: Shared with the desktop app and the live website — Express + MongoDB on Vercel, no separate mobile-only API
- **Data**: Real DentalShark product/user/order data, live from the same database the website uses — not seed/demo data bundled with the app
- **Build system**: Gradle (Kotlin/Groovy DSL), standard Android Studio project structure

## Verified before delivery

```
grep -o "dental-shark.vercel.app" android/app/src/main/assets/public/assets/index-*.js
```
This confirms the actual compiled JS bundle inside the Android project calls the real backend — not a placeholder.

## Running it

1. Open `android/` (this folder's subfolder) in Android Studio.
2. Let Gradle sync — it will also fetch the Kotlin Gradle plugin the first time.
3. Run on an emulator or a physical device. Both work identically, since
   the app just makes normal internet requests to a real hosted API — no
   special emulator addressing needed.

## If you change the React app and need to rebuild

```bash
npm install
npm run build            # .env.production already points at the deployed backend
npx cap sync android      # copies the new build into the Android project
```

## Project layout

```
android-capacitor-app/
  src/                                          React source (reference only — not compiled from here)
  dist/                                         Production build, linked to the deployed backend
  .env.production                               VITE_API_URL=https://dental-shark.vercel.app
  android/                                       Open this in Android Studio
    app/src/main/java/com/dentalshark/app/
      MainActivity.kt                            Kotlin entry point
    app/src/main/assets/public/                  Synced copy of dist/ — what the app actually loads
    build.gradle, app/build.gradle                Kotlin plugin + stdlib added
```
