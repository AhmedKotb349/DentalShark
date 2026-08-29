package com.dentalshark.desktop;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Serves the bundled, already-built frontend (app/frontend/dist — built
 * with VITE_API_URL pointing at the deployed backend, so every API call
 * the page makes goes straight to that URL) over plain HTTP on
 * localhost. No Node.js involved at all: the backend is already deployed
 * (https://dental-shark.vercel.app), so this app only needs to serve
 * static files, and the JDK already ships an HTTP server that can do
 * that in a few lines — no reason to spawn an external process for it.
 *
 * Serving over http://localhost instead of loading index.html directly
 * via a file:// URL matters here because the Vite build references
 * assets with root-relative paths (e.g. /assets/index-xyz.js) and uses
 * client-side routing — both of which need an actual HTTP root to
 * resolve correctly.
 */
final class LocalStaticServer {

    /**
     * Fixed port, not an OS-assigned random one — deliberately. The app
     * stores its auth token and theme preference in localStorage (see
     * frontend/src/lib/api.js — 'ds_token', 'ds_theme'), and localStorage
     * is scoped per-origin *including port*. A random port each launch
     * would silently log the user out (and reset their theme) every time
     * they reopened the app, since it'd be a "new" origin each time.
     */
    private static final int PREFERRED_PORT = 47821;

    private HttpServer server;
    private int port;

    /** Starts the server (preferring PREFERRED_PORT so localStorage persists across launches) and returns the URL to load. */
    String start() throws IOException {
        Path webRoot = Path.of(System.getProperty("user.dir"), "app", "frontend", "dist");
        if (!Files.exists(webRoot.resolve("index.html"))) {
            throw new IOException(
                "Couldn't find app/frontend/dist/index.html under " + webRoot
                + ". Run this from the project root (where pom.xml lives)."
            );
        }

        try {
            server = HttpServer.create(new InetSocketAddress("127.0.0.1", PREFERRED_PORT), 0);
        } catch (java.net.BindException e) {
            // Preferred port taken (e.g. another instance already running, or a
            // leftover process) — fall back to any free port. Session won't
            // persist across launches in this fallback case, but the app still works.
            server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        }
        port = server.getAddress().getPort();

        server.createContext("/", exchange -> serve(exchange, webRoot));
        server.setExecutor(null); // default executor is fine for a single local client
        server.start();

        return "http://127.0.0.1:" + port + "/";
    }

    void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private void serve(HttpExchange exchange, Path webRoot) throws IOException {
        String requestPath = exchange.getRequestURI().getPath();
        Path file = webRoot.resolve(requestPath.substring(1)).normalize();

        // SPA fallback: any path that isn't a real file on disk (client-side
        // routes like /profile, /products/42, etc.) serves index.html instead,
        // same as the SPA-fallback block in backend/server.js.
        if (!file.startsWith(webRoot) || !Files.exists(file) || Files.isDirectory(file)) {
            file = webRoot.resolve("index.html");
        }

        byte[] bytes = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", contentType(file));
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String contentType(Path file) {
        String name = file.getFileName().toString();
        if (name.endsWith(".html")) return "text/html; charset=utf-8";
        if (name.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (name.endsWith(".css")) return "text/css; charset=utf-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".json")) return "application/json; charset=utf-8";
        return "application/octet-stream";
    }
}
