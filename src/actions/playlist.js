import * as siteapi from 'siteapi'
import * as types from 'constants/actionTypes'

export const queue_add_next = (song: siteapi.Song) => ({
  type: types.PLAYLIST_QUEUE_ADD_NEXT,
  song: song,
});

export const queue_add_last = (song: siteapi.Song) => ({
  type: types.PLAYLIST_QUEUE_ADD_LAST,
  song: song,
});

export const queue_jump_to = (index: number) => ({
  type: types.PLAYLIST_QUEUE_JUMP_TO,
  index: index,
});

export const queue_remove = (index: number) => ({
  type: types.PLAYLIST_QUEUE_REMOVE,
  index: index,
});

export const increment_index = () => ({
  type: types.PLAYLIST_MOVE_NEXT,
});

export const noop = () => ({
  type: types.PLAYLIST_NOOP,
});