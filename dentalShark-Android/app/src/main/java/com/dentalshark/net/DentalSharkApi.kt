package com.dentalshark.net

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

/**
 * Example endpoints matching the backend's real routes. Add more methods
 * here as you wire up more screens — every method just needs to match the
 * path and method (GET/POST/PUT/DELETE) documented in ../backend/README.md.
 */
interface DentalSharkApi {

    @GET("api/products")
    fun getProducts(): Call<List<Map<String, Any>>>

    @POST("api/auth/login")
    fun login(@Body body: LoginRequest): Call<Map<String, Any>>

    @GET("api/orders")
    fun getOrders(@Header("Authorization") bearerToken: String): Call<List<Map<String, Any>>>
}

data class LoginRequest(
    val email: String,
    val password: String,
    val selectedRole: String? = null
)
