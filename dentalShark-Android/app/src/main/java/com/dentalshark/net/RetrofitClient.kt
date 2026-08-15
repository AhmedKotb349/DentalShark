package com.dentalshark.net

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Builds the shared Retrofit instance used for every API call. Requires
 * adding these to your app-level build.gradle (see ../README.md):
 *   implementation("com.squareup.retrofit2:retrofit:2.11.0")
 *   implementation("com.squareup.retrofit2:converter-gson:2.11.0")
 *   implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
 */
object RetrofitClient {

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val api: DentalSharkApi by lazy { instance.create(DentalSharkApi::class.java) }
}
