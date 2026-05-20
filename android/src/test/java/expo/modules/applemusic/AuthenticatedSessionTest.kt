package expo.modules.applemusic

import expo.modules.kotlin.exception.CodedException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthenticatedSessionTest {
  @Test
  fun `hasRestCredentials requires both tokens`() {
    assertFalse(AuthenticatedSession(null, null).hasRestCredentials)
    assertFalse(AuthenticatedSession("dev", null).hasRestCredentials)
    assertFalse(AuthenticatedSession(null, "user").hasRestCredentials)
    assertTrue(AuthenticatedSession("dev", "user").hasRestCredentials)
  }

  @Test
  fun `requireRestCredentials throws when incomplete`() {
    try {
      AuthenticatedSession("dev", null).requireRestCredentials()
      error("expected missingTokens")
    } catch (e: CodedException) {
      assertTrue(e.message?.contains("authorize", ignoreCase = true) == true)
    }
  }

  @Test
  fun `requireRestCredentials returns pair when complete`() {
    val creds = AuthenticatedSession("dev-jwt", "user-token").requireRestCredentials()
    assertEquals("dev-jwt", creds.developerToken)
    assertEquals("user-token", creds.musicUserToken)
  }
}
