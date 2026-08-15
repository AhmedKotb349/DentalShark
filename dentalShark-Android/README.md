# DentalShark — Android Version

Add your existing Android project files into this folder (merge your
`app/`, `build.gradle`, `settings.gradle`, etc. in here — the `app/src/...`
path already started below matches standard Android Studio project layout,
so your files should merge in naturally).

Three files are already here to help connect to the live backend, using
Retrofit (the standard networking library for Android):

- **`ApiConfig.kt`** — the backend URL. This is the only file you should
  need to edit when the backend's URL changes.
- **`RetrofitClient.kt`** — builds the shared Retrofit/OkHttp client.
- **`DentalSharkApi.kt`** — example endpoint definitions matching a few of
  the backend's real routes. Add more `@GET`/`@POST`/etc. methods here as
  you wire up more screens.

## Setup

1. Add these to your **app-level** `build.gradle` (or `build.gradle.kts`):
   ```gradle
   implementation("com.squareup.retrofit2:retrofit:2.11.0")
   implementation("com.squareup.retrofit2:converter-gson:2.11.0")
   implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
   ```
2. Add the internet permission to `AndroidManifest.xml` if it's not already there:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```
3. Update `ApiConfig.BASE_URL` to your real deployed backend URL (see
   `../backend/README.md` for deploying the backend first).

## Usage example

```kotlin
RetrofitClient.api.getProducts().enqueue(object : Callback<List<Map<String, Any>>> {
    override fun onResponse(call: Call<List<Map<String, Any>>>, response: Response<List<Map<String, Any>>>) {
        if (response.isSuccessful) {
            val products = response.body()
            // update your UI here
        }
    }
    override fun onFailure(call: Call<List<Map<String, Any>>>, t: Throwable) {
        // handle network error
    }
})
```

## Testing against a local backend (emulator)

The Android emulator can't reach `localhost` directly — use `10.0.2.2`
instead, which is already noted as a comment in `ApiConfig.kt`. If you're
testing on a **physical device** instead of the emulator, use your
computer's actual local network IP address (e.g. `192.168.1.x`) instead,
and make sure the device is on the same Wi-Fi network as your computer.

## Note on Java vs Kotlin

These files are written in Kotlin, the current standard for Android. If
your existing project is Java-based instead, either convert these three
files to Java (Android Studio can do this automatically: right-click the
file → **Convert Java File to Kotlin File** works in reverse too via
**Code → Convert to Java**, or just ask me and I'll write Java versions
directly), or keep them Kotlin — Android supports mixing Java and Kotlin
in the same project without issues.
