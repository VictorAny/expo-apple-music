package expo.modules.applemusic

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/** Shared HTTP adapter for Apple Music REST (see docs/ANDROID_IMPLEMENTATION.md). */
internal interface AppleMusicRestTransport {
  suspend fun request(
    musicUserToken: String?,
    method: AppleMusicHttpMethod,
    path: String,
    query: Map<String, String> = emptyMap(),
    body: JSONObject? = null,
  ): JSONObject

  suspend fun getJson(
    musicUserToken: String?,
    path: String,
    query: Map<String, String> = emptyMap(),
  ): JSONObject
}

internal class OkHttpAppleMusicRestTransport(
  private val context: Context,
) : AppleMusicRestTransport {
  private val http =
    OkHttpClient.Builder()
      .connectTimeout(30, TimeUnit.SECONDS)
      .readTimeout(30, TimeUnit.SECONDS)
      .build()

  private fun pathRequiresMusicUserToken(path: String): Boolean = path.startsWith("/v1/me/")

  override suspend fun request(
    musicUserToken: String?,
    method: AppleMusicHttpMethod,
    path: String,
    query: Map<String, String>,
    body: JSONObject?,
  ): JSONObject =
    withContext(Dispatchers.IO) {
      val developerToken = AndroidDeveloperToken.requireStored(context)
      val userToken =
        if (pathRequiresMusicUserToken(path)) {
          requireMusicUserToken(musicUserToken)
        } else {
          musicUserToken?.trim()?.takeIf { it.isNotEmpty() }
        }

      val urlBuilder =
        HttpUrl.Builder()
          .scheme("https")
          .host("api.music.apple.com")
          .encodedPath(path)

      query.forEach { (key, value) -> urlBuilder.addQueryParameter(key, value) }

      val jsonMediaType = "application/json".toMediaType()
      val requestBody = body?.toString()?.toRequestBody(jsonMediaType)

      val requestBuilder =
        Request.Builder()
          .url(urlBuilder.build())
          .header("Authorization", "Bearer $developerToken")

      if (!userToken.isNullOrEmpty()) {
        requestBuilder.header("Music-User-Token", userToken)
      }

      when (method) {
        AppleMusicHttpMethod.GET -> requestBuilder.get()
        AppleMusicHttpMethod.POST ->
          requestBuilder.post(requestBody ?: "{}".toRequestBody(jsonMediaType))
        AppleMusicHttpMethod.PUT ->
          requestBuilder.put(requestBody ?: "{}".toRequestBody(jsonMediaType))
        AppleMusicHttpMethod.DELETE ->
          if (requestBody != null) {
            requestBuilder.delete(requestBody)
          } else {
            requestBuilder.delete()
          }
      }

      http.newCall(requestBuilder.build()).execute().use { response ->
        val responseBody = response.body?.string().orEmpty()
        if (!response.isSuccessful) {
          if (response.code == 403) {
            throw AppleMusicErrors.permissionDenied()
          }
          val message =
            try {
              JSONObject(responseBody).optJSONArray("errors")?.optJSONObject(0)?.optString("detail")
            } catch (_: Exception) {
              null
            } ?: "Apple Music API error (${response.code})"
          throw AppleMusicErrors.apiError(message)
        }
        if (responseBody.isEmpty()) {
          return@withContext JSONObject()
        }
        return@withContext JSONObject(responseBody)
      }
    }

  override suspend fun getJson(
    musicUserToken: String?,
    path: String,
    query: Map<String, String>,
  ): JSONObject = request(musicUserToken, AppleMusicHttpMethod.GET, path, query)
}
