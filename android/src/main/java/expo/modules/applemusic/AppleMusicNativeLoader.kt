package expo.modules.applemusic

import android.util.Log

/**
 * Loads Apple Music playback natives. Must run before [MediaPlayerControllerFactory].
 * See Apple / community samples for the bytedeco memory properties.
 */
internal object AppleMusicNativeLoader {
  private const val TAG = "ExpoAppleMusic"

  @Volatile
  private var loaded = false

  fun ensureLoaded() {
    if (loaded) return
    synchronized(this) {
      if (loaded) return
      try {
        System.setProperty("org.bytedeco.javacpp.maxphysicalbytes", "0")
        System.setProperty("org.bytedeco.javacpp.maxbytes", "0")
        System.loadLibrary("c++_shared")
        System.loadLibrary("appleMusicSDK")
        loaded = true
        Log.i(TAG, "native libraries loaded")
      } catch (error: UnsatisfiedLinkError) {
        Log.e(TAG, "failed to load playback natives", error)
        throw error
      }
    }
  }
}
