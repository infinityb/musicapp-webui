import * as siteapi from 'siteapi'

export const enqueue_next = (song: siteapi.Song) => ({
  type: types.PLAYLIST_ENQUEUE_NEXT,
  song: song,
});


export const enqueue_last = (song: siteapi.Song) => ({
  type: types.PLAYLIST_ENQUEUE_LAST,
  song: song,
});
