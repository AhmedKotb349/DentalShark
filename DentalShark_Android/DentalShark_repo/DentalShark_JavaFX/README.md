# DentalShark — Desktop App (JavaFX)

## Description

A native desktop app for DentalShark, Egypt's dental equipment
marketplace. Like the mobile app, this wraps the actual production React
frontend — inside a JavaFX window this time — rather than reimplementing
screens in JavaFX/FXML. The window is a real Java application
(`Main.java`, JavaFX `Application`), but what's on screen is the real
DentalShark UI: same components, same styling, same behavior as the live
website.

The app talks to the live deployed backend at:

**https://dental-shark.vercel.app** (Express + MongoDB)

## Topics

- **Language**: Java 21
- **UI toolkit**: JavaFX (`javafx-controls`, `javafx-web`) — the actual window/UI framework
- **Rendering**: JavaFX's `WebView`, which uses a bundled WebKit engine — capable, but older than a real browser; see the compatibility note below
- **Local serving**: the JDK's own built-in `com.sun.net.httpserver.HttpServer` (`jdk.httpserver` module) serves the bundled frontend build over `http://127.0.0.1` — no external web server dependency
- **Backend**: Shared with the mobile app and the live website — Express + MongoDB on Vercel, no separate desktop-only API
- **Data**: Real DentalShark product/user/order data, live from the same database the website uses
- **Build system**: Maven, with the `javafx-maven-plugin` for a one-command run

## Verified before delivery

```
grep -o "dental-shark.vercel.app" app/frontend/dist/assets/index-*.js
```
This confirms the actual compiled JS bundle inside this project calls the real backend — not a placeholder.

## A design decision worth knowing: fixed local port

`LocalStaticServer` serves the app on a **fixed** port (`127.0.0.1:47821`),
not a randomly-assigned one. This matters because the app stores its
login token and theme preference in `localStorage`, which is scoped
per-origin *including port* — a random port each launch would silently
log the user out (and reset their theme) every time the app reopened.

## Opening in NetBeans

1. **File → Open Project**, select this `javafx-app` folder (the one with `pom.xml`).
2. Let NetBeans resolve Maven dependencies (needs internet access to
   Maven Central the first time, to download JavaFX itself).
3. Click **Run** (▶ / F6). `nbactions.xml` tells NetBeans to run this via
   the JavaFX Maven plugin automatically.

## Running outside NetBeans

```bash
cd javafx-app
mvn javafx:run
```
Must be run from this folder — `LocalStaticServer` looks for
`app/frontend/dist` relative to the working directory.

## Updating the bundled frontend

```bash
cd DentalShark_React/frontend
# .env.production already has: VITE_API_URL=https://dental-shark.vercel.app
npm run build
```
then copy the new `dist/` folder over this project's `app/frontend/dist/`.

## If the app window shows a blank white screen

JavaFX's `WebView` runs an older bundled WebKit engine, not full Chrome.
If the window opens but stays blank instead of showing the login page:

1. In `DentalShark_React/frontend/vite.config.js`, add:
   ```js
   build: {
     target: 'es2015',
   },
   ```
2. Rebuild (see above) and copy the new `dist/` in.

## Project layout

```
javafx-app/
  pom.xml                                    Maven build + JavaFX plugin
  nbactions.xml                              Makes NetBeans' Run button work correctly
  src/main/java/module-info.java             JavaFX + jdk.httpserver module declaration
  src/main/java/com/dentalshark/desktop/
    Main.java                                Entry point — starts the local server, opens the WebView
    LocalStaticServer.java                   Serves app/frontend/dist over local HTTP (fixed port)
  app/
    frontend/dist/                           Production build, linked to the deployed backend
```
