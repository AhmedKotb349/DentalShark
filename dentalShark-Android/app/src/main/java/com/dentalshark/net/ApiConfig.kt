package com.dentalshark.net

/**
 * DentalShark backend connection — the ONLY file you should need to edit
 * when the backend's URL changes.
 */
object ApiConfig {
    // ↓ Replace with your real deployed backend URL
    const val BASE_URL = "https://dentalshark-backend.vercel.app/"
    // For local development against a backend running on your own machine
    // (use 10.0.2.2 instead of localhost when testing on the Android emulator):
    // const val BASE_URL = "http://10.0.2.2:5000/"
}
