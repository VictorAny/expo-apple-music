import { readFileSync } from 'fs';
import { join } from 'path';
import type { AppleMusicApiResource } from '../apple-music-json-mapper';
import { mapAlbum, mapArtist, mapSong } from '../apple-music-json-mapper';

function loadFixture(name: string): AppleMusicApiResource {
  const path = join(__dirname, '../../../fixtures', name);
  return JSON.parse(readFileSync(path, 'utf8')) as AppleMusicApiResource;
}

const catalogSong = loadFixture('catalog-song.json');
const catalogAlbum = loadFixture('catalog-album.json');
const libraryArtist = loadFixture('library-artist.json');

describe('apple-music-json-mapper', () => {
  it('maps catalog song fixtures', () => {
    expect(mapSong(catalogSong)).toEqual({
      id: '1441164424',
      title: 'Yesterday',
      artistName: 'The Beatles',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg',
      duration: '125000',
    });
  });

  it('maps catalog album fixtures', () => {
    expect(mapAlbum(catalogAlbum)).toEqual({
      id: '1441164425',
      title: 'Help!',
      artistName: 'The Beatles',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg',
      trackCount: '14',
    });
  });

  it('maps library artist fixtures', () => {
    expect(mapArtist(libraryArtist)).toEqual({
      id: 'l.abc123',
      name: 'The Beatles',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music/200x200bb.jpg',
    });
  });
});
