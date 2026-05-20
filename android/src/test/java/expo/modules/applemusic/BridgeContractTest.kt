package expo.modules.applemusic

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Kotlin adapter parity with [fixtures/expected] and TypeScript bridge-contract tests.
 */
class BridgeContractTest {
  private fun loadApiFixture(name: String): JSONObject {
    val stream =
      checkNotNull(javaClass.classLoader?.getResourceAsStream("fixtures/$name")) {
        "Missing fixture: $name (run: npm run sync:fixtures)"
      }
    return JSONObject(stream.bufferedReader().readText())
  }

  @Test
  fun mapSong_catalogResource() {
    val song = AppleMusicJsonMapper.mapSong(loadApiFixture("catalog-song.json"))
    assertEquals("1441164424", song["id"])
    assertEquals("Yesterday", song["title"])
    assertEquals("The Beatles", song["artistName"])
    assertEquals(125000L, song["duration"])
    assertEquals(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg",
      song["artworkUrl"],
    )
  }

  @Test
  fun mapAlbum_catalogResource() {
    val album = AppleMusicJsonMapper.mapAlbum(loadApiFixture("catalog-album.json"))
    assertEquals("1441164425", album["id"])
    assertEquals("Help!", album["title"])
    assertEquals("The Beatles", album["artistName"])
    assertEquals(14, album["trackCount"])
  }

  @Test
  fun mapArtist_libraryResource() {
    val artist = AppleMusicJsonMapper.mapArtist(loadApiFixture("library-artist.json"))
    assertEquals("l.abc123", artist["id"])
    assertEquals("The Beatles", artist["name"])
  }

  @Test
  fun mapPlaylist_catalogResource() {
    val playlist = AppleMusicJsonMapper.mapPlaylist(loadApiFixture("catalog-playlist.json"))
    assertEquals("pl.abc123", playlist["id"])
    assertEquals("My Playlist", playlist["name"])
    assertEquals("A test playlist", playlist["description"])
    assertEquals(42, playlist["trackCount"])
  }

  @Test
  fun mapRecentResource_libraryAlbum() {
    val item = AppleMusicJsonMapper.mapRecentResource(loadApiFixture("library-recent-album.json"))
    assertEquals("l.album456", item["id"])
    assertEquals("Abbey Road", item["title"])
    assertEquals("The Beatles", item["subtitle"])
    assertEquals("album", item["type"])
  }

  @Test
  fun mapRating_like() {
    val rating = AppleMusicJsonMapper.mapRating(loadApiFixture("ratings-response.json"))
    assertEquals("1441164424", rating?.get("id"))
    assertEquals(1, rating?.get("value"))
  }
}
