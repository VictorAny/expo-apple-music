package expo.modules.applemusic

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test

class AppleMusicJsonMapperTest {
  private fun loadFixture(name: String): JSONObject {
    val stream =
      checkNotNull(javaClass.classLoader?.getResourceAsStream("fixtures/$name")) {
        "Missing fixture: $name"
      }
    return JSONObject(stream.bufferedReader().readText())
  }

  @Test
  fun mapSong_catalogResource() {
    val resource = loadFixture("catalog-song.json")
    val song = AppleMusicJsonMapper.mapSong(resource)
    assertEquals("1441164424", song["id"])
    assertEquals("Yesterday", song["title"])
    assertEquals("The Beatles", song["artistName"])
    assertEquals("125000", song["duration"])
    assertEquals(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg",
      song["artworkUrl"],
    )
  }

  @Test
  fun mapAlbum_catalogResource() {
    val resource = loadFixture("catalog-album.json")
    val album = AppleMusicJsonMapper.mapAlbum(resource)
    assertEquals("1441164425", album["id"])
    assertEquals("Help!", album["title"])
    assertEquals("The Beatles", album["artistName"])
    assertEquals("14", album["trackCount"])
  }

  @Test
  fun mapArtist_libraryResource() {
    val resource = loadFixture("library-artist.json")
    val artist = AppleMusicJsonMapper.mapArtist(resource)
    assertEquals("l.abc123", artist["id"])
    assertEquals("The Beatles", artist["name"])
    assertEquals(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg",
      artist["artworkUrl"],
    )
  }
}
