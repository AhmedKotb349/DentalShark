package com.dentalshark.net;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * DentalShark backend connection — the ONLY class you should need to edit
 * when the backend's URL changes.
 * <p>
 * This uses Java's built-in {@code java.net.http.HttpClient} (no extra
 * dependency needed). For parsing the JSON responses, add a small JSON
 * library to your {@code pom.xml} — {@code org.json:json} is the simplest
 * option:
 * <pre>{@code
 * <dependency>
 *     <groupId>org.json</groupId>
 *     <artifactId>json</artifactId>
 *     <version>20250107</version>
 * </dependency>
 * }</pre>
 *
 * Usage:
 * <pre>{@code
 * String productsJson = ApiClient.get("/api/products");
 * JSONArray products = new JSONArray(productsJson);
 *
 * String loginBody = new JSONObject()
 *     .put("email", email)
 *     .put("password", password)
 *     .toString();
 * String loginResponse = ApiClient.post("/api/auth/login", loginBody, null);
 * }</pre>
 */
public final class ApiClient {

    // ↓ Replace with your real deployed backend URL
    public static final String API_BASE_URL = "https://dentalshark-backend.vercel.app";
    // For local development against a backend running on your own machine:
    // public static final String API_BASE_URL = "http://localhost:5000";

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private ApiClient() {}

    public static String get(String path) throws IOException, InterruptedException {
        return get(path, null);
    }

    public static String get(String path, String bearerToken) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(API_BASE_URL + path))
                .timeout(Duration.ofSeconds(15))
                .GET();
        if (bearerToken != null) builder.header("Authorization", "Bearer " + bearerToken);

        HttpResponse<String> response = CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return checkAndReturn(response);
    }

    public static String post(String path, String jsonBody, String bearerToken) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(API_BASE_URL + path))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody));
        if (bearerToken != null) builder.header("Authorization", "Bearer " + bearerToken);

        HttpResponse<String> response = CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return checkAndReturn(response);
    }

    private static String checkAndReturn(HttpResponse<String> response) throws IOException {
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        }
        throw new IOException("Request failed (" + response.statusCode() + "): " + response.body());
    }
}
