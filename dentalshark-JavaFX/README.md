# DentalShark — JavaFX Desktop Version

Add your existing JavaFX project files into this folder (merge your
`src/`, `pom.xml`, etc. in here). One file is already here to help connect
to the live backend:

## `src/main/java/com/dentalshark/net/ApiClient.java`

A small HTTP client using Java's built-in `java.net.http.HttpClient` — no
extra dependency needed for the networking itself. Update
`API_BASE_URL` at the top to your real deployed backend URL (see
`../backend/README.md` for deploying the backend first).

```java
String productsJson = ApiClient.get("/api/products");
```

For parsing the JSON responses you get back, add a small JSON library to
your `pom.xml` — see the comment at the top of `ApiClient.java` for the
simplest option (`org.json:json`).

## If your existing JavaFX app currently uses only an in-memory `DataStore`

If the JavaFX version you're merging in was built around a purely
in-memory data layer (a Singleton `DataStore` with no networking at all —
this is how an earlier version of this project's JavaFX build worked), you
have two options:

1. **Keep it fully offline** — leave it as-is, don't wire up `ApiClient` at
   all. It won't share data with the web versions, but it's simpler and
   still demonstrates the same design patterns.
2. **Wire it to the shared backend** — replace the `DataStore`'s internal
   methods (`getProducts()`, `addOrder()`, etc.) with calls through
   `ApiClient` to the real API, so orders/users are shared with the React
   and HTML versions. This is more work but means all versions share one
   real dataset.

Let me know which direction you want and I can do the wiring for option 2.

## Packaging / running

This folder structure assumes a Maven project (so it can be opened directly
in NetBeans via **File → Open Project**). If your existing JavaFX files use
a different build setup (plain Ant/NetBeans project, Gradle, etc.), keep
your original build files — just make sure `ApiClient.java` ends up
somewhere in your source tree and update its package declaration to match
your project's package structure if it differs from `com.dentalshark.net`.
